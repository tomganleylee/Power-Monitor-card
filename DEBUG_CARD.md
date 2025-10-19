# Debug Energy Flow Card Loading Issue

## Current Status
✅ File deployed: 82.1 KB at `/config/www/energy-flow-card.js`
✅ Resource registered in Lovelace
✅ Custom element definition exists in file
❌ Card not loading in browser

## The Problem
The card file is complete and correct, but the browser isn't loading it properly. This is likely a **browser caching issue**.

---

## Solution Steps

### Step 1: Clear All Browser Cache

#### Chrome/Edge:
1. Press `Ctrl + Shift + Delete`
2. Select "All time"
3. Check:
   - Cached images and files
   - Cookies and other site data
4. Click "Clear data"
5. Close browser completely
6. Reopen browser

#### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Select "Everything"
3. Check all boxes
4. Click "Clear Now"
5. Close browser completely
6. Reopen browser

---

### Step 2: Force Reload the Resource

After clearing cache:

1. Open Home Assistant
2. Open browser console (F12)
3. Go to "Console" tab
4. Type this command and press Enter:

```javascript
console.clear();
// Force reload the energy flow card
const script = document.createElement('script');
script.type = 'module';
script.src = '/local/energy-flow-card.js?v=' + Date.now();
document.head.appendChild(script);
console.log('Energy Flow Card force loaded');
```

5. Wait 2-3 seconds
6. Check if any errors appear in console

---

### Step 3: Verify Card is Loaded

In the browser console, type:

```javascript
console.log('customElements:', customElements.get('energy-flow-card'));
console.log('customCards:', window.customCards);
```

**Expected output:**
- `customElements: class EnergyFlowCard extends ...`
- `customCards: Array` with "Energy Flow Card" in the list

**If you see `undefined` or errors**, the script isn't loading.

---

### Step 4: Manual Card Addition

If the card still doesn't appear in "Add Card" search:

1. Edit dashboard (YAML mode)
2. Manually add this configuration:

```yaml
type: custom:energy-flow-card
entities:
  solar: sensor.givtcp_SA2243G285_pv_power
  battery: sensor.givtcp_SA2243G285_battery_power
  battery_soc: sensor.givtcp_SA2243G285_soc
  battery_capacity: 16.4
  grid: sensor.givtcp_SA2243G285_grid_power
devices: []
visualization_mode: particles
show_statistics: true
update_interval: 2000
```

3. Save and check if card appears

---

### Step 5: Check Network Tab

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Filter by "JS"
4. Hard refresh page (Ctrl+Shift+R)
5. Look for `energy-flow-card.js`

**What to check:**
- **Status Code:** Should be `200 OK` (not 304, not 404)
- **Size:** Should show ~82 KB
- **Type:** Should be `script` or `module`

If you see:
- **304 Not Modified** → Cache issue, need to clear more aggressively
- **404 Not Found** → File path issue
- **(failed)** → Network/permission issue

---

### Step 6: Nuclear Option - Change Filename

If cache issues persist, we can rename the file:

```powershell
# On your computer, in PowerShell:
ssh root@192.168.3.12 "cp /config/www/energy-flow-card.js /config/www/energy-flow-card-v2.js"
```

Then update the resource URL in Home Assistant:
1. Settings → Dashboards → Resources
2. Find `/local/energy-flow-card.js`
3. Edit it to `/local/energy-flow-card-v2.js`
4. Save
5. Hard refresh browser

---

## Common Issues & Solutions

### Issue: "Custom element not found"
**Cause:** Script not loaded or cached old version
**Fix:** Clear cache completely + hard refresh multiple times

### Issue: Resource shows but card doesn't work
**Cause:** JavaScript error in card code
**Fix:** Check browser console for red errors, send screenshot

### Issue: "Visual editor not supported"
**Cause:** Config editor initialization error
**Fix:** Use YAML mode for now, we can debug editor separately

---

## What to Send Me if Still Not Working

If none of the above works, please send:

1. **Browser Console Output** (F12 → Console tab)
   - Any red errors
   - Result of `customElements.get('energy-flow-card')`
   - Result of `window.customCards`

2. **Network Tab** (F12 → Network → filter "energy")
   - Screenshot showing status of energy-flow-card.js

3. **Resource List** (Settings → Dashboards → Resources)
   - Screenshot of registered resources

4. **Browser & Version**
   - Which browser (Chrome, Firefox, Edge, Safari)
   - Version number

---

## Quick Test Script

Run this in browser console to test everything:

```javascript
(async function testCard() {
  console.log('=== Energy Flow Card Diagnostic ===');

  // Check if resource URL is accessible
  try {
    const response = await fetch('/local/energy-flow-card.js?v=' + Date.now());
    console.log('✓ File accessible:', response.status, response.ok);
    const text = await response.text();
    console.log('✓ File size:', (text.length / 1024).toFixed(1), 'KB');
    console.log('✓ Contains registration:', text.includes('window.customCards'));
    console.log('✓ Contains element:', text.includes('energy-flow-card'));
  } catch (e) {
    console.error('✗ File not accessible:', e);
  }

  // Check if custom element is defined
  const element = customElements.get('energy-flow-card');
  console.log('Custom element defined:', element !== undefined);

  // Check customCards registry
  const cards = window.customCards || [];
  const cardEntry = cards.find(c => c.type === 'custom:energy-flow-card');
  console.log('CustomCards entry:', cardEntry);

  // Check if config editor is defined
  const editor = customElements.get('energy-flow-card-editor');
  console.log('Config editor defined:', editor !== undefined);

  console.log('=== End Diagnostic ===');
})();
```

Copy the entire output and send it to me.
