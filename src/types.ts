// Configuration Types

export interface EnergyFlowCardConfig {
  type: 'custom:energy-flow-card';
  entities?: {
    solar?: string;
    battery?: string;
    battery_soc?: string;
    battery_capacity?: string;
    battery_invert?: boolean;  // If true, invert battery sign (for GivEnergy: negative=charging)
    grid?: string;
    grid_invert?: boolean;      // If true, invert grid sign (for GivEnergy: negative=importing)
  };
  devices?: DeviceConfig[];
  categories?: CategoryConfig[];
  update_interval?: number;
  show_statistics?: boolean;
  visualization_mode?: 'particles' | 'sankey' | 'both';  // New option
  min_height?: number;
  max_height?: number;
  warnings?: {
    battery_low?: number;
    grid_import?: number;
    custom?: WarningConfig[];
  };
  theme?: {
    solar_color?: string;
    battery_color?: string;
    grid_color?: string;
  };
}

export interface DeviceConfig {
  id: string;
  entity_id: string;
  name?: string;
  icon?: string;
  category?: string;
  parent_circuit?: string;
  show_when_off?: boolean;
}

export interface CategoryConfig {
  id: string;
  name: string;
  icon?: string;
  collapsed?: boolean;
  circuit_entity?: string;
}

export interface WarningConfig {
  id: string;
  condition: 'above' | 'below';
  entity_id: string;
  threshold: number;
  message?: string;
}

// Runtime State Types

export interface EnergySourceNode {
  type: 'solar' | 'battery' | 'grid' | 'hub';
  entityId: string;
  powerWatts: number;
  isActive: boolean;
  isStale: boolean;
  lastUpdated: number;
  displayValue: string;
  displayUnit: string;
  color: string;
  icon: string;
  x: number;
  y: number;
  radius: number;
}

export interface ConsumptionDeviceNode {
  id: string;
  entityId: string;
  name: string;
  powerWatts: number;
  isStale: boolean;
  lastUpdated: number;
  displayValue: string;
  displayUnit: string;
  icon: string;
  categoryId?: string;
  children?: ConsumptionDeviceNode[];
  calculatedRemainder?: number;
  x: number;
  y: number;
  radius: number;
  isVisible: boolean;
}

export interface Particle {
  id: number;
  sourceNode: EnergySourceNode | ConsumptionDeviceNode | null;
  targetNode: EnergySourceNode | ConsumptionDeviceNode | null;
  lifetime: number;
  x: number;
  y: number;
  vx: number;  // Velocity X
  vy: number;  // Velocity Y
  color: string;
  radius: number;
  opacity: number;
  isActive: boolean;
  // Floating/wandering properties
  wanderAngle: number;
  wanderSpeed: number;
  maxSpeed: number;
}

export interface SensorState {
  entityId: string;
  value: number;
  unit: string;
  isStale: boolean;
  isUnavailable: boolean;
  lastUpdated: number;
  lastValidValue?: number;
}

export interface StatisticsPanel {
  efficiency: number;
  selfSufficiency: number;
  dailySavings: number;
  totalGeneration: number;
  totalConsumption: number;
  gridImport: number;
}

// Home Assistant Types (minimal definitions)

export interface HomeAssistant {
  connection: {
    subscribeEntities: (callback: (entities: Record<string, HassEntity>) => void) => () => void;
  };
  states: Record<string, HassEntity>;
  callService: (domain: string, service: string, data?: any) => Promise<void>;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: EnergyFlowCardConfig): void;
  getCardSize?(): number;
}

export interface LovelaceCardConfig {
  type: string;
}
