/**
 * Power calculation utilities for energy flow
 */

import { ConsumptionDeviceNode } from '../types';

/**
 * Calculates the total power consumption for a category
 * Includes child devices and subcircuits
 * @param devices All consumption device nodes
 * @param categoryId Category identifier
 * @returns Total power in watts
 */
export function calculateCategoryPower(
  devices: ConsumptionDeviceNode[],
  categoryId: string
): number {
  return devices
    .filter(device => device.categoryId === categoryId)
    .reduce((sum, device) => sum + device.powerWatts, 0);
}

/**
 * Calculates the remainder power for a parent circuit
 * (circuit entity value minus sum of known child devices)
 * @param circuitPowerWatts Total circuit power in watts
 * @param childDevices Array of child device nodes
 * @returns Remainder power in watts (can be negative if children exceed circuit)
 */
export function calculateCircuitRemainder(
  circuitPowerWatts: number,
  childDevices: ConsumptionDeviceNode[]
): number {
  const childSum = childDevices.reduce((sum, device) => sum + device.powerWatts, 0);
  return circuitPowerWatts - childSum;
}

/**
 * Calculates total consumption across all devices
 * @param devices All consumption device nodes
 * @returns Total consumption in watts
 */
export function calculateTotalConsumption(devices: ConsumptionDeviceNode[]): number {
  return devices.reduce((sum, device) => sum + device.powerWatts, 0);
}

/**
 * Calculates particle spawn rate based on power flow
 * Proportional to power - more power = more particles
 * @param powerWatts Power flow in watts
 * @returns Particles per second (0.5-12)
 */
export function calculateParticleSpawnRate(powerWatts: number): number {
  const absPower = Math.abs(powerWatts);

  // Proportional rate: 150W = 1 particle/sec
  // No minimum clamp - low power gets very few particles
  const rate = absPower / 150;

  // Only clamp maximum to prevent too many particles
  return Math.min(12, Math.max(0.5, rate)); // 0.5-12 particles/sec
}

/**
 * Calculates particle speed based on power magnitude
 * Slower speeds = more visible flow
 * @param powerWatts Power flow in watts
 * @returns Speed multiplier (0.08-0.25) - Much slower for better visibility
 */
export function calculateParticleSpeed(powerWatts: number): number {
  const absPower = Math.abs(powerWatts);

  if (absPower < 100) {
    return 0.08;  // Very slow for low power
  } else if (absPower < 1000) {
    return 0.12;  // Slow for medium power
  } else if (absPower < 5000) {
    return 0.18;  // Moderate for high power
  } else {
    return 0.25;  // Still slow even for very high power
  }
}

/**
 * Determines if a sensor value is stale (older than threshold)
 * @param lastUpdated Timestamp of last update (ms since epoch)
 * @param thresholdMs Staleness threshold in milliseconds (default: 60000ms = 60s)
 * @returns True if sensor is stale
 */
export function isSensorStale(
  lastUpdated: number,
  thresholdMs: number = 60000
): boolean {
  return Date.now() - lastUpdated > thresholdMs;
}

/**
 * Calculates energy efficiency percentage
 * (Total generation / Total consumption) * 100
 * @param generationWatts Total generation in watts
 * @param consumptionWatts Total consumption in watts
 * @returns Efficiency percentage (0-100+)
 */
export function calculateEfficiency(
  generationWatts: number,
  consumptionWatts: number
): number {
  if (consumptionWatts === 0) return 0;
  return Math.max(0, (generationWatts / consumptionWatts) * 100);
}

/**
 * Calculates self-sufficiency percentage
 * (Generation used locally / Total consumption) * 100
 * @param solarWatts Solar generation in watts
 * @param batteryDischargeWatts Battery discharge in watts (positive when discharging)
 * @param consumptionWatts Total consumption in watts
 * @returns Self-sufficiency percentage (0-100)
 */
export function calculateSelfSufficiency(
  solarWatts: number,
  batteryDischargeWatts: number,
  consumptionWatts: number
): number {
  if (consumptionWatts === 0) return 100;

  const localGeneration = solarWatts + Math.max(0, batteryDischargeWatts);
  const selfSufficiency = (localGeneration / consumptionWatts) * 100;

  return Math.max(0, Math.min(100, selfSufficiency));
}

/**
 * Determines the direction of grid power flow
 * @param gridWatts Grid power in watts (positive = import, negative = export)
 * @returns 'import' | 'export' | 'idle'
 */
export function getGridFlowDirection(gridWatts: number): 'import' | 'export' | 'idle' {
  const threshold = 10; // 10W threshold to avoid noise

  if (gridWatts > threshold) {
    return 'import';
  } else if (gridWatts < -threshold) {
    return 'export';
  } else {
    return 'idle';
  }
}

/**
 * Determines the direction of battery power flow
 * @param batteryWatts Battery power in watts (positive = discharge, negative = charge)
 * @returns 'charging' | 'discharging' | 'idle'
 */
export function getBatteryFlowDirection(batteryWatts: number): 'charging' | 'discharging' | 'idle' {
  const threshold = 10; // 10W threshold to avoid noise

  if (batteryWatts > threshold) {
    return 'discharging';
  } else if (batteryWatts < -threshold) {
    return 'charging';
  } else {
    return 'idle';
  }
}

/**
 * Calculate battery time remaining (charge or discharge)
 * @param batterySocPercent Battery state of charge (0-100)
 * @param batteryCapacityKwh Total battery capacity in kWh
 * @param batteryPowerWatts Current battery power (positive = discharging, negative = charging)
 * @returns Time remaining in minutes, or null if not applicable
 */
export function calculateBatteryTimeRemaining(
  batterySocPercent: number,
  batteryCapacityKwh: number,
  batteryPowerWatts: number
): number | null {
  // Need valid inputs
  if (!batteryCapacityKwh || batteryCapacityKwh <= 0) return null;
  if (Math.abs(batteryPowerWatts) < 10) return null; // Idle or very low power

  const batteryDischarging = batteryPowerWatts > 10;
  const batteryCharging = batteryPowerWatts < -10;

  if (batteryDischarging) {
    // Time to empty: (remaining capacity kWh) / (discharge rate kW) * 60 minutes
    const remainingKwh = (batteryCapacityKwh * batterySocPercent) / 100;
    const dischargeRateKw = batteryPowerWatts / 1000;
    const hoursRemaining = remainingKwh / dischargeRateKw;
    return Math.round(hoursRemaining * 60); // Convert to minutes
  } else if (batteryCharging) {
    // Time to full: (capacity to fill kWh) / (charge rate kW) * 60 minutes
    const capacityToFillKwh = (batteryCapacityKwh * (100 - batterySocPercent)) / 100;
    const chargeRateKw = Math.abs(batteryPowerWatts) / 1000;
    const hoursRemaining = capacityToFillKwh / chargeRateKw;
    return Math.round(hoursRemaining * 60); // Convert to minutes
  }

  return null;
}

/**
 * Format time remaining as human-readable string
 * @param minutes Time in minutes
 * @returns Formatted string like "2h 30m" or "45m"
 */
export function formatTimeRemaining(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return '';

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    return `${mins}m`;
  }
}
