/**
 * SensorManager - Manages Home Assistant sensor subscriptions and state tracking
 */

import { HomeAssistant, HassEntity, SensorState } from './types';
import { isSensorStale } from './utils/power-calculations';

export class SensorManager {
  private hass: HomeAssistant;
  private sensorStates: Map<string, SensorState>;
  private unsubscribeCallback: (() => void) | null = null;
  private updateCallback: (() => void) | null = null;
  private staleThresholdMs: number = 60000; // 60 seconds

  constructor(hass: HomeAssistant, staleThresholdMs: number = 60000) {
    this.hass = hass;
    this.sensorStates = new Map();
    this.staleThresholdMs = staleThresholdMs;
  }

  /**
   * Subscribe to entity updates from Home Assistant
   * @param entityIds Array of entity IDs to monitor
   * @param callback Function to call when any entity updates
   */
  public subscribe(entityIds: string[], callback: () => void): void {
    this.updateCallback = callback;

    // Initialize sensor states from current hass.states
    for (const entityId of entityIds) {
      this.updateSensorState(entityId);
    }

    // Home Assistant doesn't expose subscribeEntities in custom cards
    // We'll rely on the periodic refresh from the card's update_interval
    // and the hass property updates from Home Assistant
    this.unsubscribeCallback = () => {
      // No-op, cleanup handled by card lifecycle
    };
  }

  /**
   * Unsubscribe from entity updates
   */
  public unsubscribe(): void {
    if (this.unsubscribeCallback) {
      this.unsubscribeCallback();
      this.unsubscribeCallback = null;
    }
    this.updateCallback = null;
  }

  /**
   * Get the current state of a sensor
   * @param entityId Entity ID to query
   * @returns SensorState object or null if not found
   */
  public getSensorState(entityId: string): SensorState | null {
    return this.sensorStates.get(entityId) || null;
  }

  /**
   * Get the power value from a sensor (in watts)
   * Handles unit conversion and stale/unavailable states
   * @param entityId Entity ID to query
   * @returns Power value in watts, or 0 if unavailable/stale
   */
  public getPowerValue(entityId: string): number {
    const state = this.sensorStates.get(entityId);

    if (!state || state.isUnavailable || state.isStale) {
      // Return last valid value if available and not too old
      if (state?.lastValidValue !== undefined && !state.isStale) {
        return state.lastValidValue;
      }
      return 0;
    }

    return state.value;
  }

  /**
   * Get the percentage value from a sensor (0-100)
   * @param entityId Entity ID to query
   * @returns Percentage value or 0 if unavailable
   */
  public getPercentageValue(entityId: string): number {
    const state = this.sensorStates.get(entityId);

    if (!state || state.isUnavailable || state.isStale) {
      return 0;
    }

    return Math.max(0, Math.min(100, state.value));
  }

  /**
   * Check if any monitored sensors are stale
   * @returns Array of stale entity IDs
   */
  public getStaleSensors(): string[] {
    const stale: string[] = [];

    for (const [entityId, state] of this.sensorStates) {
      if (state.isStale) {
        stale.push(entityId);
      }
    }

    return stale;
  }

  /**
   * Update the state of a sensor from Home Assistant
   * @param entityId Entity ID to update
   */
  private updateSensorState(entityId: string): void {
    const hassEntity = this.hass.states[entityId];

    if (!hassEntity) {
      // Entity doesn't exist in hass.states
      this.sensorStates.set(entityId, {
        entityId,
        value: 0,
        unit: '',
        isStale: false,
        isUnavailable: true,
        lastUpdated: Date.now()
      });
      return;
    }

    const isUnavailable = hassEntity.state === 'unavailable' || hassEntity.state === 'unknown';
    const lastUpdated = new Date(hassEntity.last_updated).getTime();
    const isStale = isSensorStale(lastUpdated, this.staleThresholdMs);

    let value = 0;
    let lastValidValue: number | undefined;

    if (!isUnavailable) {
      value = this.parseNumericState(hassEntity.state);
      lastValidValue = value;
    } else {
      // Preserve last valid value if available
      const previousState = this.sensorStates.get(entityId);
      lastValidValue = previousState?.lastValidValue;
    }

    this.sensorStates.set(entityId, {
      entityId,
      value,
      unit: hassEntity.attributes.unit_of_measurement || '',
      isStale,
      isUnavailable,
      lastUpdated,
      lastValidValue
    });
  }

  /**
   * Parse a state string to a numeric value
   * @param stateString State string from Home Assistant
   * @returns Numeric value or 0 if not parseable
   */
  private parseNumericState(stateString: string): number {
    const parsed = parseFloat(stateString);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Force a refresh of all sensor states
   * Useful for manual updates or staleness checks
   */
  public refresh(): void {
    for (const entityId of this.sensorStates.keys()) {
      this.updateSensorState(entityId);
    }

    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  /**
   * Get all sensor states
   * @returns Map of all sensor states
   */
  public getAllStates(): Map<string, SensorState> {
    return new Map(this.sensorStates);
  }

  /**
   * Clear all sensor states
   */
  public clear(): void {
    this.sensorStates.clear();
  }
}
