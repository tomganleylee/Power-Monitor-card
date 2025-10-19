# Data Model: Home Assistant Energy Flow Visualization Card

**Feature**: `001-energy-flow-card`
**Date**: 2025-10-15
**Source**: Extracted from [spec.md](spec.md) Key Entities section

## Overview

This document defines the data structures used by the Energy Flow Visualization Card. All models are TypeScript interfaces representing client-side state. No backend storage is required.

---

## Core Entities

### 1. EnergyFlowCardConfig

**Description**: User configuration for the card, persisted in Home Assistant's Lovelace configuration and browser localStorage.

**TypeScript Interface**:
```typescript
interface EnergyFlowCardConfig {
  type: 'custom:energy-flow-card';

  // Energy sources (optional - nodes hidden if not configured)
  entities?: {
    solar?: string;          // Entity ID (e.g., 'sensor.solar_power')
    battery?: string;        // Entity ID
    battery_soc?: string;    // State of charge % (optional)
    battery_capacity?: string; // Total kWh capacity (optional)
    grid?: string;           // Entity ID
  };

  // Consumption devices (max 25 total)
  devices?: DeviceConfig[];

  // Device categories (max 10)
  categories?: CategoryConfig[];

  // Display options
  update_interval?: number;  // 1-5 seconds, default 2
  show_statistics?: boolean; // Default false
  min_height?: number;       // CSS pixels
  max_height?: number;       // CSS pixels

  // Warning thresholds
  warnings?: {
    battery_low?: number;    // % threshold
    grid_import?: number;    // kW threshold
    custom?: WarningConfig[];
  };

  // Visual customization
  theme?: {
    solar_color?: string;    // Default '#fbbf24' (yellow/orange)
    battery_color?: string;  // Default '#10b981' (green)
    grid_color?: string;     // Default '#ef4444' (red/blue)
  };
}
```

**Validation Rules**:
- `type` must be `'custom:energy-flow-card'`
- `devices.length <= 25`
- `categories.length <= 10`
- `update_interval` between 1 and 5 seconds
- Entity IDs must match pattern `^(sensor|binary_sensor)\.\w+$`

**Relationships**:
- Contains array of `DeviceConfig` (composition)
- Contains array of `CategoryConfig` (composition)
- Contains optional `WarningConfig` array (composition)

---

### 2. DeviceConfig

**Description**: Configuration for a single monitored device or circuit.

**TypeScript Interface**:
```typescript
interface DeviceConfig {
  id: string;              // Unique identifier (generated or user-provided)
  entity_id: string;       // Home Assistant sensor entity
  name?: string;           // Display name (defaults to entity friendly name)
  icon?: string;           // MDI icon name (e.g., 'mdi:lightbulb')
  category?: string;       // Category ID (optional, for grouping)

  // Hierarchical power calculation
  parent_circuit?: string; // Entity ID of parent circuit (for subtraction)

  // Display options
  show_when_off?: boolean; // Show device even when 0W (default true)
}
```

**Validation Rules**:
- `id` must be unique within card
- `entity_id` must exist in Home Assistant
- `category` must reference existing category ID
- Device can belong to max 1 category (single-level nesting)

**Relationships**:
- Optional parent: `CategoryConfig` (via `category` field)
- Optional parent: `DeviceConfig` (via `parent_circuit` field for hierarchical calculation)

---

### 3. CategoryConfig

**Description**: Grouping for related devices (e.g., "Network and Servers", "AC Units").

**TypeScript Interface**:
```typescript
interface CategoryConfig {
  id: string;              // Unique identifier
  name: string;            // Display name
  icon?: string;           // MDI icon name
  collapsed: boolean;      // UI state (runtime only, resets on page load)

  // Optional: category can have a circuit sensor for hierarchical calculation
  circuit_entity?: string; // Entity ID of monitoring circuit
}
```

**Validation Rules**:
- `id` must be unique within card
- Max 10 categories per card
- Cannot contain sub-categories (single-level nesting only)

**Relationships**:
- Contains multiple `DeviceConfig` (aggregation via `DeviceConfig.category`)

---

### 4. WarningConfig

**Description**: User-defined threshold for visual warnings.

**TypeScript Interface**:
```typescript
interface WarningConfig {
  id: string;
  condition: 'above' | 'below';
  entity_id: string;       // Entity to monitor
  threshold: number;       // Threshold value
  message?: string;        // Optional custom message
}
```

---

## Runtime State Entities

These entities exist only in memory during card operation (not persisted).

### 5. EnergySourceNode

**Description**: Runtime state for power generation/storage sources (solar, battery, grid).

