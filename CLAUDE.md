# Power monitor HA Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-15

## Active Technologies
- TypeScript 5.x (compiled to ES2020), HTML5, CSS3 (001-energy-flow-card)

## Project Structure
```
backend/
frontend/
tests/
```

## Commands
npm test; npm run lint

## Code Style
TypeScript 5.x (compiled to ES2020), HTML5, CSS3: Follow standard conventions

## Recent Changes
- 001-energy-flow-card: Added TypeScript 5.x (compiled to ES2020), HTML5, CSS3

<!-- MANUAL ADDITIONS START -->
## Deployment Process

When making changes to the energy-flow-card:

1. **Increment version number** in three places:
   - `energy-flow-card/src/energy-flow-card.ts` - Line ~870 (canvas render)
   - `energy-flow-card/src/energy-flow-card.ts` - Line ~1281 (VERSION constant)
   - `energy-flow-card/package.json` - version field

2. **Build the card**:
   ```bash
   cd energy-flow-card
   npm run build
   ```

3. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

4. **Create GitHub release** using the GitHub CLI:
   ```bash
   gh release create v1.0.X --title "v1.0.X - Title" --notes "Release notes" --repo tomganleylee/Power-Monitor-card
   ```

5. **Install via HACS**:
   - Go to HACS → Frontend
   - Find Energy Flow Card
   - Click Update
   - Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

<!-- MANUAL ADDITIONS END -->
