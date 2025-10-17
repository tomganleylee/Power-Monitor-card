/**
 * Unit formatting utilities for energy values
 */

export interface FormattedValue {
  value: number;
  unit: string;
}

/**
 * Formats power values in watts to appropriate scale (W, kW, MW)
 * @param watts Power value in watts
 * @returns Object with scaled value and unit string
 */
export function formatPower(watts: number): FormattedValue {
  const absWatts = Math.abs(watts);

  if (absWatts >= 1000000) {
    return {
      value: +(watts / 1000000).toFixed(2),
      unit: 'MW'
    };
  } else if (absWatts >= 1000) {
    return {
      value: +(watts / 1000).toFixed(1),
      unit: 'kW'
    };
  } else {
    return {
      value: Math.round(watts),
      unit: 'W'
    };
  }
}

/**
 * Formats energy values in watt-hours to appropriate scale (Wh, kWh, MWh)
 * @param wattHours Energy value in watt-hours
 * @returns Object with scaled value and unit string
 */
export function formatEnergy(wattHours: number): FormattedValue {
  const absWh = Math.abs(wattHours);

  if (absWh >= 1000000) {
    return {
      value: +(wattHours / 1000000).toFixed(2),
      unit: 'MWh'
    };
  } else if (absWh >= 1000) {
    return {
      value: +(wattHours / 1000).toFixed(1),
      unit: 'kWh'
    };
  } else {
    return {
      value: Math.round(wattHours),
      unit: 'Wh'
    };
  }
}

/**
 * Formats percentage values with optional decimal places
 * @param value Percentage value (0-100)
 * @param decimals Number of decimal places (default: 0)
 * @returns Object with formatted value and % unit
 */
export function formatPercentage(value: number, decimals: number = 0): FormattedValue {
  return {
    value: +value.toFixed(decimals),
    unit: '%'
  };
}

/**
 * Formats a value with unit into a display string
 * @param formattedValue Object with value and unit
 * @returns Formatted display string (e.g., "1.5 kW")
 */
export function formatDisplay(formattedValue: FormattedValue): string {
  return `${formattedValue.value} ${formattedValue.unit}`;
}
