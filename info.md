# Energy Flow Card

A beautiful, animated Home Assistant Lovelace card that visualizes real-time energy flow between solar panels, batteries, grid, and individual devices.

## Features

- 🎨 **Dual Visualization Modes** - Particles or Sankey flow diagrams
- 🔋 **Energy Source Monitoring** - Solar, Battery, Grid with real-time updates
- 📊 **Device Categories** - Group devices into collapsible categories
- 🎯 **Circuit Tracking** - Monitor circuits with automatic remainder calculation
- ⏱️ **Battery Time Remaining** - Estimates time until empty or full
- 🎨 **Customizable Themes** - Custom colors for energy sources
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Quick Start

```yaml
type: custom:energy-flow-card
entities:
  solar: sensor.solar_power
  battery: sensor.battery_power
  battery_soc: sensor.battery_soc
  battery_capacity: 13.5
  grid: sensor.grid_power
devices:
  - id: home_load
    entity_id: sensor.home_consumption
    name: Total Home Load
    icon: 🏠
    show_when_off: true
```

For full documentation, see the [README](https://github.com/tomganleylee/Power-Monitor-card/blob/master/README.md).
