/**
 * Tests for unit-formatter.ts
 */

import { expect } from '@open-wc/testing';
import { formatPower, formatEnergy, formatPercentage, formatDisplay } from './unit-formatter';

describe('unit-formatter', () => {
  describe('formatPower', () => {
    it('should format watts for values < 1000', () => {
      expect(formatPower(0)).to.deep.equal({ value: 0, unit: 'W' });
      expect(formatPower(500)).to.deep.equal({ value: 500, unit: 'W' });
      expect(formatPower(999)).to.deep.equal({ value: 999, unit: 'W' });
    });

    it('should format kilowatts for values >= 1000 and < 1000000', () => {
      expect(formatPower(1000)).to.deep.equal({ value: 1.0, unit: 'kW' });
      expect(formatPower(1500)).to.deep.equal({ value: 1.5, unit: 'kW' });
      expect(formatPower(5678)).to.deep.equal({ value: 5.7, unit: 'kW' });
      expect(formatPower(999999)).to.deep.equal({ value: 1000.0, unit: 'kW' });
    });

    it('should format megawatts for values >= 1000000', () => {
      expect(formatPower(1000000)).to.deep.equal({ value: 1.0, unit: 'MW' });
      expect(formatPower(1500000)).to.deep.equal({ value: 1.5, unit: 'MW' });
      expect(formatPower(12345678)).to.deep.equal({ value: 12.35, unit: 'MW' });
    });

    it('should handle negative values', () => {
      expect(formatPower(-500)).to.deep.equal({ value: -500, unit: 'W' });
      expect(formatPower(-1500)).to.deep.equal({ value: -1.5, unit: 'kW' });
      expect(formatPower(-2000000)).to.deep.equal({ value: -2.0, unit: 'MW' });
    });

    it('should round watts to nearest integer', () => {
      expect(formatPower(123.7)).to.deep.equal({ value: 124, unit: 'W' });
      expect(formatPower(456.3)).to.deep.equal({ value: 456, unit: 'W' });
    });

    it('should format kW to 1 decimal place', () => {
      expect(formatPower(1234)).to.deep.equal({ value: 1.2, unit: 'kW' });
      expect(formatPower(5678)).to.deep.equal({ value: 5.7, unit: 'kW' });
    });

    it('should format MW to 2 decimal places', () => {
      expect(formatPower(1234567)).to.deep.equal({ value: 1.23, unit: 'MW' });
      expect(formatPower(9876543)).to.deep.equal({ value: 9.88, unit: 'MW' });
    });
  });

  describe('formatEnergy', () => {
    it('should format watt-hours for values < 1000', () => {
      expect(formatEnergy(0)).to.deep.equal({ value: 0, unit: 'Wh' });
      expect(formatEnergy(500)).to.deep.equal({ value: 500, unit: 'Wh' });
      expect(formatEnergy(999)).to.deep.equal({ value: 999, unit: 'Wh' });
    });

    it('should format kilowatt-hours for values >= 1000 and < 1000000', () => {
      expect(formatEnergy(1000)).to.deep.equal({ value: 1.0, unit: 'kWh' });
      expect(formatEnergy(1500)).to.deep.equal({ value: 1.5, unit: 'kWh' });
      expect(formatEnergy(5678)).to.deep.equal({ value: 5.7, unit: 'kWh' });
    });

    it('should format megawatt-hours for values >= 1000000', () => {
      expect(formatEnergy(1000000)).to.deep.equal({ value: 1.0, unit: 'MWh' });
      expect(formatEnergy(1500000)).to.deep.equal({ value: 1.5, unit: 'MWh' });
      expect(formatEnergy(12345678)).to.deep.equal({ value: 12.35, unit: 'MWh' });
    });

    it('should handle negative values', () => {
      expect(formatEnergy(-500)).to.deep.equal({ value: -500, unit: 'Wh' });
      expect(formatEnergy(-1500)).to.deep.equal({ value: -1.5, unit: 'kWh' });
      expect(formatEnergy(-2000000)).to.deep.equal({ value: -2.0, unit: 'MWh' });
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with default 0 decimals', () => {
      expect(formatPercentage(0)).to.deep.equal({ value: 0, unit: '%' });
      expect(formatPercentage(50)).to.deep.equal({ value: 50, unit: '%' });
      expect(formatPercentage(100)).to.deep.equal({ value: 100, unit: '%' });
    });

    it('should format percentages with specified decimal places', () => {
      expect(formatPercentage(50.123, 0)).to.deep.equal({ value: 50, unit: '%' });
      expect(formatPercentage(50.123, 1)).to.deep.equal({ value: 50.1, unit: '%' });
      expect(formatPercentage(50.123, 2)).to.deep.equal({ value: 50.12, unit: '%' });
      expect(formatPercentage(50.567, 1)).to.deep.equal({ value: 50.6, unit: '%' });
    });

    it('should handle edge case percentages', () => {
      expect(formatPercentage(0.001, 3)).to.deep.equal({ value: 0.001, unit: '%' });
      expect(formatPercentage(99.999, 2)).to.deep.equal({ value: 100.0, unit: '%' });
      expect(formatPercentage(150, 0)).to.deep.equal({ value: 150, unit: '%' });
    });
  });

  describe('formatDisplay', () => {
    it('should format value and unit into display string', () => {
      expect(formatDisplay({ value: 1.5, unit: 'kW' })).to.equal('1.5 kW');
      expect(formatDisplay({ value: 500, unit: 'W' })).to.equal('500 W');
      expect(formatDisplay({ value: 2.35, unit: 'MW' })).to.equal('2.35 MW');
    });

    it('should handle negative values', () => {
      expect(formatDisplay({ value: -1.5, unit: 'kW' })).to.equal('-1.5 kW');
      expect(formatDisplay({ value: -500, unit: 'W' })).to.equal('-500 W');
    });

    it('should handle zero values', () => {
      expect(formatDisplay({ value: 0, unit: 'W' })).to.equal('0 W');
      expect(formatDisplay({ value: 0, unit: 'kW' })).to.equal('0 kW');
    });

    it('should work with percentage format', () => {
      expect(formatDisplay({ value: 75, unit: '%' })).to.equal('75 %');
      expect(formatDisplay({ value: 99.9, unit: '%' })).to.equal('99.9 %');
    });
  });

  describe('formatPower and formatDisplay integration', () => {
    it('should correctly format and display various power values', () => {
      expect(formatDisplay(formatPower(0))).to.equal('0 W');
      expect(formatDisplay(formatPower(750))).to.equal('750 W');
      expect(formatDisplay(formatPower(1500))).to.equal('1.5 kW');
      expect(formatDisplay(formatPower(12500))).to.equal('12.5 kW');
      expect(formatDisplay(formatPower(1500000))).to.equal('1.5 MW');
      expect(formatDisplay(formatPower(-2500))).to.equal('-2.5 kW');
    });
  });

  describe('formatEnergy and formatDisplay integration', () => {
    it('should correctly format and display various energy values', () => {
      expect(formatDisplay(formatEnergy(0))).to.equal('0 Wh');
      expect(formatDisplay(formatEnergy(750))).to.equal('750 Wh');
      expect(formatDisplay(formatEnergy(1500))).to.equal('1.5 kWh');
      expect(formatDisplay(formatEnergy(12500))).to.equal('12.5 kWh');
      expect(formatDisplay(formatEnergy(1500000))).to.equal('1.5 MWh');
      expect(formatDisplay(formatEnergy(-2500))).to.equal('-2.5 kWh');
    });
  });
});
