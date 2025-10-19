# Discovered Power Monitoring Devices

## Summary

Found **151 total power sensors** in your Home Assistant instance, including:
- **42 GivEnergy sensors** (solar, battery, grid monitoring)
- **19 real-time device power sensors** (W/kW)

## GivEnergy System (Primary Energy Flow)

### Main Power Sensors
| Sensor | Current State | Purpose |
|--------|--------------|---------|
| `sensor.givtcp_ce2122g101_pv_power` | 528 W | Solar panel generation |
| `sensor.givtcp_ce2122g101_invertor_power` | 647 W | Battery power (+ charging, - discharging) |
| `sensor.givtcp_ce2122g101_grid_power` | 18 W | Grid power (+ import, - export) |
| `sensor.givtcp_ce2122g101_load_power` | 1157 W | Total house consumption |
| `sensor.givtcp_ce2122g101_soc` | (Battery %) | Battery state of charge |

### Energy Totals (Today)
- **Solar Generated**: 1.4 kWh
- **Battery Charged**: 13.5 kWh
- **Battery Discharged**: 5.5 kWh
- **Grid Import**: 21.3 kWh
- **Grid Export**: 0.1 kWh
- **Total Consumption**: 13.3 kWh

## Individual Device Power Monitors

### High Power Devices (>100W)
| Device | Entity ID | Current | Icon |
|--------|-----------|---------|------|
| **Sockets** | `sensor.0xa4c138dc734d8579_power_b` | 689.7 W | 🔌 |
| **Other Sockets** | `sensor.socket_leftoverpower` | 255.8 W | 🔌 |
| **Tom's Desktop** | `sensor.tumble_dryer_power` | 241 W | 💻 |
| **Network Equipment** | `sensor.network_power_current_consumption` | 155.5 W | 🌐 |
| **Fridge/Freezer** | `sensor.fridgez_power` | 144 W | 🧊 |

### Medium Power Devices (10-100W)
| Device | Entity ID | Current | Icon |
|--------|-----------|---------|------|
| **Lights** | `sensor.0xa4c138d23ac68e84_power_a` | 66.6 W | 💡 |
| **Starlink** | `sensor.starlink_power` | 22 W | 📡 |

### Low Power Devices (<10W)
| Device | Entity ID | Current | Icon |
|--------|-----------|---------|------|
| **Coffee Machine** | `sensor.coffee_machine_power` | 1 W | ☕ |
| **Garage** | `sensor.0xa4c1384607d1c8d2_power` | 0 W | 🚗 |

## Configuration Notes

### Battery Capacity
Your GivEnergy system has a **16.4 kWh** battery capacity. This is hardcoded in the config since it's not exposed as a sensor.

### Device Discovery
Devices were discovered using the Home Assistant API endpoint:
```bash
GET http://192.168.3.12:8123/api/claude_dashboard/entities?domain=sensor
Authorization: Bearer [YOUR_TOKEN]
```

### Hex ID Sensors
Some sensors have hex IDs like `0xa4c138dc734d8579` - these are Zigbee device addresses. You may want to rename these in Home Assistant for clarity:
- **Settings** → **Devices & Services** → **Entities**
- Search for the hex ID
- Click the entity and set a friendly name

### Missing/Inactive Devices
Several devices are currently at 0W or unavailable. These are included with `show_when_off: false` so they only appear when active.

## Recommended Next Steps

1. **Rename Hex ID Devices** in Home Assistant for clarity
2. **Verify Device Mapping** - Make sure entity IDs match the right physical devices
3. **Add More Icons** - Customize icons in the config for each device
4. **Set Up Warnings** - Configure battery_low and grid_import thresholds
5. **Create Device Categories** (optional) - Group devices by room or type

## Energy Flow Card Configuration

A complete configuration file has been created:
📄 **`energy-flow-card-config.yaml`**

Copy this to your Home Assistant dashboard configuration. The card will show:
- ☀️ Solar generation (top)
- 🏠 Hub (center)
- ⚡ Grid (left)
- 🔋 Battery (bottom) with SOC and capacity
- Individual device nodes (right side) with particle flows

### Visual Features
- Dark theme with glowing neon nodes
- Physics-based floating particles
- Real-time power updates (2 second interval)
- Color-coded device power levels
- Battery fill indicator with capacity display
- Stale sensor warnings
