/**
 * Tests for energy-flow-calculator.ts
 */

import { expect } from '@open-wc/testing';
import { calculateEnergyFlows, getFlowColor, type SourcePowers } from './energy-flow-calculator';

describe('energy-flow-calculator', () => {
  describe('calculateEnergyFlows', () => {
    describe('Solar flows', () => {
      it('should route solar to hub when only consuming', () => {
        const powers: SourcePowers = {
          solar: 1000,
          battery: 0,
          grid: 0,
          totalLoad: 1000,
        };
        const flows = calculateEnergyFlows(powers);

        expect(flows).to.have.lengthOf(1);
        expect(flows[0]).to.deep.equal({
          from: 'solar',
          to: 'hub',
          powerWatts: 1000,
          color: '#ffa500',
        });
      });

      it('should route solar to battery when charging', () => {
        const powers: SourcePowers = {
          solar: 2000,
          battery: -500, // Charging at 500W
          grid: 0,
          totalLoad: 1500,
        };
        const flows = calculateEnergyFlows(powers);

        const solarToBattery = flows.find(f => f.from === 'solar' && f.to === 'battery');
        const solarToHub = flows.find(f => f.from === 'solar' && f.to === 'hub');

        expect(solarToBattery).to.exist;
        expect(solarToBattery!.powerWatts).to.equal(500);
        expect(solarToHub).to.exist;
        expect(solarToHub!.powerWatts).to.equal(1500);
      });

      it('should route solar to grid when exporting', () => {
        const powers: SourcePowers = {
          solar: 3000,
          battery: 0,
          grid: -1000, // Exporting to grid
          totalLoad: 2000,
        };
        const flows = calculateEnergyFlows(powers);

        const solarToGrid = flows.find(f => f.from === 'solar' && f.to === 'grid');
        const solarToHub = flows.find(f => f.from === 'solar' && f.to === 'hub');

        expect(solarToGrid).to.exist;
        expect(solarToGrid!.powerWatts).to.equal(1000);
        expect(solarToHub).to.exist;
        expect(solarToHub!.powerWatts).to.equal(2000);
      });

      it('should route solar to battery, grid, and hub when all needed', () => {
        const powers: SourcePowers = {
          solar: 5000,
          battery: -1000, // Charging
          grid: -2000,    // Exporting
          totalLoad: 2000,
        };
        const flows = calculateEnergyFlows(powers);

        const solarToBattery = flows.find(f => f.from === 'solar' && f.to === 'battery');
        const solarToGrid = flows.find(f => f.from === 'solar' && f.to === 'grid');
        const solarToHub = flows.find(f => f.from === 'solar' && f.to === 'hub');

        expect(solarToBattery!.powerWatts).to.equal(1000);
        expect(solarToGrid!.powerWatts).to.equal(2000);
        expect(solarToHub!.powerWatts).to.equal(2000);
      });
    });

    describe('Battery flows', () => {
      it('should route battery to hub when discharging', () => {
        const powers: SourcePowers = {
          solar: 0,
          battery: 500, // Discharging
          grid: 0,
          totalLoad: 500,
        };
        const flows = calculateEnergyFlows(powers);

        expect(flows).to.have.lengthOf(1);
        expect(flows[0]).to.deep.equal({
          from: 'battery',
          to: 'hub',
          powerWatts: 500,
          color: '#4caf50',
        });
      });

      it('should route battery to grid when exporting', () => {
        const powers: SourcePowers = {
          solar: 0,
          battery: 1000, // Discharging
          grid: -500,    // Exporting
          totalLoad: 500,
        };
        const flows = calculateEnergyFlows(powers);

        const batteryToGrid = flows.find(f => f.from === 'battery' && f.to === 'grid');
        const batteryToHub = flows.find(f => f.from === 'battery' && f.to === 'hub');

        expect(batteryToGrid).to.exist;
        expect(batteryToGrid!.powerWatts).to.equal(500);
        expect(batteryToHub).to.exist;
        expect(batteryToHub!.powerWatts).to.equal(500);
      });

      it('should not create flows when battery is charging', () => {
        const powers: SourcePowers = {
          solar: 1000,
          battery: -500, // Charging
          grid: 0,
          totalLoad: 500,
        };
        const flows = calculateEnergyFlows(powers);

        const batteryFlows = flows.filter(f => f.from === 'battery');
        expect(batteryFlows).to.be.empty;
      });

      it('should not create flows when battery is idle', () => {
        const powers: SourcePowers = {
          solar: 500,
          battery: 0, // Idle
          grid: 0,
          totalLoad: 500,
        };
        const flows = calculateEnergyFlows(powers);

        const batteryFlows = flows.filter(f => f.from === 'battery');
        expect(batteryFlows).to.be.empty;
      });
    });

    describe('Grid flows', () => {
      it('should route grid to hub when importing', () => {
        const powers: SourcePowers = {
          solar: 0,
          battery: 0,
          grid: 1000, // Importing
          totalLoad: 1000,
        };
        const flows = calculateEnergyFlows(powers);

        expect(flows).to.have.lengthOf(1);
        expect(flows[0]).to.deep.equal({
          from: 'grid',
          to: 'hub',
          powerWatts: 1000,
          color: '#f44336',
        });
      });

      it('should route grid to battery when charging and solar not enough', () => {
        const powers: SourcePowers = {
          solar: 200,
          battery: -1000, // Charging at 1000W
          grid: 1500,     // Importing
          totalLoad: 700,
        };
        const flows = calculateEnergyFlows(powers);

        const gridToBattery = flows.find(f => f.from === 'grid' && f.to === 'battery');
        const gridToHub = flows.find(f => f.from === 'grid' && f.to === 'hub');

        expect(gridToBattery).to.exist;
        expect(gridToBattery!.powerWatts).to.be.closeTo(800, 1); // 1000W charge - 200W from solar
        expect(gridToHub).to.exist;
      });

      it('should not route grid to battery when solar is enough', () => {
        const powers: SourcePowers = {
          solar: 1500,
          battery: -500, // Charging
          grid: 0,
          totalLoad: 1000,
        };
        const flows = calculateEnergyFlows(powers);

        const gridToBattery = flows.find(f => f.from === 'grid' && f.to === 'battery');
        expect(gridToBattery).to.be.undefined;
      });

      it('should not create flows when grid is exporting', () => {
        const powers: SourcePowers = {
          solar: 2000,
          battery: 0,
          grid: -500, // Exporting
          totalLoad: 1500,
        };
        const flows = calculateEnergyFlows(powers);

        const gridFlows = flows.filter(f => f.from === 'grid');
        expect(gridFlows).to.be.empty;
      });
    });

    describe('Complex scenarios', () => {
      it('should handle solar + battery discharging + grid importing', () => {
        const powers: SourcePowers = {
          solar: 1000,
          battery: 500,  // Discharging
          grid: 500,     // Importing
          totalLoad: 2000,
        };
        const flows = calculateEnergyFlows(powers);

        expect(flows).to.have.lengthOf(3);
        expect(flows.find(f => f.from === 'solar' && f.to === 'hub')).to.exist;
        expect(flows.find(f => f.from === 'battery' && f.to === 'hub')).to.exist;
        expect(flows.find(f => f.from === 'grid' && f.to === 'hub')).to.exist;
      });

      it('should handle solar + battery charging + grid importing', () => {
        const powers: SourcePowers = {
          solar: 500,
          battery: -1000, // Charging
          grid: 1500,     // Importing to charge battery and power load
          totalLoad: 1000,
        };
        const flows = calculateEnergyFlows(powers);

        const solarToBattery = flows.find(f => f.from === 'solar' && f.to === 'battery');
        const gridToBattery = flows.find(f => f.from === 'grid' && f.to === 'battery');
        const gridToHub = flows.find(f => f.from === 'grid' && f.to === 'hub');

        expect(solarToBattery).to.exist;
        expect(gridToBattery).to.exist;
        expect(gridToHub).to.exist;
      });

      it('should handle solar + battery discharging + grid exporting', () => {
        const powers: SourcePowers = {
          solar: 2000,
          battery: 1000, // Discharging
          grid: -2500,   // Exporting excess
          totalLoad: 500,
        };
        const flows = calculateEnergyFlows(powers);

        const solarToGrid = flows.find(f => f.from === 'solar' && f.to === 'grid');
        const batteryToGrid = flows.find(f => f.from === 'battery' && f.to === 'grid');

        expect(solarToGrid).to.exist;
        expect(batteryToGrid).to.exist;
      });
    });

    describe('Edge cases', () => {
      it('should handle zero values', () => {
        const powers: SourcePowers = {
          solar: 0,
          battery: 0,
          grid: 0,
          totalLoad: 0,
        };
        const flows = calculateEnergyFlows(powers);

        expect(flows).to.be.empty;
      });

      it('should handle negative solar (treat as 0)', () => {
        const powers: SourcePowers = {
          solar: -100,
          battery: 0,
          grid: 500,
          totalLoad: 500,
        };
        const flows = calculateEnergyFlows(powers);

        const solarFlows = flows.filter(f => f.from === 'solar');
        expect(solarFlows).to.be.empty;
      });

      it('should handle negative totalLoad (treat as 0)', () => {
        const powers: SourcePowers = {
          solar: 1000,
          battery: 0,
          grid: 0,
          totalLoad: -100,
        };
        const flows = calculateEnergyFlows(powers);

        // Solar should still flow (likely to grid or battery)
        expect(flows).to.not.be.empty;
      });

      it('should ignore flows below 10W threshold', () => {
        const powers: SourcePowers = {
          solar: 5,      // Below threshold
          battery: 8,    // Below threshold
          grid: 500,
          totalLoad: 500,
        };
        const flows = calculateEnergyFlows(powers);

        const solarFlows = flows.filter(f => f.from === 'solar');
        const batteryFlows = flows.filter(f => f.from === 'battery');

        expect(solarFlows).to.be.empty;
        expect(batteryFlows).to.be.empty;
      });

      it('should handle battery exactly at threshold (10W)', () => {
        const powers: SourcePowers = {
          solar: 0,
          battery: 10,  // At threshold
          grid: 0,
          totalLoad: 10,
        };
        const flows = calculateEnergyFlows(powers);

        const batteryFlows = flows.filter(f => f.from === 'battery');
        expect(batteryFlows).to.be.empty; // Threshold is exclusive (> 10)
      });

      it('should handle battery just above threshold (11W)', () => {
        const powers: SourcePowers = {
          solar: 0,
          battery: 11,  // Just above threshold
          grid: 0,
          totalLoad: 11,
        };
        const flows = calculateEnergyFlows(powers);

        const batteryFlows = flows.filter(f => f.from === 'battery');
        expect(batteryFlows).to.have.lengthOf(1);
      });
    });

    describe('Flow colors', () => {
      it('should assign correct colors to flows', () => {
        const powers: SourcePowers = {
          solar: 500,
          battery: 300,
          grid: 200,
          totalLoad: 1000,
        };
        const flows = calculateEnergyFlows(powers);

        const solarFlow = flows.find(f => f.from === 'solar');
        const batteryFlow = flows.find(f => f.from === 'battery');
        const gridFlow = flows.find(f => f.from === 'grid');

        expect(solarFlow!.color).to.equal('#ffa500');   // Orange
        expect(batteryFlow!.color).to.equal('#4caf50');  // Green
        expect(gridFlow!.color).to.equal('#f44336');     // Red
      });
    });

    describe('Real-world scenarios', () => {
      it('should handle typical daytime scenario (solar excess)', () => {
        const powers: SourcePowers = {
          solar: 4000,
          battery: -1500, // Charging from excess solar
          grid: -1000,    // Exporting remainder
          totalLoad: 1500,
        };
        const flows = calculateEnergyFlows(powers);

        expect(flows.find(f => f.from === 'solar' && f.to === 'battery')).to.exist;
        expect(flows.find(f => f.from === 'solar' && f.to === 'grid')).to.exist;
        expect(flows.find(f => f.from === 'solar' && f.to === 'hub')).to.exist;
      });

      it('should handle typical nighttime scenario (battery discharging)', () => {
        const powers: SourcePowers = {
          solar: 0,
          battery: 1000, // Discharging
          grid: 500,     // Importing for additional load
          totalLoad: 1500,
        };
        const flows = calculateEnergyFlows(powers);

        expect(flows.find(f => f.from === 'battery' && f.to === 'hub')).to.exist;
        expect(flows.find(f => f.from === 'grid' && f.to === 'hub')).to.exist;
      });

      it('should handle cloudy day scenario (low solar, grid import)', () => {
        const powers: SourcePowers = {
          solar: 200,
          battery: 0,    // Not charging/discharging
          grid: 1300,    // Importing most power
          totalLoad: 1500,
        };
        const flows = calculateEnergyFlows(powers);

        expect(flows.find(f => f.from === 'solar' && f.to === 'hub')).to.exist;
        expect(flows.find(f => f.from === 'grid' && f.to === 'hub')).to.exist;
      });
    });
  });

  describe('getFlowColor', () => {
    it('should return orange for solar', () => {
      expect(getFlowColor('solar')).to.equal('#ffa500');
    });

    it('should return green for battery', () => {
      expect(getFlowColor('battery')).to.equal('#4caf50');
    });

    it('should return red for grid', () => {
      expect(getFlowColor('grid')).to.equal('#f44336');
    });

    it('should return gray for unknown sources', () => {
      expect(getFlowColor('unknown')).to.equal('#999999');
      expect(getFlowColor('hub')).to.equal('#999999');
      expect(getFlowColor('')).to.equal('#999999');
    });
  });
});
