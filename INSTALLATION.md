# Energy Flow Card - Installation Guide

## Current Status
✅ Card built and deployed to: `/config/www/energy-flow-card.js`
✅ File size: 82.1 KB
✅ URL: `http://192.168.3.12:8123/local/energy-flow-card.js`

❌ **Not yet registered as a Lovelace resource**

---

## Installation Steps

### Step 1: Register the Card as a Resource

You need to tell Home Assistant about the card file.

#### Method A: Via UI (Easiest)

1. Open Home Assistant
2. Go to **Settings** → **Dashboards**
3. Click the **three dots (⋮)** in the top right corner
4. Click **"Resources"**
5. Click **"+ Add Resource"** button
6. Fill in:
   - **URL:** `/local/energy-flow-card.js`
   - **Resource type:** JavaScript Module
7. Click **"Create"**
8. **Hard refresh** your browser (Ctrl+Shift+R or Ctrl+F5)

#### Method B: Via configuration.yaml

Add this to your `configuration.yaml`:

```yaml
lovelace:
  mode: storage
  resources:
    - url: /local/energy-flow-card.js
      type: module
```

Then restart Home Assistant.

---

### Step 2: Add the Card to a Dashboard

After registering the resource:

1. Go to any Lovelace dashboard
2. Click **"Edit Dashboard"** (pencil icon, top right)
3. Click **"+ Add Card"**
4. Search for **"Energy Flow Card"** or type **"custom:energy-flow-card"**
5. The **visual configuration editor** should appear

---

## Visual Configuration Editor

The card now includes a full GUI configuration editor with 4 tabs:

### 📊 Energy Sources Tab
- Solar Power Sensor (dropdown)
- Battery Power Sensor (dropdown)
- Battery State of Charge (dropdown)
- Battery Capacity (number input, kWh)
- Grid Power Sensor (dropdown)

### 🔌 Devices Tab
- Click **"+ Add Device"** to add consumption devices
- For each device:
  - Click the icon to change it (15 common icons available)
  - Enter device name
  - Select entity from dropdown
  - Toggle "Show when off" checkbox
  - Click **X** to remove device

### 🎨 Display & Theme Tab
- **Visualization Mode:**
  - Animated Particles
  - Sankey Flow Lines
  - Both (Particles + Sankey)
- Show Statistics Panel (checkbox)
- Update Interval (milliseconds)
- Minimum/Maximum Height (pixels)
- **Theme Colors:**
  - Solar Color (color picker)
  - Battery Color (color picker)
  - Grid Color (color picker)

### ⚠️ Warnings Tab
- Battery Low Warning (% threshold)
- High Grid Import Warning (watts threshold)

---

## Manual YAML Configuration (Optional)

If you prefer YAML editing, here's an example:

```yaml
type: custom:energy-flow-card
entities:
  solar: sensor.givtcp_SERIAL_pv_power
  battery: sensor.givtcp_SERIAL_battery_power
  battery_soc: sensor.givtcp_SERIAL_soc
  battery_capacity: 16.4
  grid: sensor.givtcp_SERIAL_grid_power
devices:
  - id: network
    entity_id: sensor.network_power
    name: Network Equipment
    icon: 🌐
    show_when_off: false
  - id: fridge
    entity_id: sensor.fridge_power
    name: Fridge/Freezer
    icon: 🧊
    show_when_off: true
visualization_mode: both
show_statistics: true
update_interval: 2000
min_height: 400
max_height: 700
warnings:
  battery_low: 20
  grid_import: 3000
theme:
  solar_color: '#ffa500'
  battery_color: '#4caf50'
  grid_color: '#f44336'
```

---

## Troubleshooting

### Error: "Custom element not found: custom:energy-flow-card"

**Cause:** Resource not registered in Lovelace

**Fix:** Follow Step 1 above to register the resource, then hard refresh browser

---

### Error: "Visual editor not supported"

**Cause:** Config editor not loading properly

**Fix:**
1. Clear browser cache completely
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console (F12) for errors
4. Ensure resource URL is correct: `/local/energy-flow-card.js`

---

### Card not appearing in "Add Card" search

**Fix:**
1. Verify resource is registered (Settings → Dashboards → Resources)
2. Check URL is accessible: http://192.168.3.12:8123/local/energy-flow-card.js
3. Hard refresh browser
4. Try manually typing the card type in YAML:
   ```yaml
   type: custom:energy-flow-card
   ```

---

## Features Summary

✅ Real-time energy flow visualization
✅ Physics-based particle animation
✅ Sankey flow lines (power-proportional width)
✅ Battery time remaining calculations
✅ Visual warning indicators (pulsing red rings)
✅ **GUI configuration editor (no YAML needed!)**
✅ Dark theme with glow effects
✅ Responsive layout
✅ Statistics panel (efficiency, self-sufficiency)
✅ Device power monitoring
✅ Theme customization

---

## Next Steps After Installation

1. **Configure Energy Sources:** Select your solar, battery, and grid sensors
2. **Add Devices:** Add consumption devices you want to monitor
3. **Customize Appearance:** Choose visualization mode and colors
4. **Set Warnings:** Configure battery low and grid import thresholds
5. **Test Features:** Watch the real-time flow animation!

---

## Support

- Bundle size: 82.09 KB (24.14 KB gzipped)
- Browser compatibility: Chrome, Firefox, Edge, Safari
- Home Assistant: 2023.1+

For issues, check the browser console (F12) for error messages.
