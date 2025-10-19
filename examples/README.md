# Energy Flow Card Configuration Examples

This directory contains example configurations for the Energy Flow Card. Choose the example that best matches your setup and customize it with your own entity IDs.

## Examples Overview

### 1. Basic Example (`01-basic-example.yaml`)
**Best for:** Simple setups with a few individual devices

A straightforward configuration showing:
- Solar, battery, and grid energy sources
- Individual devices displayed directly (no categories)
- Basic visualization settings

**Features:**
- ✅ Simple flat device list
- ✅ Individual device monitoring
- ✅ Particle animation
- ❌ No device grouping

---

### 2. With Categories (`02-with-categories.yaml`)
**Best for:** Homes with many devices that need organization

Groups devices into collapsible categories:
- Kitchen Appliances
- Entertainment
- HVAC
- Home Office

**Features:**
- ✅ Click categories to expand/collapse
- ✅ Better organization for many devices
- ✅ Mix of categorized and standalone devices
- ✅ Visual hierarchy

**How it works:**
1. Define categories with `id`, `name`, and `icon`
2. Assign devices to categories using the `category` field
3. Click a category node on the card to collapse/expand it
4. Devices without a `category` appear as standalone nodes

---

### 3. With Circuit Tracking (`03-with-circuit-tracking.yaml`)
**Best for:** Advanced setups with circuit-level monitoring

Uses circuit breaker sensors to track entire circuits:
- Monitors total circuit power
- Tracks individual devices on each circuit
- **Automatically calculates "remainder"** (unknown devices)

**Features:**
- ✅ Circuit-level monitoring
- ✅ Identifies unknown power consumption
- ✅ Shows "Other [Circuit Name]" for untracked devices
- ✅ Both particles and Sankey visualization

**How it works:**
1. Add a `circuit_entity` to each category (e.g., `sensor.kitchen_circuit_power`)
2. Assign devices to that category
3. The card calculates: `Remainder = Circuit Total - Sum of Known Devices`
4. If remainder > 10W, an "Other [Category]" node appears

**Example:**
```yaml
categories:
  - id: kitchen_circuit
    name: Kitchen Circuit
    icon: 🍳
    circuit_entity: sensor.kitchen_circuit_power  # 800W total

devices:
  - id: fridge
    entity_id: sensor.fridge_power  # 150W
    category: kitchen_circuit
  - id: dishwasher
    entity_id: sensor.dishwasher_power  # 0W (off)
    category: kitchen_circuit
  # Remainder = 800W - 150W = 650W
  # Card shows "Other Kitchen Circuit: 650W"
```

---

### 4. Sankey Visualization (`04-sankey-visualization.yaml`)
**Best for:** Users who prefer flow diagrams over particles

Uses Sankey diagram with colored flowing bands:
- Shows energy flow as proportional colored bands
- No animated particles
- Clean, data-focused visualization

**Features:**
- ✅ Sankey flow diagram style
- ✅ Flow widths proportional to power
- ✅ Color-coded by energy source
- ✅ Good for larger displays

**Visualization Modes:**
- `particles` - Animated particles (default)
- `sankey` - Sankey flow bands
- `both` - Both particles and Sankey together

---

### 5. Minimal (`05-minimal.yaml`)
**Best for:** Simple setups or testing

Bare minimum configuration:
- Just energy sources (solar, battery, grid)
- Optional total home load
- No individual device tracking

**Features:**
- ✅ Quickest to set up
- ✅ Low maintenance
- ✅ Focus on energy sources only
- ❌ No device-level detail

---

## Configuration Reference

### Main Sections

#### `entities` (required)
Energy source sensors:
```yaml
entities:
  solar: sensor.solar_power                  # Solar panel output (W)
  battery: sensor.battery_power              # Battery charge/discharge (W, +/-)
  battery_soc: sensor.battery_soc            # Battery state of charge (%)
  battery_capacity: 13.5                     # Battery capacity in kWh
  grid: sensor.grid_power                    # Grid import/export (W, +/-)
```

#### `devices` (optional)
Individual consumption devices:
```yaml
devices:
  - id: unique_id                    # Unique identifier
    entity_id: sensor.device_power   # Power sensor entity
    name: Display Name               # Human-readable name
    icon: 💡                         # Emoji or MDI icon
    category: category_id            # Optional: assign to category
    show_when_off: false             # Show even when power = 0
```

#### `categories` (optional)
Device grouping and organization:
```yaml
categories:
  - id: unique_id                    # Unique identifier
    name: Display Name               # Human-readable name
    icon: 🍳                         # Emoji or MDI icon
    circuit_entity: sensor.circuit   # Optional: total circuit power sensor
```

**Circuit Tracking:** When `circuit_entity` is specified, the card calculates the remainder (untracked power) and displays it as "Other [Category Name]" if > 10W.

#### `visualization_mode` (optional)
```yaml
visualization_mode: particles   # Options: particles, sankey, both
```
- **particles** - Animated particles show energy flow
- **sankey** - Flowing colored bands (Sankey diagram)
- **both** - Show both visualizations together

#### `warnings` (optional)
Alert thresholds:
```yaml
warnings:
  battery_low: 20        # Warn when battery < 20%
  grid_import: 5000      # Warn when grid import > 5000W
```

#### `theme` (optional)
Custom colors:
```yaml
theme:
  solar_color: '#FFA726'
  battery_color: '#4CAF50'
  grid_color: '#F44336'
```

---

## Quick Start

1. **Choose an example** that matches your setup
2. **Copy the YAML** to your Home Assistant dashboard
3. **Update entity IDs** to match your sensors
4. **Adjust battery capacity** to your actual battery size
5. **Add/remove devices** as needed
6. **Customize icons and names**

---

## Tips

### Finding Entity IDs
1. Go to **Developer Tools** → **States** in Home Assistant
2. Search for your power sensors
3. Copy the full `entity_id` (e.g., `sensor.solar_power`)

### Setting Battery Capacity
- Find your battery specs in kWh
- Examples: Tesla Powerwall 2 = 13.5 kWh, LG Chem RESU 10H = 9.8 kWh
- Used for calculating time-to-empty/full

### Icons
- Use emoji (📺, 🖥️, ❄️) for simple icons
- Or use Material Design Icons: `mdi:television`, `mdi:fridge`

### Show When Off
- `show_when_off: true` - Always visible (good for fridges, HVAC)
- `show_when_off: false` - Only visible when consuming power (good for TVs, chargers)

### Performance
- Longer `update_interval` (e.g., 5000ms) reduces CPU usage
- Lower `max_height` reduces canvas size and improves performance

---

## Troubleshooting

### Card shows "Loading..."
- Check that all entity IDs exist in Home Assistant
- Verify sensors are reporting numeric values

### Devices not appearing
- Ensure device `entity_id` is correct
- Check if `show_when_off: false` and device is off
- Verify device power > 0W

### Category not showing devices
- Verify device `category` matches category `id` exactly
- Check if category is collapsed (click to expand)

### Remainder calculation wrong
- Ensure `circuit_entity` reports total circuit power in Watts
- Verify all child devices use the same unit (W)
- Check for missing devices on the circuit

---

## Need Help?

- **Issues:** https://github.com/yourusername/energy-flow-card/issues
- **Discussions:** https://github.com/yourusername/energy-flow-card/discussions
- **Home Assistant Community:** https://community.home-assistant.io/
