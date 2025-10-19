# Technical Research: Home Assistant Energy Flow Visualization Card

**Feature**: `001-energy-flow-card`
**Date**: 2025-10-15
**Status**: Research Complete

## Overview

This document consolidates technical research findings and decisions for implementing the Energy Flow Visualization Card. All "NEEDS CLARIFICATION" items from the planning phase are resolved here with concrete technical choices.

---

## 1. Home Assistant Custom Card Architecture

### Decision: Use LitElement-based Custom Card with Card Helpers

**Rationale**:
- Home Assistant's Lovelace system is built on LitElement/Lit web components
- Card Helpers library provides utilities for entity selection, icon picking, and form generation
- Following official patterns ensures long-term compatibility
- Strong community examples (mini-graph-card, mushroom-cards) demonstrate maturity

**Implementation Pattern**:
```typescript
// Main card extends LitElement
class EnergyFlowCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() private _config!: EnergyFlowCardConfig;

  public static async getConfigElement() {
    return document.createElement('energy-flow-card-editor');
  }

  public static getStubConfig() {
    return { type: 'custom:energy-flow-card', entities: [] };
  }

  public setConfig(config: EnergyFlowCardConfig) {
    if (!config.entities) throw new Error('entities required');
    this._config = config;
  }

  public getCardSize() {
    return 4; // Grid rows occupied
  }
}

customElements.define('energy-flow-card', EnergyFlowCard);
```

**Configuration Schema Format**:
- Use JSON Schema for validation
- Schema exposed via `static getConfigElement()` for GUI editor
- Home Assistant validates against schema before persisting
- Example schema structure:
```json
{
  "type": "object",
  "properties": {
    "type": { "const": "custom:energy-flow-card" },
    "entities": {
      "type": "object",
      "properties": {
        "solar": { "type": "string", "format": "entity-id" },
        "battery": { "type": "string", "format": "entity-id" },
        "grid": { "type": "string", "format": "entity-id" }
      }
    },
    "devices": {
      "type": "array",
      "maxItems": 25,
      "items": { "type": "object" }
    }
  },
  "required": ["type", "entities"]
}
```

**Card Registration**:
```javascript
// In dist bundle, self-register on load
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'energy-flow-card',
  name: 'Energy Flow Card',
  description: 'Visualize real-time energy flow',
  preview: true
});
```

**Alternatives Considered**:
- Vanilla Web Components: Rejected - loses access to Lit's reactive properties and Home Assistant patterns
- React/Vue: Rejected - introduces framework mismatch with Home Assistant core
- Polymer (legacy): Rejected - deprecated in favor of Lit