**TypeScript Interface**:
```typescript
interface EnergySourceNode {
  type: 'solar' | 'battery' | 'grid' | 'hub';
  entityId: string;

  // Current state
  powerWatts: number;      // Current power (negative = export/charging)
  isActive: boolean;       // Producing/supplying power (>0.5kW)
  isStale: boolean;        // No updates for 60+ seconds
  lastUpdated: number;     // Timestamp (ms)

  // Display
  displayValue: string;    // Formatted (e.g., "2.8kW")
  displayUnit: string;     // "W", "kW", or "MW"
  color: string;           // Theme color
  icon: string;            // MDI icon

  // Layout (calculated by LayoutEngine)
  x: number;               // Canvas x position
  y: number;               // Canvas y position
  radius: number;          // Node visual radius
}
```

**State Transitions**:
- `isActive`: true when `powerWatts > 0.5`, false otherwise
- `isStale`: true when `Date.now() - lastUpdated > 60000`

**Special Cases**:
- **Battery**: Can have negative power (charging) or positive (discharging)
- **Grid**: Negative power = export, positive = import
- **Hub**: Always shows total consumption (sum of all devices)

---

### 6. ConsumptionDeviceNode

**Description**: Runtime state for consumption devices/circuits.

**TypeScript Interface**:
```typescript
interface ConsumptionDeviceNode {
  id: string;
  entityId: string;
  name: string;

  // Current state
  powerWatts: number;      // Always positive (consumption)
  isStale: boolean;
  lastUpdated: number;

  // Display
  displayValue: string;
  displayUnit: string;
  icon: string;

  // Grouping
  categoryId?: string;     // Parent category

  // Hierarchical calculation (for categories)
  children?: ConsumptionDeviceNode[]; // Devices in this category
  calculatedRemainder?: number;        // Circuit total - sum(children)

  // Layout
  x: number;
  y: number;
  radius: number;
  isVisible: boolean;      // Hidden when category collapsed
}
```

**Calculated Fields**:
- `calculatedRemainder`: For category nodes with `circuit_entity`, computed as:
  ```typescript
  calculatedRemainder = circuitPowerWatts - sum(children.map(c => c.powerWatts))
  ```

**Hierarchy Rules**:
- Devices without `categoryId` appear at top level
- Devices with `categoryId` nested under category node
- Category nodes show sum of all children
- Single-level nesting only (no categories within categories)

---

### 7. EnergyFlowParticle

**Description**: Visual representation of power transfer between nodes.

**TypeScript Interface**:
```typescript
interface EnergyFlowParticle {
  // Unique ID for object pooling
  id: number;

  // Path
  sourceNode: EnergySourceNode | ConsumptionDeviceNode;
  targetNode: EnergySourceNode | ConsumptionDeviceNode;

  // Animation state
  progress: number;        // 0.0 to 1.0 along path
  speed: number;           // Pixels per frame
  lifetime: number;        // Frames until particle removed

  // Visual
  x: number;               // Current canvas position
  y: number;
  color: string;           // Inherited from source node
  radius: number;          // Particle size (2-4px)
  opacity: number;         // 0.0 to 1.0

  // State
  isActive: boolean;       // False when ready for pooling
}
```

**Lifecycle**:
1. **Spawn**: Acquired from particle pool, initialized at source node position
2. **Update**: Each frame, increment `progress` by `speed`, update `x`/`y` along Bezier curve
3. **Death**: When `progress >= 1.0`, set `isActive = false`, return to pool
4. **Pooling**: Reuse particle objects to avoid GC pauses

**Spawn Rate Calculation**:
```typescript
function calculateSpawnRate(powerWatts: number): number {
  // 1 particle per 100W, clamped to 1-10 particles/second
  return Math.max(1, Math.min(10, powerWatts / 100));
}
```

---

### 8. StatisticsPanel

**Description**: Calculated energy metrics displayed at bottom of card (optional).

**TypeScript Interface**:
```typescript
interface StatisticsPanel {
  efficiency: number;         // % (0-100)
  selfSufficiency: number;    // % (0-100)
  dailySavings: number;       // Currency amount

  // Calculation inputs
  totalGeneration: number;    // Solar + battery discharge (W)
  totalConsumption: number;   // Sum of all devices (W)
  gridImport: number;         // From grid (W, 0 if exporting)
}
```

**Calculation Formulas**:
```typescript
// Self-sufficiency: % of consumption met by local generation
selfSufficiency = ((totalConsumption - gridImport) / totalConsumption) * 100

// Efficiency: generation utilization (simplified metric)
efficiency = (totalConsumption / totalGeneration) * 100

// Daily savings: requires grid rate sensor (optional)
dailySavings = (totalGeneration - gridImport) * gridRate * hoursElapsed
```

---

### 9. SensorState

**Description**: Normalized state from Home Assistant entity.

**TypeScript Interface**:
```typescript
interface SensorState {
  entityId: string;
  value: number;           // Numeric value (NaN if unavailable)
  unit: string;            // "W", "kW", "%", etc.
  isStale: boolean;        // True if no update for 60s
  isUnavailable: boolean;  // True if entity state = "unavailable"
  lastUpdated: number;     // Timestamp (ms)
  lastValidValue?: number; // Cached for stale detection
}
```

