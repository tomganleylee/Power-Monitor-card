/**
 * Tests for sensor-manager.ts
 */

import { expect } from '@open-wc/testing';
import { SensorManager } from './sensor-manager';
import type { HomeAssistant, HassEntity } from './types';

describe('SensorManager', () => {
  let mockHass: HomeAssistant;
  let manager: SensorManager;

  beforeEach(() => {
    mockHass = {
      states: {},
      connection: {
        subscribeEntities: () => () => {},
      },
      callService: async () => {},
    } as HomeAssistant;

    manager = new SensorManager(mockHass);
  });

  describe('constructor', () => {
    it('should initialize with default stale threshold', () => {
      const mgr = new SensorManager(mockHass);
      expect(mgr).to.be.instanceOf(SensorManager);
    });

    it('should initialize with custom stale threshold', () => {
      const mgr = new SensorManager(mockHass, 30000);
      expect(mgr).to.be.instanceOf(SensorManager);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to entity updates', () => {
      const callback = () => {};
      const entityIds = ['sensor.solar_power', 'sensor.battery_power'];

      mockHass.states = {
        'sensor.solar_power': {
          entity_id: 'sensor.solar_power',
          state: '1500',
          attributes: { unit_of_measurement: 'W' },
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
        'sensor.battery_power': {
          entity_id: 'sensor.battery_power',
          state: '500',
          attributes: { unit_of_measurement: 'W' },
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(entityIds, callback);

      const state1 = manager.getSensorState('sensor.solar_power');
      const state2 = manager.getSensorState('sensor.battery_power');

      expect(state1).to.not.be.null;
      expect(state1!.value).to.equal(1500);
      expect(state2).to.not.be.null;
      expect(state2!.value).to.equal(500);
    });

    it('should initialize unavailable sensors', () => {
      const entityIds = ['sensor.missing'];
      manager.subscribe(entityIds, () => {});

      const state = manager.getSensorState('sensor.missing');
      expect(state).to.not.be.null;
      expect(state!.isUnavailable).to.be.true;
      expect(state!.value).to.equal(0);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from updates', () => {
      const callback = () => {};
      manager.subscribe(['sensor.test'], callback);
      manager.unsubscribe();

      // Should not throw
      expect(() => manager.unsubscribe()).to.not.throw();
    });
  });

  describe('getSensorState', () => {
    it('should return sensor state when available', () => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: '1000',
          attributes: { unit_of_measurement: 'W' },
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {});
      const state = manager.getSensorState('sensor.test');

      expect(state).to.not.be.null;
      expect(state!.value).to.equal(1000);
      expect(state!.unit).to.equal('W');
    });

    it('should return null for unknown sensor', () => {
      const state = manager.getSensorState('sensor.unknown');
      expect(state).to.be.null;
    });
  });

  describe('getPowerValue', () => {
    it('should return power value for available sensor', () => {
      mockHass.states = {
        'sensor.power': {
          entity_id: 'sensor.power',
          state: '1500',
          attributes: { unit_of_measurement: 'W' },
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.power'], () => {});
      expect(manager.getPowerValue('sensor.power')).to.equal(1500);
    });

    it('should return 0 for unavailable sensor', () => {
      mockHass.states = {
        'sensor.power': {
          entity_id: 'sensor.power',
          state: 'unavailable',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.power'], () => {});
      expect(manager.getPowerValue('sensor.power')).to.equal(0);
    });

    it('should return 0 for unknown sensor', () => {
      expect(manager.getPowerValue('sensor.unknown')).to.equal(0);
    });

    it('should return 0 for stale sensor without last valid value', () => {
      const oldDate = new Date(Date.now() - 120000); // 2 minutes ago
      mockHass.states = {
        'sensor.power': {
          entity_id: 'sensor.power',
          state: '1500',
          attributes: { unit_of_measurement: 'W' },
          last_changed: oldDate.toISOString(),
          last_updated: oldDate.toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.power'], () => {});
      expect(manager.getPowerValue('sensor.power')).to.equal(0);
    });
  });

  describe('getPercentageValue', () => {
    it('should return percentage value for available sensor', () => {
      mockHass.states = {
        'sensor.battery_soc': {
          entity_id: 'sensor.battery_soc',
          state: '75',
          attributes: { unit_of_measurement: '%' },
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.battery_soc'], () => {});
      expect(manager.getPercentageValue('sensor.battery_soc')).to.equal(75);
    });

    it('should clamp percentage between 0 and 100', () => {
      mockHass.states = {
        'sensor.over': {
          entity_id: 'sensor.over',
          state: '150',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
        'sensor.under': {
          entity_id: 'sensor.under',
          state: '-10',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.over', 'sensor.under'], () => {});
      expect(manager.getPercentageValue('sensor.over')).to.equal(100);
      expect(manager.getPercentageValue('sensor.under')).to.equal(0);
    });

    it('should return 0 for unavailable sensor without last valid value', () => {
      mockHass.states = {
        'sensor.battery_soc': {
          entity_id: 'sensor.battery_soc',
          state: 'unavailable',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.battery_soc'], () => {});
      expect(manager.getPercentageValue('sensor.battery_soc')).to.equal(0);
    });

    it('should return 0 for unknown sensor', () => {
      expect(manager.getPercentageValue('sensor.unknown')).to.equal(0);
    });

    it('should use last valid value for stale sensor', () => {
      const oldDate = new Date(Date.now() - 120000); // 2 minutes ago

      // First, create a valid state
      mockHass.states = {
        'sensor.battery_soc': {
          entity_id: 'sensor.battery_soc',
          state: '80',
          attributes: { unit_of_measurement: '%' },
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.battery_soc'], () => {});

      // Now make it stale
      mockHass.states = {
        'sensor.battery_soc': {
          entity_id: 'sensor.battery_soc',
          state: '80',
          attributes: { unit_of_measurement: '%' },
          last_changed: oldDate.toISOString(),
          last_updated: oldDate.toISOString(),
        } as HassEntity,
      };

      manager.refresh();
      expect(manager.getPercentageValue('sensor.battery_soc')).to.equal(80);
    });
  });

  describe('getStaleSensors', () => {
    it('should return empty array when no sensors are stale', () => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: '100',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {});
      expect(manager.getStaleSensors()).to.be.empty;
    });

    it('should return array of stale sensor IDs', () => {
      const oldDate = new Date(Date.now() - 120000); // 2 minutes ago
      const recentDate = new Date();

      mockHass.states = {
        'sensor.stale1': {
          entity_id: 'sensor.stale1',
          state: '100',
          attributes: {},
          last_changed: oldDate.toISOString(),
          last_updated: oldDate.toISOString(),
        } as HassEntity,
        'sensor.stale2': {
          entity_id: 'sensor.stale2',
          state: '200',
          attributes: {},
          last_changed: oldDate.toISOString(),
          last_updated: oldDate.toISOString(),
        } as HassEntity,
        'sensor.fresh': {
          entity_id: 'sensor.fresh',
          state: '300',
          attributes: {},
          last_changed: recentDate.toISOString(),
          last_updated: recentDate.toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.stale1', 'sensor.stale2', 'sensor.fresh'], () => {});
      const staleSensors = manager.getStaleSensors();

      expect(staleSensors).to.have.lengthOf(2);
      expect(staleSensors).to.include('sensor.stale1');
      expect(staleSensors).to.include('sensor.stale2');
      expect(staleSensors).to.not.include('sensor.fresh');
    });
  });

  describe('refresh', () => {
    it('should refresh all sensor states', () => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: '100',
          attributes: { unit_of_measurement: 'W' },
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {});

      // Update the state
      mockHass.states['sensor.test'].state = '200';

      manager.refresh();

      const state = manager.getSensorState('sensor.test');
      expect(state!.value).to.equal(200);
    });

    it('should call update callback on refresh', (done) => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: '100',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {
        done();
      });

      manager.refresh();
    });
  });

  describe('getAllStates', () => {
    it('should return copy of all sensor states', () => {
      mockHass.states = {
        'sensor.test1': {
          entity_id: 'sensor.test1',
          state: '100',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
        'sensor.test2': {
          entity_id: 'sensor.test2',
          state: '200',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test1', 'sensor.test2'], () => {});

      const allStates = manager.getAllStates();
      expect(allStates.size).to.equal(2);
      expect(allStates.get('sensor.test1')).to.exist;
      expect(allStates.get('sensor.test2')).to.exist;
    });

    it('should return empty map when no sensors', () => {
      const allStates = manager.getAllStates();
      expect(allStates.size).to.equal(0);
    });
  });

  describe('clear', () => {
    it('should clear all sensor states', () => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: '100',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {});
      expect(manager.getAllStates().size).to.equal(1);

      manager.clear();
      expect(manager.getAllStates().size).to.equal(0);
    });
  });

  describe('numeric state parsing', () => {
    it('should parse integer states', () => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: '1500',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {});
      expect(manager.getPowerValue('sensor.test')).to.equal(1500);
    });

    it('should parse float states', () => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: '1500.75',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {});
      expect(manager.getPowerValue('sensor.test')).to.equal(1500.75);
    });

    it('should parse negative values', () => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: '-500',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {});
      expect(manager.getPowerValue('sensor.test')).to.equal(-500);
    });

    it('should return 0 for non-numeric states', () => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: 'on',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {});
      expect(manager.getPowerValue('sensor.test')).to.equal(0);
    });
  });

  describe('unit handling', () => {
    it('should preserve unit of measurement', () => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: '1500',
          attributes: { unit_of_measurement: 'kW' },
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {});
      const state = manager.getSensorState('sensor.test');
      expect(state!.unit).to.equal('kW');
    });

    it('should handle missing unit of measurement', () => {
      mockHass.states = {
        'sensor.test': {
          entity_id: 'sensor.test',
          state: '1500',
          attributes: {},
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        } as HassEntity,
      };

      manager.subscribe(['sensor.test'], () => {});
      const state = manager.getSensorState('sensor.test');
      expect(state!.unit).to.equal('');
    });
  });
});
