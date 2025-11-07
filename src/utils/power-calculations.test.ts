/**
 * Tests for power-calculations.ts
 */

import { expect } from '@open-wc/testing';
import {
  calculateCategoryPower,
  calculateCircuitRemainder,
  calculateTotalConsumption,
  calculateParticleSpawnRate,
  calculateParticleSpeed,
  isSensorStale,
  calculateEfficiency,
  calculateSelfSufficiency,
  getGridFlowDirection,
  getBatteryFlowDirection,
  calculateBatteryTimeRemaining,
  formatTimeRemaining,
} from './power-calculations';
import { ConsumptionDeviceNode } from '../types';

describe('power-calculations', () => {
  describe('calculateCategoryPower', () => {
    const mockDevices: ConsumptionDeviceNode[] = [
      { id: '1', name: 'Device 1', categoryId: 'kitchen', powerWatts: 100 } as ConsumptionDeviceNode,
      { id: '2', name: 'Device 2', categoryId: 'kitchen', powerWatts: 200 } as ConsumptionDeviceNode,
      { id: '3', name: 'Device 3', categoryId: 'office', powerWatts: 150 } as ConsumptionDeviceNode,
      { id: '4', name: 'Device 4', categoryId: 'kitchen', powerWatts: 50 } as ConsumptionDeviceNode,
    ];

    it('should calculate total power for a category', () => {
      expect(calculateCategoryPower(mockDevices, 'kitchen')).to.equal(350);
      expect(calculateCategoryPower(mockDevices, 'office')).to.equal(150);
    });

    it('should return 0 for non-existent category', () => {
      expect(calculateCategoryPower(mockDevices, 'garage')).to.equal(0);
    });

    it('should return 0 for empty device array', () => {
      expect(calculateCategoryPower([], 'kitchen')).to.equal(0);
    });
  });

  describe('calculateCircuitRemainder', () => {
    const mockChildDevices: ConsumptionDeviceNode[] = [
      { id: '1', name: 'Device 1', powerWatts: 100 } as ConsumptionDeviceNode,
      { id: '2', name: 'Device 2', powerWatts: 200 } as ConsumptionDeviceNode,
      { id: '3', name: 'Device 3', powerWatts: 50 } as ConsumptionDeviceNode,
    ];

    it('should calculate positive remainder when circuit exceeds children', () => {
      expect(calculateCircuitRemainder(500, mockChildDevices)).to.equal(150);
    });

    it('should calculate zero remainder when circuit equals children', () => {
      expect(calculateCircuitRemainder(350, mockChildDevices)).to.equal(0);
    });

    it('should calculate negative remainder when children exceed circuit', () => {
      expect(calculateCircuitRemainder(300, mockChildDevices)).to.equal(-50);
    });

    it('should handle empty children array', () => {
      expect(calculateCircuitRemainder(500, [])).to.equal(500);
    });

    it('should handle zero circuit power', () => {
      expect(calculateCircuitRemainder(0, mockChildDevices)).to.equal(-350);
    });
  });

  describe('calculateTotalConsumption', () => {
    it('should calculate total consumption across all devices', () => {
      const devices: ConsumptionDeviceNode[] = [
        { id: '1', powerWatts: 100 } as ConsumptionDeviceNode,
        { id: '2', powerWatts: 200 } as ConsumptionDeviceNode,
        { id: '3', powerWatts: 300 } as ConsumptionDeviceNode,
      ];
      expect(calculateTotalConsumption(devices)).to.equal(600);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalConsumption([])).to.equal(0);
    });

    it('should handle devices with zero power', () => {
      const devices: ConsumptionDeviceNode[] = [
        { id: '1', powerWatts: 0 } as ConsumptionDeviceNode,
        { id: '2', powerWatts: 100 } as ConsumptionDeviceNode,
      ];
      expect(calculateTotalConsumption(devices)).to.equal(100);
    });
  });

  describe('calculateParticleSpawnRate', () => {
    it('should return minimum rate for very low power', () => {
      expect(calculateParticleSpawnRate(0)).to.equal(0.5);
      expect(calculateParticleSpawnRate(50)).to.equal(0.5);
    });

    it('should scale proportionally with power (150W = 1 particle/sec)', () => {
      expect(calculateParticleSpawnRate(150)).to.equal(1);
      expect(calculateParticleSpawnRate(300)).to.equal(2);
      expect(calculateParticleSpawnRate(750)).to.equal(5);
    });

    it('should cap at maximum rate of 12 particles/sec', () => {
      expect(calculateParticleSpawnRate(2000)).to.equal(12);
      expect(calculateParticleSpawnRate(10000)).to.equal(12);
    });

    it('should handle negative power (use absolute value)', () => {
      expect(calculateParticleSpawnRate(-300)).to.equal(2);
      expect(calculateParticleSpawnRate(-2000)).to.equal(12);
    });
  });

  describe('calculateParticleSpeed', () => {
    it('should return slowest speed for low power (< 100W)', () => {
      expect(calculateParticleSpeed(0)).to.equal(0.08);
      expect(calculateParticleSpeed(50)).to.equal(0.08);
      expect(calculateParticleSpeed(99)).to.equal(0.08);
    });

    it('should return slow speed for medium power (100-999W)', () => {
      expect(calculateParticleSpeed(100)).to.equal(0.12);
      expect(calculateParticleSpeed(500)).to.equal(0.12);
      expect(calculateParticleSpeed(999)).to.equal(0.12);
    });

    it('should return moderate speed for high power (1000-4999W)', () => {
      expect(calculateParticleSpeed(1000)).to.equal(0.18);
      expect(calculateParticleSpeed(3000)).to.equal(0.18);
      expect(calculateParticleSpeed(4999)).to.equal(0.18);
    });

    it('should return faster speed for very high power (>= 5000W)', () => {
      expect(calculateParticleSpeed(5000)).to.equal(0.25);
      expect(calculateParticleSpeed(10000)).to.equal(0.25);
    });

    it('should handle negative power (use absolute value)', () => {
      expect(calculateParticleSpeed(-50)).to.equal(0.08);
      expect(calculateParticleSpeed(-500)).to.equal(0.12);
      expect(calculateParticleSpeed(-2000)).to.equal(0.18);
      expect(calculateParticleSpeed(-6000)).to.equal(0.25);
    });
  });

  describe('isSensorStale', () => {
    it('should return false for recent updates', () => {
      const now = Date.now();
      expect(isSensorStale(now)).to.be.false;
      expect(isSensorStale(now - 30000)).to.be.false; // 30 seconds ago
      expect(isSensorStale(now - 59000)).to.be.false; // 59 seconds ago
    });

    it('should return true for stale updates (default 60s threshold)', () => {
      const now = Date.now();
      expect(isSensorStale(now - 60001)).to.be.true; // 60.001 seconds ago
      expect(isSensorStale(now - 120000)).to.be.true; // 2 minutes ago
    });

    it('should respect custom threshold', () => {
      const now = Date.now();
      expect(isSensorStale(now - 20000, 30000)).to.be.false; // 20s < 30s threshold
      expect(isSensorStale(now - 40000, 30000)).to.be.true;  // 40s > 30s threshold
    });

    it('should handle edge cases', () => {
      const now = Date.now();
      expect(isSensorStale(now - 60000, 60000)).to.be.false; // Exactly at threshold
      expect(isSensorStale(now - 60001, 60000)).to.be.true;  // Just over threshold
    });
  });

  describe('calculateEfficiency', () => {
    it('should calculate efficiency percentage', () => {
      expect(calculateEfficiency(500, 1000)).to.equal(50);
      expect(calculateEfficiency(1000, 1000)).to.equal(100);
      expect(calculateEfficiency(1500, 1000)).to.equal(150);
    });

    it('should return 0 when consumption is 0', () => {
      expect(calculateEfficiency(500, 0)).to.equal(0);
    });

    it('should return 0 for negative efficiency', () => {
      expect(calculateEfficiency(0, 1000)).to.equal(0);
    });

    it('should handle edge cases', () => {
      expect(calculateEfficiency(0, 0)).to.equal(0);
      expect(calculateEfficiency(100, 50)).to.equal(200);
    });
  });

  describe('calculateSelfSufficiency', () => {
    it('should calculate self-sufficiency with only solar', () => {
      expect(calculateSelfSufficiency(500, 0, 1000)).to.equal(50);
      expect(calculateSelfSufficiency(1000, 0, 1000)).to.equal(100);
    });

    it('should calculate self-sufficiency with solar and battery discharge', () => {
      expect(calculateSelfSufficiency(300, 200, 1000)).to.equal(50);
      expect(calculateSelfSufficiency(600, 400, 1000)).to.equal(100);
    });

    it('should ignore battery charging (negative discharge)', () => {
      expect(calculateSelfSufficiency(500, -200, 1000)).to.equal(50);
    });

    it('should cap at 100%', () => {
      expect(calculateSelfSufficiency(1500, 500, 1000)).to.equal(100);
    });

    it('should return 100% when consumption is 0', () => {
      expect(calculateSelfSufficiency(500, 200, 0)).to.equal(100);
    });

    it('should return 0% when no local generation', () => {
      expect(calculateSelfSufficiency(0, 0, 1000)).to.equal(0);
      expect(calculateSelfSufficiency(0, -200, 1000)).to.equal(0);
    });

    it('should handle edge cases', () => {
      expect(calculateSelfSufficiency(0, 0, 0)).to.equal(100);
      expect(calculateSelfSufficiency(100, 100, 100)).to.equal(100);
    });
  });

  describe('getGridFlowDirection', () => {
    it('should return "import" for positive grid power > 10W', () => {
      expect(getGridFlowDirection(11)).to.equal('import');
      expect(getGridFlowDirection(100)).to.equal('import');
      expect(getGridFlowDirection(1000)).to.equal('import');
    });

    it('should return "export" for negative grid power < -10W', () => {
      expect(getGridFlowDirection(-11)).to.equal('export');
      expect(getGridFlowDirection(-100)).to.equal('export');
      expect(getGridFlowDirection(-1000)).to.equal('export');
    });

    it('should return "idle" for power within threshold (-10 to 10W)', () => {
      expect(getGridFlowDirection(0)).to.equal('idle');
      expect(getGridFlowDirection(5)).to.equal('idle');
      expect(getGridFlowDirection(-5)).to.equal('idle');
      expect(getGridFlowDirection(10)).to.equal('idle');
      expect(getGridFlowDirection(-10)).to.equal('idle');
    });
  });

  describe('getBatteryFlowDirection', () => {
    it('should return "discharging" for positive battery power > 10W', () => {
      expect(getBatteryFlowDirection(11)).to.equal('discharging');
      expect(getBatteryFlowDirection(100)).to.equal('discharging');
      expect(getBatteryFlowDirection(1000)).to.equal('discharging');
    });

    it('should return "charging" for negative battery power < -10W', () => {
      expect(getBatteryFlowDirection(-11)).to.equal('charging');
      expect(getBatteryFlowDirection(-100)).to.equal('charging');
      expect(getBatteryFlowDirection(-1000)).to.equal('charging');
    });

    it('should return "idle" for power within threshold (-10 to 10W)', () => {
      expect(getBatteryFlowDirection(0)).to.equal('idle');
      expect(getBatteryFlowDirection(5)).to.equal('idle');
      expect(getBatteryFlowDirection(-5)).to.equal('idle');
      expect(getBatteryFlowDirection(10)).to.equal('idle');
      expect(getBatteryFlowDirection(-10)).to.equal('idle');
    });
  });

  describe('calculateBatteryTimeRemaining', () => {
    it('should calculate time to empty when discharging', () => {
      // 50% SOC, 10kWh capacity, 1000W discharge = 5kWh / 1kW = 5 hours = 300 minutes
      expect(calculateBatteryTimeRemaining(50, 10, 1000)).to.equal(300);

      // 80% SOC, 10kWh capacity, 2000W discharge = 8kWh / 2kW = 4 hours = 240 minutes
      expect(calculateBatteryTimeRemaining(80, 10, 2000)).to.equal(240);

      // 25% SOC, 13.5kWh capacity, 500W discharge = 3.375kWh / 0.5kW = 6.75 hours = 405 minutes
      expect(calculateBatteryTimeRemaining(25, 13.5, 500)).to.equal(405);
    });

    it('should calculate time to full when charging', () => {
      // 50% SOC, 10kWh capacity, -1000W charge = 5kWh / 1kW = 5 hours = 300 minutes
      expect(calculateBatteryTimeRemaining(50, 10, -1000)).to.equal(300);

      // 20% SOC, 10kWh capacity, -2000W charge = 8kWh / 2kW = 4 hours = 240 minutes
      expect(calculateBatteryTimeRemaining(20, 10, -2000)).to.equal(240);

      // 75% SOC, 13.5kWh capacity, -500W charge = 3.375kWh / 0.5kW = 6.75 hours = 405 minutes
      expect(calculateBatteryTimeRemaining(75, 13.5, -500)).to.equal(405);
    });

    it('should return null for invalid inputs', () => {
      expect(calculateBatteryTimeRemaining(50, 0, 1000)).to.be.null; // Zero capacity
      expect(calculateBatteryTimeRemaining(50, -10, 1000)).to.be.null; // Negative capacity
      expect(calculateBatteryTimeRemaining(50, 10, 5)).to.be.null; // Power below threshold
      expect(calculateBatteryTimeRemaining(50, 10, -5)).to.be.null; // Power below threshold
      expect(calculateBatteryTimeRemaining(50, 10, 0)).to.be.null; // Zero power
    });

    it('should handle edge cases for SOC', () => {
      // 100% SOC discharging: 10kWh / 1kW = 10 hours = 600 minutes
      expect(calculateBatteryTimeRemaining(100, 10, 1000)).to.equal(600);

      // 0% SOC discharging: 0kWh / 1kW = 0 hours = 0 minutes
      expect(calculateBatteryTimeRemaining(0, 10, 1000)).to.equal(0);

      // 0% SOC charging: 10kWh / 1kW = 10 hours = 600 minutes
      expect(calculateBatteryTimeRemaining(0, 10, -1000)).to.equal(600);

      // 100% SOC charging: 0kWh / 1kW = 0 hours = 0 minutes
      expect(calculateBatteryTimeRemaining(100, 10, -1000)).to.equal(0);
    });

    it('should handle high power rates', () => {
      // 50% SOC, 10kWh capacity, 5000W discharge = 5kWh / 5kW = 1 hour = 60 minutes
      expect(calculateBatteryTimeRemaining(50, 10, 5000)).to.equal(60);
    });

    it('should handle low power rates', () => {
      // 50% SOC, 10kWh capacity, 100W discharge = 5kWh / 0.1kW = 50 hours = 3000 minutes
      expect(calculateBatteryTimeRemaining(50, 10, 100)).to.equal(3000);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format hours and minutes', () => {
      expect(formatTimeRemaining(150)).to.equal('2h 30m');
      expect(formatTimeRemaining(90)).to.equal('1h 30m');
      expect(formatTimeRemaining(185)).to.equal('3h 5m');
    });

    it('should format whole hours without minutes', () => {
      expect(formatTimeRemaining(60)).to.equal('1h');
      expect(formatTimeRemaining(120)).to.equal('2h');
      expect(formatTimeRemaining(180)).to.equal('3h');
    });

    it('should format minutes only for < 1 hour', () => {
      expect(formatTimeRemaining(0)).to.equal('');
      expect(formatTimeRemaining(1)).to.equal('1m');
      expect(formatTimeRemaining(30)).to.equal('30m');
      expect(formatTimeRemaining(59)).to.equal('59m');
    });

    it('should handle null input', () => {
      expect(formatTimeRemaining(null)).to.equal('');
    });

    it('should handle negative input', () => {
      expect(formatTimeRemaining(-10)).to.equal('');
    });

    it('should round minutes', () => {
      expect(formatTimeRemaining(90.4)).to.equal('1h 30m');
      expect(formatTimeRemaining(90.6)).to.equal('1h 31m');
    });

    it('should handle large values', () => {
      expect(formatTimeRemaining(600)).to.equal('10h');
      expect(formatTimeRemaining(1440)).to.equal('24h');
      expect(formatTimeRemaining(1500)).to.equal('25h');
    });
  });
});
