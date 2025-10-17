# Pushing Energy Flow Card to GitHub

## Repository Information

**GitHub Repository:** https://github.com/tomganleylee/Power-Monitor-card

---

## 📋 Pre-Push Checklist

Before pushing to GitHub, ensure you have:

- [x] Created comprehensive README.md with documentation
- [x] Added HACS configuration (hacs.json)
- [x] Added LICENSE file (MIT)
- [x] Created CONTRIBUTING.md
- [x] Added GitHub issue templates
- [x] Created .gitignore
- [x] Built the card (`npm run build`)
- [ ] Added screenshots to `docs/images/` directory
- [ ] Tested card in Home Assistant
- [ ] Created examples in `examples/` directory

---

## 🚀 Step-by-Step Push Instructions

### Step 1: Initialize Git Repository (if not already done)

```bash
cd "c:\Claude Projects\Power monitor HA\energy-flow-card"
git init
```

### Step 2: Add Remote Repository

```bash
git remote add origin https://github.com/tomganleylee/Power-Monitor-card.git
```

### Step 3: Check Current Status

```bash
git status
```

This will show you all the files that will be committed.

### Step 4: Add All Files

```bash
git add .
```

### Step 5: Commit Your Changes

```bash
git commit -m "Initial commit: Energy Flow Card v1.0.0

- Beautiful animated energy flow visualization
- Particle and Sankey visualization modes
- Hierarchical device categories
- Circuit tracking with remainder calculation
- Battery time remaining calculation
- Customizable themes and warnings
- Comprehensive documentation and examples"
```

### Step 6: Push to GitHub

```bash
git push -u origin main
```

**Note:** If your default branch is `master` instead of `main`, use:
```bash
git push -u origin master
```

If you get an error about divergent branches, you may need to pull first:
```bash
git pull origin main --rebase
git push -u origin main
```

---

## 📸 Adding Screenshots (IMPORTANT!)

After pushing the code, you need to add screenshots to make the README look complete:

### Required Screenshots

1. **demo.gif** - Animated GIF showing the card in action
2. **visualization-modes.png** - Side-by-side comparison
3. **energy-sources.png** - Close-up of nodes
4. **categories.png** - Categories expanded/collapsed
5. **statistics.png** - Statistics panel
6. **circuit-tracking.png** - Circuit remainder example
7. **individual-devices.png** - Multiple devices
8. **minimal-setup.png** - Basic config
9. **complete-system.png** - Full setup
10. **desktop-view.png**, **tablet-view.png**, **mobile-view.png**
11. **dark-theme.png**, **light-theme.png**

### How to Add Screenshots

1. Take screenshots in Home Assistant with the card running
2. Save them to `docs/images/` directory
3. Commit and push:

```bash
git add docs/images/
git commit -m "docs: add screenshots and demo GIF"
git push
```

---

## 🏷️ Creating Your First Release

### Step 1: Tag the Release

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Initial public release"
git push origin v1.0.0
```

### Step 2: Create Release on GitHub

1. Go to https://github.com/tomganleylee/Power-Monitor-card/releases
2. Click **"Draft a new release"**
3. Select tag: **v1.0.0**
4. Release title: **v1.0.0 - Initial Release**
5. Description:
   ```markdown
   # Energy Flow Card v1.0.0

   Initial public release of Energy Flow Card for Home Assistant!

   ## ✨ Features

   - 🎨 Dual visualization modes (Particles & Sankey)
   - 🔋 Real-time energy source monitoring (Solar, Battery, Grid)
   - 📊 Hierarchical device categories
   - 🎯 Circuit tracking with remainder calculation
   - ⏱️ Battery time remaining estimation
   - 🎨 Customizable themes
   - 📱 Responsive design

   ## 📦 Installation

   ### HACS
   1. Add custom repository: `https://github.com/tomganleylee/Power-Monitor-card`
   2. Install from HACS
   3. Restart Home Assistant

   ### Manual
   1. Download `energy-flow-card.js`
   2. Copy to `/config/www/`
   3. Add to Lovelace resources

   ## 📚 Documentation

   See [README.md](https://github.com/tomganleylee/Power-Monitor-card#readme) for full documentation.

   ## 🐛 Known Issues

   None at this time.

   ## 🙏 Credits

   Built with Lit web components and love for the Home Assistant community!
   ```
6. Attach the file: Upload `dist/energy-flow-card.js`
7. Click **"Publish release"**

---

## 🎯 Submitting to HACS Default Repository (Optional)

To get your card listed in HACS by default:

1. Ensure you have at least 3 releases
2. Go to https://github.com/hacs/default
3. Fork the repository
4. Add your repository to `lovelace/plugins` in the JSON file
5. Create a Pull Request

---

## 🔄 Updating the Card

When you make changes:

```bash
# Make your changes
npm run build

# Commit changes
git add .
git commit -m "feat: add new feature" # or "fix: resolve bug"
git push

# Create new tag for release
git tag -a v1.0.1 -m "Release v1.0.1 - Bug fixes"
git push origin v1.0.1

# Create release on GitHub as above
```

---

## 🛠️ Troubleshooting

### Authentication Error
If you get authentication errors:
1. Go to https://github.com/settings/tokens
2. Create a Personal Access Token
3. Use the token as your password when pushing

Or set up SSH keys:
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: Settings → SSH Keys
3. Change remote URL:
   ```bash
   git remote set-url origin git@github.com:tomganleylee/Power-Monitor-card.git
   ```

### Wrong Branch Name
If you're on `master` instead of `main`:
```bash
git branch -M main
git push -u origin main
```

### Large File Warning
If `dist/energy-flow-card.js` is too large:
- It should be fine (~83KB)
- If needed, ensure it's minified
- Check `.gitignore` isn't excluding it

---

## ✅ Post-Push Checklist

After pushing to GitHub:

- [ ] Verify files appear on GitHub
- [ ] Check README renders correctly
- [ ] Add screenshots to make README complete
- [ ] Create v1.0.0 release with built file
- [ ] Test HACS installation
- [ ] Share on Home Assistant Community forum
- [ ] Tweet about it (if you want!)

---

## 📞 Need Help?

- Check the GitHub repository for issues
- Refer to git documentation: https://git-scm.com/doc
- Ask in Home Assistant Discord

---

**Good luck! 🚀**