**State Machine**:
```
[Normal] --60s timeout--> [Stale] --60s timeout--> [Unavailable]
   |                         |                          |
   +-- new update -----------+--------------------------+
                              |
                         [Normal]
```

---

## Validation & Constraints

### Card-Wide Limits
- Maximum 25 devices (enforced in config validation)
- Maximum 10 categories (enforced in config validation)
- Maximum 150 active particles (enforced in ParticleEngine)
- Update interval: 1-5 seconds (enforced in config validation)

### Entity Relationships
- Device ↔ Category: Many-to-One (device belongs to max 1 category)
- Category ↔ Device: One-to-Many (category contains multiple devices)
- Device ↔ ParentCircuit: Many-to-One (for hierarchical calculation)

### State Consistency
- `ConsumptionDeviceNode.calculatedRemainder` must be non-negative
  - If negative (measurement error), clamp to 0 and log warning
- Particle `sourceNode` and `targetNode` must exist in current node list
  - Orphaned particles removed on node configuration change

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ EnergyFlowCardConfig (Lovelace YAML + localStorage)            │
└────────────────┬────────────────────────────────────────────────┘
                 │ parsed by
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ SensorManager                                                   │
│ - Subscribes to Home Assistant entities via WebSocket          │
│ - Converts HassEntity → SensorState                            │
│ - Detects stale data (60s timeout)                             │
└────────────────┬────────────────────────────────────────────────┘
                 │ emits state updates
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ NodeManager                                                     │
│ - Converts SensorState → EnergySourceNode / ConsumptionDeviceNode│
│ - Calculates hierarchical power (circuit - children)           │
│ - Applies layout (LayoutEngine with d3-force)                  │
└────────────────┬────────────────────────────────────────────────┘
                 │ nodes ready
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ ParticleEngine                                                  │
│ - Spawns particles based on power flow                         │
│ - Animates particles along Bezier curves                       │
│ - Object pooling for performance                               │
└────────────────┬────────────────────────────────────────────────┘
                 │ renders to
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Canvas (HTML5 Canvas 2D Context)                               │
│ - Draws nodes, particles, labels                               │
│ - Handles user interactions (expand/collapse)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Example JSON Representation

### Card Configuration
```json
{
  "type": "custom:energy-flow-card",
  "entities": {
    "solar": "sensor.solar_power",
    "battery": "sensor.battery_power",
    "battery_soc": "sensor.battery_soc",
    "grid": "sensor.grid_power"
  },
  "devices": [
    {
      "id": "lights",
      "entity_id": "sensor.lights_power",
      "name": "Lights",
      "icon": "mdi:lightbulb"
    },
    {
      "id": "ac-1",
      "entity_id": "sensor.ac_living_room",
      "name": "Living Room AC",
      "icon": "mdi:air-conditioner",
      "category": "ac-category"
    },
    {
      "id": "ac-2",
      "entity_id": "sensor.ac_bedroom",
      "name": "Bedroom AC",
      "icon": "mdi:air-conditioner",
      "category": "ac-category"
    },
    {
      "id": "tv",
      "entity_id": "sensor.tv_power",
      "name": "TV",
      "parent_circuit": "sensor.sockets_circuit"
    },
    {
      "id": "computer",
      "entity_id": "sensor.computer_power",
      "name": "Computer",
      "parent_circuit": "sensor.sockets_circuit"
    }
  ],
  "categories": [
    {
      "id": "ac-category",
      "name": "AC Units",
      "icon": "mdi:snowflake",
      "circuit_entity": "sensor.hvac_circuit"
    }
  ],
  "update_interval": 2,
  "show_statistics": true,
  "warnings": {
    "battery_low": 20,
    "grid_import": 5
  }
}
```

### Runtime Node State (example)
```json
{
  "type": "solar",
  "entityId": "sensor.solar_power",
  "powerWatts": 2800,
  "isActive": true,
  "isStale": false,
  "lastUpdated": 1697389200000,
  "displayValue": "2.8",
  "displayUnit": "kW",
  "color": "#fbbf24",
  "icon": "mdi:solar-power",
  "x": 120,
  "y": 250,
  "radius": 60
}
```

---

## Persistence Strategy

**Lovelace Configuration** (Persistent):
- Stored in Home Assistant's `.storage/lovelace` file
- Contains `EnergyFlowCardConfig`
- Synced across devices via Home Assistant

**Browser localStorage** (Persistent):
- Duplicate config storage for offline access
- Key format: `energy-flow-card:{cardId}`
- Falls back to Lovelace config if missing

**Runtime State** (Ephemeral):
- All `*Node` and `*Particle` entities exist only in memory
- Rebuilt from config + live sensor data on page load
- No persistence required

---

## Next Steps

Data model complete. Proceed to:
1. Generate API contracts (card-config.schema.json)
2. Generate quickstart.md
3. Update agent context
