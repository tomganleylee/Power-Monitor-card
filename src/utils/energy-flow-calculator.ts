/**
 * Energy Flow Calculator
 * Determines power flows between sources (solar, battery, grid) and to devices
 */

export interface EnergyFlow {
  from: string;  // Node type: 'solar', 'battery', 'grid'
  to: string;    // Node type: 'solar', 'battery', 'grid', 'hub'
  powerWatts: number;
  color: string;
}

export interface SourcePowers {
  solar: number;
  battery: number;  // Positive = discharging, negative = charging
  grid: number;     // Positive = importing, negative = exporting
  totalLoad: number;
}

/**
 * Calculate energy flows between all nodes
 *
 * Logic:
 * 1. Solar can flow to: Battery (charging), Grid (export), Devices (via hub)
 * 2. Battery can flow to: Grid (export), Devices (via hub)
 * 3. Grid can flow to: Battery (charging), Devices (via hub)
 *
 * @param powers Current power values for all sources
 * @returns Array of energy flows between nodes
 */
export function calculateEnergyFlows(powers: SourcePowers): EnergyFlow[] {
  const flows: EnergyFlow[] = [];

  const solar = Math.max(0, powers.solar);           // Solar always positive (generation)
  const batteryPower = powers.battery;                // Positive = discharging, Negative = charging
  const gridPower = powers.grid;                      // Positive = importing, Negative = exporting
  const totalLoad = Math.max(0, powers.totalLoad);   // Total consumption

  // Battery states
  const batteryCharging = batteryPower < -10;         // Battery receiving power
  const batteryDischarging = batteryPower > 10;      // Battery providing power
  const batteryChargePower = Math.abs(Math.min(0, batteryPower));
  const batteryDischargePower = Math.max(0, batteryPower);

  // Grid states
  const gridImporting = gridPower > 10;              // Importing from grid
  const gridExporting = gridPower < -10;             // Exporting to grid
  const gridImportPower = Math.max(0, gridPower);
  const gridExportPower = Math.abs(Math.min(0, gridPower));

  // Calculate flows based on energy balance
  // Priority: Solar first, then Battery, then Grid

  // SOLAR FLOWS
  if (solar > 10) {
    let solarRemaining = solar;

    // 1. Solar → Battery (if charging)
    if (batteryCharging) {
      const solarToBattery = Math.min(solarRemaining, batteryChargePower);
      if (solarToBattery > 10) {
        flows.push({
          from: 'solar',
          to: 'battery',
          powerWatts: solarToBattery,
          color: '#ffa500'  // Orange (solar color)
        });
        solarRemaining -= solarToBattery;
      }
    }

    // 2. Solar → Grid (if exporting)
    if (gridExporting && solarRemaining > 10) {
      const solarToGrid = Math.min(solarRemaining, gridExportPower);
      if (solarToGrid > 10) {
        flows.push({
          from: 'solar',
          to: 'grid',
          powerWatts: solarToGrid,
          color: '#ffa500'  // Orange (solar color)
        });
        solarRemaining -= solarToGrid;
      }
    }

    // 3. Solar → Hub (remainder goes to devices)
    if (solarRemaining > 10) {
      flows.push({
        from: 'solar',
        to: 'hub',
        powerWatts: solarRemaining,
        color: '#ffa500'  // Orange
      });
    }
  }

  // BATTERY FLOWS
  if (batteryDischarging) {
    let batteryRemaining = batteryDischargePower;

    // 1. Battery → Grid (if exporting and solar not enough)
    if (gridExporting) {
      const batteryToGrid = Math.min(batteryRemaining, gridExportPower);
      if (batteryToGrid > 10) {
        flows.push({
          from: 'battery',
          to: 'grid',
          powerWatts: batteryToGrid,
          color: '#4caf50'  // Green (battery color)
        });
        batteryRemaining -= batteryToGrid;
      }
    }

    // 2. Battery → Hub (remainder goes to devices)
    if (batteryRemaining > 10) {
      flows.push({
        from: 'battery',
        to: 'hub',
        powerWatts: batteryRemaining,
        color: '#4caf50'  // Green
      });
    }
  }

  // GRID FLOWS
  if (gridImporting) {
    let gridRemaining = gridImportPower;

    // 1. Grid → Battery (if charging and not enough solar)
    if (batteryCharging) {
      // Calculate if grid is needed for battery
      const solarToBatteryFlow = flows.find(f => f.from === 'solar' && f.to === 'battery');
      const solarToBattery = solarToBatteryFlow?.powerWatts ?? 0;
      const gridToBattery = Math.max(0, batteryChargePower - solarToBattery);

      if (gridToBattery > 10) {
        flows.push({
          from: 'grid',
          to: 'battery',
          powerWatts: Math.min(gridRemaining, gridToBattery),
          color: '#f44336'  // Red (grid color)
        });
        gridRemaining -= gridToBattery;
      }
    }

    // 2. Grid → Hub (remainder goes to devices)
    if (gridRemaining > 10) {
      flows.push({
        from: 'grid',
        to: 'hub',
        powerWatts: gridRemaining,
        color: '#f44336'  // Red
      });
    }
  }

  return flows;
}

/**
 * Get color for a flow based on source
 */
export function getFlowColor(from: string): string {
  switch (from) {
    case 'solar':
      return '#ffa500';  // Orange
    case 'battery':
      return '#4caf50';  // Green
    case 'grid':
      return '#f44336';  // Red
    default:
      return '#999999';  // Gray
  }
}
