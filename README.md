# Energy Flow Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/tomganleylee/Power-Monitor-card.svg)](https://github.com/tomganleylee/Power-Monitor-card/releases)
[![License](https://img.shields.io/github/license/tomganleylee/Power-Monitor-card.svg)](LICENSE)

A beautiful, animated Home Assistant Lovelace card that visualizes real-time energy flow between solar panels, batteries, grid, and individual devices. Perfect for home energy monitoring systems!

![Energy Flow Card Demo](docs/images/demo.gif)
*Animated energy flow visualization with real-time power monitoring*

---

## ✨ Features

### 🎨 **Dual Visualization Modes**
- **Particles Mode** - Animated particles flowing between nodes showing energy movement
- **Sankey Mode** - Colored flow bands with width proportional to power consumption
- **Both Mode** - Combine particles and Sankey for maximum visual appeal

![Visualization Modes](docs/images/visualization-modes.png)
*Left: Particles | Center: Sankey | Right: Both*

### 🔋 **Energy Source Monitoring**
- ☀️ **Solar Power** - Real-time solar generation with dynamic sun icon
- 🔋 **Battery** - State of charge (SOC), charge/discharge indicators, time remaining calculation
- ⚡ **Grid** - Import/export with directional indicators
- 🏠 **Central Hub** - Visual representation of energy distribution point

![Energy Sources](docs/images/energy-sources.png)
*Solar, Battery, and Grid nodes with live power readings*

### 📊 **Device Organization**
- **Hierarchical Categories** - Group devices into collapsible categories (e.g., Kitchen, HVAC, Office)
- **Circuit Tracking** - Monitor entire electrical circuits with automatic remainder calculation
- **Individual Devices** - Track specific appliances and electronics
- **Zigzag Layout** - Clean alternating layout for easy reading

![Categories Demo](docs/images/categories.png)
*Click categories to expand/collapse device groups*

### 📈 **Live Statistics Panel**
- **Efficiency** - Percentage of consumption met by local generation
- **Self-Sufficiency** - How much of your power comes from solar/battery
- **Real-time Metrics** - Solar generation, grid usage, and more

![Statistics Panel](docs/images/statistics.png)

### ⚙️ **Advanced Features**
- 🎯 **Circuit Remainder Calculation** - Identifies unknown power consumption on monitored circuits
- ⏱️ **Battery Time Remaining** - Estimates time until battery empty or full
- ⚠️ **Custom Warnings** - Alert thresholds for low battery, high grid import, etc.
- 🎨 **Theme Customization** - Custom colors for solar, battery, and grid
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

---

## 📦 Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Go to **Frontend** section
3. Click the **⋮** menu (top right) and select **Custom repositories**
4. Add repository URL: `https://github.com/tomganleylee/Power-Monitor-card`
5. Category: **Lovelace**
6. Click **Install**
7. Restart Home Assistant

### Manual Installation

1. Download `energy-flow-card.js` from the [latest release](https://github.com/tomganleylee/Power-Monitor-card/releases)
2. Copy to `/config/www/energy-flow-card.js`
3. Add resource to Lovelace:
   ```yaml
   resources:
     - url: /local/energy-flow-card.js
       type: module
   ```
4. Restart Home Assistant

---

## 🚀 Quick Start

### Minimal Configuration

```yaml
type: custom:energy-flow-card
entities:
  solar: sensor.solar_power
  battery: sensor.battery_power
  battery_soc: sensor.battery_soc
  battery_capacity: 13.5  # kWh
  grid: sensor.grid_power
devices:
  - id: home_load
    entity_id: sensor.home_consumption
    name: Total Home Load
    icon: 🏠
    show_when_off: true
```

![Minimal Setup](docs/images/minimal-setup.png)

### With Individual Devices

```yaml
type: custom:energy-flow-card
entities:
  solar: sensor.solar_power
  battery: sensor.battery_power
  battery_soc: sensor.battery_soc
  battery_capacity: 13.5
  grid: sensor.grid_power
devices:
  - id: hvac
    entity_id: sensor.hvac_power
    name: HVAC System
    icon: ❄️
    show_when_off: true
  - id: ev_charger
    entity_id: sensor.ev_charger_power
    name: EV Charger
    icon: 🚗
    show_when_off: false
  - id: fridge
    entity_id: sensor.fridge_power
    name: Refrigerator
    icon: 🧊
    show_when_off: true
visualization_mode: particles
show_statistics: true
```

![Individual Devices](docs/images/individual-devices.png)

---

## 📖 Full Configuration Guide

### Main Entities

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `solar` | string | No | Solar power sensor (Watts) |
| `battery` | string | No | Battery power sensor (Watts, positive = charging, negative = discharging) |
| `battery_soc` | string | No | Battery state of charge sensor (%) |
| `battery_capacity` | number | No | Battery capacity in kWh (for time remaining calculation) |
| `grid` | string | No | Grid power sensor (Watts, positive = import, negative = export) |

### Devices

Each device requires:

```yaml
devices:
  - id: unique_id              # Required: Unique identifier
    entity_id: sensor.power    # Required: Power sensor entity
    name: Display Name         # Optional: Human-readable name
    icon: 💡                  # Optional: Emoji or MDI icon
    category: category_id      # Optional: Assign to category
    show_when_off: false       # Optional: Show even when power = 0
```

**Example:**
```yaml
devices:
  - id: tv
    entity_id: sensor.tv_power
    name: Living Room TV
    icon: 📺
    show_when_off: false
```

### Categories (Device Grouping)

Organize devices into collapsible groups:

```yaml
categories:
  - id: kitchen                      # Required: Unique identifier
    name: Kitchen Appliances         # Required: Display name
    icon: 🍳                         # Optional: Category icon
    circuit_entity: sensor.kitchen_circuit  # Optional: Circuit total power
```

**With Circuit Tracking:**
```yaml
categories:
  - id: office
    name: Home Office
    icon: 💼
    circuit_entity: sensor.office_circuit_power  # Total circuit power

devices:
  - id: pc
    entity_id: sensor.pc_power
    name: Desktop PC
    category: office
  - id: monitor
    entity_id: sensor.monitor_power
    name: Monitor
    category: office
```

When `circuit_entity` is specified:
- Card uses circuit total for category power
- Calculates remainder: `Circuit Total - Sum of Known Devices`
- Shows "Other [Category Name]" if remainder > 10W

![Circuit Tracking](docs/images/circuit-tracking.png)
*Office circuit shows 500W total, with PC (300W), Monitor (100W), and "Other Office" (100W)*

### Visualization Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `visualization_mode` | string | `particles` | `particles`, `sankey`, or `both` |
| `show_statistics` | boolean | `true` | Show statistics panel at bottom |
| `update_interval` | number | `2000` | Update frequency in milliseconds |
| `min_height` | number | `400` | Minimum card height in pixels |
| `max_height` | number | `800` | Maximum card height in pixels |

```yaml
visualization_mode: both    # Show particles AND Sankey flows
show_statistics: true       # Display efficiency metrics
update_interval: 2000       # Update every 2 seconds
min_height: 500
max_height: 900
```

### Warning Thresholds

```yaml
warnings:
  battery_low: 20            # Warn when battery below 20%
  grid_import: 3000          # Warn when importing > 3000W
```

### Theme Customization

```yaml
theme:
  solar_color: '#FFA726'      # Orange
  battery_color: '#66BB6A'    # Green
  grid_color: '#EF5350'       # Red
```

---

## 📚 Advanced Usage

### Example 1: Complete Home Energy System

```yaml
type: custom:energy-flow-card

entities:
  solar: sensor.solar_power
  battery: sensor.battery_power
  battery_soc: sensor.battery_soc
  battery_capacity: 13.5
  grid: sensor.grid_power

categories:
  - id: kitchen
    name: Kitchen
    icon: 🍳
    circuit_entity: sensor.kitchen_circuit
  - id: hvac
    name: HVAC
    icon: ❄️
  - id: entertainment
    name: Entertainment
    icon: 🎮

devices:
  # Kitchen Circuit
  - id: fridge
    entity_id: sensor.fridge_power
    name: Refrigerator
    icon: 🧊
    category: kitchen
    show_when_off: true
  - id: dishwasher
    entity_id: sensor.dishwasher_power
    name: Dishwasher
    icon: 🍽️
    category: kitchen
    show_when_off: false

  # HVAC
  - id: ac
    entity_id: sensor.ac_power
    name: Air Conditioner
    icon: ❄️
    category: hvac
    show_when_off: true

  # Entertainment
  - id: tv
    entity_id: sensor.tv_power
    name: TV
    icon: 📺
    category: entertainment
    show_when_off: false

  # Standalone
  - id: ev_charger
    entity_id: sensor.ev_charger_power
    name: EV Charger
    icon: 🚗
    show_when_off: false

visualization_mode: both
show_statistics: true
update_interval: 2000
min_height: 600

warnings:
  battery_low: 15
  grid_import: 5000

theme:
  solar_color: '#FFB300'
  battery_color: '#66BB6A'
  grid_color: '#EF5350'
```

![Complete System](docs/images/complete-system.png)

### Example 2: Solar + Battery Only (No Grid)

```yaml
type: custom:energy-flow-card

entities:
  solar: sensor.solar_power
  battery: sensor.battery_power
  battery_soc: sensor.battery_soc
  battery_capacity: 10.0

devices:
  - id: home_load
    entity_id: sensor.total_consumption
    name: Total Load
    icon: 🏠
    show_when_off: true

visualization_mode: particles
show_statistics: true
```

### Example 3: Grid Monitoring Only

```yaml
type: custom:energy-flow-card

entities:
  grid: sensor.grid_power

devices:
  - id: total
    entity_id: sensor.home_consumption
    name: Home Consumption
    icon: 🏠
    show_when_off: true
  - id: hvac
    entity_id: sensor.hvac_power
    name: HVAC
    icon: ❄️
    show_when_off: true

visualization_mode: sankey
show_statistics: false
```

---

## 🔧 Creating Template Sensors

For circuit tracking, create a template sensor that sums the circuit power:

### In `configuration.yaml`

```yaml
template:
  - sensor:
      - name: "Kitchen Circuit Total"
        unique_id: kitchen_circuit_total
        unit_of_measurement: "W"
        device_class: power
        state_class: measurement
        state: >
          {{
            (states('sensor.fridge_power') | float(0)) +
            (states('sensor.dishwasher_power') | float(0)) +
            (states('sensor.microwave_power') | float(0))
          }}
        availability: >
          {{
            has_value('sensor.fridge_power') and
            has_value('sensor.dishwasher_power') and
            has_value('sensor.microwave_power')
          }}
```

Or create a separate file:

### `template-sensors.yaml`

```yaml
- sensor:
    - name: "Kitchen Circuit Total"
      unique_id: kitchen_circuit_total
      unit_of_measurement: "W"
      device_class: power
      state_class: measurement
      state: >
        {{
          (states('sensor.fridge_power') | float(0)) +
          (states('sensor.dishwasher_power') | float(0)) +
          (states('sensor.microwave_power') | float(0))
        }}
```

Then in `configuration.yaml`:
```yaml
template: !include template-sensors.yaml
```

After adding, **restart Home Assistant** or reload template entities.

---

## 🎨 Visualization Modes Explained

### Particles Mode
Animated particles flow from sources to devices, with:
- Particle count proportional to power consumption
- Color matches energy source (orange for solar, green for battery, red for grid)
- Smooth animations at 60 FPS
- Thin connection lines between nodes

**Best for:** Dynamic, eye-catching displays

### Sankey Mode
Flowing colored bands where:
- Band width proportional to power (more power = wider band)
- Power labels on each flow
- Smooth Bezier curves
- Color-coded by source

**Best for:** Clear, data-focused visualization

### Both Mode
Combines particles AND Sankey flows for maximum visual impact.

**Best for:** Large displays, impressive dashboards

---

## 📱 Screenshots

### Desktop View
![Desktop View](docs/images/desktop-view.png)

### Tablet View
![Tablet View](docs/images/tablet-view.png)

### Mobile View
![Mobile View](docs/images/mobile-view.png)

### Dark Theme
![Dark Theme](docs/images/dark-theme.png)

### Light Theme
![Light Theme](docs/images/light-theme.png)

---

## ❓ FAQ

### Q: Devices not showing up?
**A:** Ensure:
- Entity IDs are correct
- Sensors report numeric power values in Watts
- `show_when_off: true` if device is currently off
- Device power > 0W (unless `show_when_off` is true)

### Q: Category not displaying devices?
**A:**
- Verify device `category` matches category `id` exactly (case-sensitive)
- Click the category node to expand it
- Check if category is collapsed by default

### Q: Circuit remainder calculation wrong?
**A:**
- Ensure `circuit_entity` reports total circuit power in Watts
- Verify all child devices use Watts (not kW)
- Check for missing devices on the circuit
- Remainder = Circuit Total - Sum of Known Devices

### Q: Battery time remaining not showing?
**A:**
- Requires both `battery_soc` and `battery_capacity` to be configured
- Battery must be actively charging or discharging
- Only shows when valid calculation is possible

### Q: How to hide the statistics panel?
**A:** Set `show_statistics: false` in configuration

### Q: Can I use kW instead of W?
**A:** No, all sensors must report power in Watts (W). Create a template sensor to convert if needed:
```yaml
template:
  - sensor:
      - name: "Solar Power Watts"
        unit_of_measurement: "W"
        state: "{{ states('sensor.solar_power_kw') | float * 1000 }}"
```

### Q: Card shows "6 sensor(s) not responding"?
**A:**
- One or more entity IDs are incorrect or unavailable
- Check **Developer Tools** → **States** to verify entities exist
- Ensure sensors are updating (check last_updated timestamp)

### Q: Performance issues with many devices?
**A:**
- Increase `update_interval` to 5000ms or higher
- Use `sankey` visualization mode instead of `particles`
- Reduce `max_height` to decrease canvas size
- Consider grouping devices into categories

---

## 🛠️ Troubleshooting

### Clear Browser Cache
After updating the card, hard refresh:
- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

### Check Browser Console
Open Developer Tools (F12) and check the Console tab for errors.

### Verify Sensors
Go to **Developer Tools** → **States** and search for your power sensors. Ensure:
- Values are numeric
- Unit is Watts (W)
- Sensors are updating regularly

### Check Card Configuration
Use the visual editor:
1. Edit dashboard
2. Click the card
3. Open **Show Code Editor**
4. Verify YAML syntax is correct

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup

```bash
# Clone repository
git clone https://github.com/tomganleylee/Power-Monitor-card.git
cd energy-flow-card

# Install dependencies
npm install

# Start development server with watch mode
npm run dev

# Build for production
npm run build

# Run tests (if available)
npm test
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Lit](https://lit.dev/) web components
- Inspired by Home Assistant's energy dashboard
- Thanks to the Home Assistant community for feedback and testing

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/tomganleylee/Power-Monitor-card/issues)
- **Discussions:** [GitHub Discussions](https://github.com/tomganleylee/Power-Monitor-card/discussions)
- **Community:** [Home Assistant Community Forum](https://community.home-assistant.io/)

---

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Historical energy flow replay
- [ ] Cost tracking integration
- [ ] Custom device icons (image URLs)
- [ ] Export visualization to PDF/image
- [ ] Integration with Home Assistant Energy dashboard
- [ ] Animated transitions when devices turn on/off
- [ ] Power flow sound effects (optional)
- [ ] Preset color themes
- [ ] Mobile app optimization
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

---

**Made with ❤️ for the Home Assistant community**

![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Compatible-41BDF5?logo=home-assistant)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Lit](https://img.shields.io/badge/Lit-3.0-324FFF?logo=lit)