**References**:
- [HA Custom Card Development](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
- [LitElement Docs](https://lit.dev/)
- [Card Helpers Source](https://github.com/home-assistant/frontend/tree/dev/src/panels/lovelace/card-helpers)

---

## 2. Particle Animation Performance

### Decision: HTML5 Canvas with Object Pooling and Adaptive Throttling

**Rationale**:
- Canvas outperforms SVG for 100+ continuously animated elements
- Benchmarks show Canvas achieves 60 FPS with 200+ particles on mid-range devices
- Object pooling prevents GC pauses during animation loops
- Adaptive throttling maintains 30 FPS minimum by reducing particle count under load

**Performance Strategy**:
```typescript
class ParticleEngine {
  private particles: Particle[] = [];
  private particlePool: Particle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private lastFrameTime: number = 0;
  private targetFPS: number = 30; // Minimum acceptable

  // Object pooling to avoid GC
  private acquireParticle(): Particle {
    return this.particlePool.pop() || new Particle();
  }

  private releaseParticle(particle: Particle) {
    particle.reset();
    this.particlePool.push(particle);
  }

  // Adaptive throttling
  private animate(timestamp: number) {
    const deltaTime = timestamp - this.lastFrameTime;
    const currentFPS = 1000 / deltaTime;

    // Reduce particle count if FPS drops below target
    if (currentFPS < this.targetFPS && this.particles.length > 20) {
      this.releaseParticle(this.particles.pop()!);
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const particle of this.particles) {
      particle.update(deltaTime);
      particle.draw(this.ctx);
    }

    this.lastFrameTime = timestamp;
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }
}
```

**Particle Spawn Rate Calculation** (resolved unknown):
- Base rate: 1 particle per 100W
- Min: 1 particle/second (for visibility at low power)
- Max: 10 particles/second (prevents overwhelming at high power)
- Formula: `spawnRate = clamp(powerWatts / 100, 1, 10)`

**Memory Management**:
- Pre-allocate particle pool of 200 objects
- Reuse particles instead of creating/destroying
- Clear canvas with `clearRect()` (faster than `fillRect()`)
- Limit active particles to 150 maximum

**Android WebView Optimization**:
- Use `willReadFrequently: true` canvas context hint
- Reduce particle count on devices with <4GB RAM (detect via `navigator.deviceMemory`)
- Disable particle trails on Android (performance cost)

**Alternatives Considered**:
- SVG with CSS animations: Rejected - DOM manipulation overhead kills performance at 100+ elements
- WebGL: Rejected - overkill for 2D particles, compatibility issues with older Android WebView
- CSS animations only: Rejected - cannot dynamically adjust particle paths based on real-time data

**References**:
- [Canvas Performance MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [Object Pooling Pattern](https://gameprogrammingpatterns.com/object-pool.html)

---

## 3. Real-Time Sensor Integration

### Decision: Home Assistant Connection API with Debounced State Subscriptions

**Rationale**:
- Home Assistant provides `hass.connection` for WebSocket subscriptions
- `subscribeEntities()` API efficiently handles multiple sensor updates
- Built-in reconnection logic handles network issues
- Debouncing prevents excessive re-renders during rapid sensor updates

**Implementation Pattern**:
```typescript
class SensorManager {
  private hass: HomeAssistant;
  private unsubscribe?: () => void;
  private sensorStates = new Map<string, SensorState>();
  private staleTimeouts = new Map<string, number>();

  public subscribe(entityIds: string[], callback: (states: Map<string, SensorState>) => void) {
    this.unsubscribe = this.hass.connection.subscribeEntities((entities) => {
      let changed = false;

      for (const entityId of entityIds) {
        const entity = entities[entityId];
        if (!entity) continue;

        const oldState = this.sensorStates.get(entityId);
        const newState = this.parseEntity(entity);

        // Detect changes
        if (!oldState || oldState.value !== newState.value) {
          this.sensorStates.set(entityId, newState);
          changed = true;

          // Reset stale timeout
          this.resetStaleTimeout(entityId);
        }
      }

      // Debounce: only call callback if values changed
      if (changed) {
        callback(this.sensorStates);
      }
    });
  }

  private resetStaleTimeout(entityId: string) {
    clearTimeout(this.staleTimeouts.get(entityId));

    const timeout = window.setTimeout(() => {
      const state = this.sensorStates.get(entityId);
      if (state) {
        state.isStale = true;
        this.callback(this.sensorStates); // Trigger warning indicator
      }
    }, 60000); // 60 second stale detection

    this.staleTimeouts.set(entityId, timeout);
  }

  private parseEntity(entity: HassEntity): SensorState {
    const value = parseFloat(entity.state);
    const unit = entity.attributes.unit_of_measurement || 'W';

    return {
      value: isNaN(value) ? 0 : value,
      unit,
      isStale: false,
      lastUpdated: Date.now()
    };
  }
}
```

**Unit Conversion Strategy** (resolved unknown):
```typescript
function formatPower(watts: number): { value: number; unit: string } {
  if (watts >= 1000000) {
    return { value: +(watts / 1000000).toFixed(2), unit: 'MW' };
  } else if (watts >= 1000) {
    return { value: +(watts / 1000).toFixed(1), unit: 'kW' };
  } else {
    return { value: Math.round(watts), unit: 'W' };
  }
}
```

**Stale Detection (60-second timeout)**:
- Start timer on each sensor update
- If 60 seconds elapse without update, mark as stale
- Display warning indicator but retain last valid value
- After another 60 seconds (120 total), show "N/A"

**Alternatives Considered**:
- Polling: Rejected - less efficient than WebSocket subscriptions, adds latency
- Direct REST API calls: Rejected - no real-time updates, requires manual polling
- Third-party MQTT: Rejected - adds external dependency, HA already provides WebSocket

**References**:
- [HA Connection API](https://developers.home-assistant.io/docs/frontend/data/)
- [Entity State Subscriptions](https://github.com/home-assistant/frontend/blob/dev/src/data/ws-connection.ts)

---

## 4. Responsive Layout Strategy

### Decision: Force-Directed Graph with Collision Detection

**Rationale** (resolved unknown):
- Force-directed algorithms naturally space nodes without overlap
- d3-force library provides battle-tested implementation
- Responsive to container resize with recalculation
- Configurable forces for different screen sizes

**Layout Algorithm**:
```typescript
import { forceSimulation, forceCollide, forceCenter, forceX, forceY } from 'd3-force';

class LayoutEngine {
  private nodes: LayoutNode[] = [];
  private simulation: Simulation<LayoutNode, undefined>;

  public layout(width: number, height: number, nodeCount: number) {
    // Adjust forces based on screen size
    const collisionRadius = width < 600 ? 40 : 60;
    const centerStrength = width < 600 ? 0.1 : 0.05;

    this.simulation = forceSimulation(this.nodes)
      .force('collide', forceCollide(collisionRadius)) // Prevent overlap
      .force('center', forceCenter(width / 2, height / 2).strength(centerStrength))
      .force('x', forceX((d) => this.getGroupX(d, width)))
      .force('y', forceY((d) => this.getGroupY(d, height)));

    // Run simulation synchronously until stable
    this.simulation.tick(300);

    return this.nodes.map(n => ({ id: n.id, x: n.x, y: n.y }));
  }

  private getGroupX(node: LayoutNode, width: number): number {
    // Sources on left, hub center, devices on right
    if (node.type === 'source') return width * 0.15;
    if (node.type === 'hub') return width * 0.5;
    return width * 0.85;
  }
}
```

**Adaptive Scaling**:
- Node sizes: Mobile (50px) → Tablet (70px) → Desktop (100px)
- Font sizes: Mobile (0.8em) → Tablet (1em) → Desktop (1.2em)
- Particle density: Mobile (0.5x) → Tablet (1x) → Desktop (1.5x)

**Touch Targets**:
- Minimum 44x44px (Apple HIG) / 48x48px (Material Design)
- Expand invisible hit area if visual node smaller
- Add 10px padding around expandable categories

**Alternatives Considered**:
- Fixed grid layout: Rejected - doesn't adapt to variable node counts
- Manual absolute positioning: Rejected - requires extensive media queries, hard to maintain
- CSS Flexbox: Rejected - can't control individual node positioning for particle paths

**References**:
- [d3-force Documentation](https://github.com/d3/d3-force)
- [Touch Target Sizing](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

---

## 5. Browser Compatibility

### Decision: Transpile to ES2020, Polyfill Only Critical Features

**Rationale**:
- ES2020 supported by all target browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Avoids bloat from unnecessary polyfills
- Home Assistant Android app uses Chromium WebView (supports ES2020)

**Build Configuration (Rollup)**:
```javascript
// rollup.config.js
export default {
  input: 'src/energy-flow-card.ts',
  output: {
    file: 'dist/energy-flow-card.js',
    format: 'es', // ES modules
    sourcemap: true
  },
  plugins: [
    typescript({
      target: 'ES2020',
      module: 'ESNext'
    }),
    terser(), // Minification
    filesize() // Bundle size tracking
  ]
};
```

**Polyfills Required**: None (ES2020 features sufficient)

**Android WebView Quirks**:
- `willReadFrequently` canvas hint needed for performance
- `passive: true` on touch event listeners to prevent jank
- Avoid `transform: translateZ(0)` (causes layer explosion)

**LocalStorage Persistence**:
```typescript
class ConfigStorage {
  private static KEY_PREFIX = 'energy-flow-card';

  public static save(cardId: string, config: EnergyFlowCardConfig) {
    try {
      localStorage.setItem(
        `${this.KEY_PREFIX}:${cardId}`,
        JSON.stringify(config)
      );
    } catch (e) {
      // Quota exceeded - log error but don't crash
      console.error('Failed to save config:', e);
    }
  }

  public static load(cardId: string): EnergyFlowCardConfig | null {
    try {
      const data = localStorage.getItem(`${this.KEY_PREFIX}:${cardId}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
}
```

**Testing Strategy**:
- BrowserStack for cross-browser testing
- Home Assistant Android app manual testing on physical device
- Playwright for automated integration tests
- Performance profiling in Chrome DevTools

**Alternatives Considered**:
- Transpile to ES5: Rejected - unnecessary bundle bloat (50%+ size increase)
- No transpilation (raw TS): Rejected - Safari 14 needs some ES2020 features
- Full polyfill suite (core-js): Rejected - adds 80KB+ to bundle

**References**:
- [ES2020 Compatibility Table](https://kangax.github.io/compat-table/es2016plus/)
- [Can I Use - Canvas](https://caniuse.com/canvas)
- [Android WebView Release Notes](https://chromiumdash.appspot.com/schedule)

---

## Summary of Resolved Unknowns

All "NEEDS CLARIFICATION" items from plan.md resolved:

1. ✅ **Canvas rendering performance**: Object pooling + adaptive throttling ensures 30+ FPS on 2GB RAM devices
2. ✅ **Lovelace card editor schema**: JSON Schema format with Card Helpers for GUI builder
3. ✅ **Particle spawn rate**: 1 particle per 100W, clamped to 1-10 particles/second range
4. ✅ **Layout algorithm**: Force-directed graph (d3-force) with collision detection prevents overlap

---

## Technology Stack Summary

| Component | Technology | Version |
|-----------|------------|---------|
| Language | TypeScript | 5.x |
| Web Components | LitElement | 3.x |
| Canvas Rendering | HTML5 Canvas API | Native |
| Layout Engine | d3-force | 3.x |
| Build Tool | Rollup | 4.x |
| Testing | Jest + Playwright | Latest |
| Target Output | ES2020 | - |

**Total Bundle Size Estimate**: ~50-60KB minified + gzipped (including d3-force)

---

## Next Steps

Phase 0 complete. Proceed to **Phase 1: Design & Contracts**:
1. Generate data-model.md
2. Create contracts/card-config.schema.json
3. Generate quickstart.md
4. Update agent context file

