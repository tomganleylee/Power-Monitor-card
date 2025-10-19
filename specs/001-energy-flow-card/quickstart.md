# Quickstart Guide: Energy Flow Card Development

**Feature**: `001-energy-flow-card`
**Date**: 2025-10-15
**Audience**: Developers implementing this feature

## Overview

This guide provides the essential information to start developing the Home Assistant Energy Flow Visualization Card. Read this before writing any code.

---

## Prerequisites

### Development Environment

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Home Assistant**: 2023.x or higher (for testing)
- **IDE**: VS Code recommended (with ESLint + Prettier extensions)

### Knowledge Requirements

- TypeScript (intermediate level)
- LitElement / Web Components basics
- HTML5 Canvas API
- Home Assistant custom card development (helpful but not required)

---

## Project Setup

### 1. Initialize Project

```bash
# Create project directory
mkdir energy-flow-card
cd energy-flow-card

# Initialize npm project
npm init -y

# Install dependencies
npm install lit@^3.0.0 d3-force@^3.0.0

# Install dev dependencies
npm install --save-dev \
  typescript@^5.0.0 \
  rollup@^4.0.0 \
  @rollup/plugin-typescript@^11.0.0 \
  @rollup/plugin-terser@^0.4.0 \
  rollup-plugin-filesize@^10.0.0 \
  jest@^29.0.0 \
  @testing-library/dom@^9.0.0 \
  playwright@^1.40.0 \
  eslint@^8.0.0 \
  prettier@^3.0.0
```

### 2. Configure TypeScript

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 3. Configure Build (Rollup)

Create `rollup.config.js`:
```javascript
import typescript from '@rollup/plugin-typescript';
import { terser } from '@rollup/plugin-terser';
import filesize from 'rollup-plugin-filesize';

export default {
  input: 'src/energy-flow-card.ts',
  output: {
    file: 'dist/energy-flow-card.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    typescript({
      target: 'ES2020',
      module: 'ESNext',
      declaration: false
    }),
    terser({
      ecma: 2020,
      module: true,
      compress: { passes: 2 },
      mangle: { properties: { regex: /^_/ } }
    }),
    filesize({
      showBeforeSizes: 'build'
    })
  ]
};
```

### 4. Add NPM Scripts

Update `package.json`:
```json
{
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w",
    "test": "jest",
    "test:integration": "playwright test",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

---

## Development Workflow

### Phase 1: Core Card Structure (P1 - MVP)

**Goal**: Implement User Story 1 - View Real-Time Energy Flow

#### Step 1.1: Create Main Card Component

```typescript
// src/energy-flow-card.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant, LovelaceCard, LovelaceCardConfig } from 'custom-card-helpers';

interface EnergyFlowCardConfig extends LovelaceCardConfig {
  type: 'custom:energy-flow-card';
  entities?: {
    solar?: string;
    battery?: string;
    grid?: string;
  };
}

@customElement('energy-flow-card')
export class EnergyFlowCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: EnergyFlowCardConfig;

  public static getStubConfig() {
    return {
      type: 'custom:energy-flow-card',
      entities: {}
    };
  }

  public getCardSize() {
    return 4;
  }

  public setConfig(config: EnergyFlowCardConfig) {
    if (!config) throw new Error('Invalid configuration');
    this._config = config;
  }

  protected render() {
    if (!this._config || !this.hass) {
      return html`<ha-card>Loading...</ha-card>`;
    }

    return html`
      <ha-card>
        <div class="card-content">
          <canvas id="energy-canvas"></canvas>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    canvas {
      width: 100%;
      height: 400px;
    }
  `;
}

// Register card
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'energy-flow-card',
  name: 'Energy Flow Card',
  description: 'Visualize real-time energy flow'
});
```

#### Step 1.2: Implement Sensor Manager

**Purpose**: Subscribe to Home Assistant sensors and normalize state

```typescript
// src/sensor-manager.ts
import type { HomeAssistant, HassEntity } from 'custom-card-helpers';

export interface SensorState {
  entityId: string;
  value: number;
  unit: string;
  isStale: boolean;
  lastUpdated: number;
}

export class SensorManager {
  private hass: HomeAssistant;
  private unsubscribe?: () => void;
  private states = new Map<string, SensorState>();
  private staleTimeouts = new Map<string, number>();
  private callback: (states: Map<string, SensorState>) => void;

  constructor(hass: HomeAssistant, callback: (states: Map<string, SensorState>) => void) {
    this.hass = hass;
    this.callback = callback;
  }

  public subscribe(entityIds: string[]) {
    // Subscribe to entity state changes
    this.unsubscribe = this.hass.connection.subscribeEntities((entities) => {
      let changed = false;

      for (const entityId of entityIds) {
        const entity = entities[entityId];
        if (entity) {
          const newState = this.parseEntity(entityId, entity);
          const oldState = this.states.get(entityId);

          if (!oldState || oldState.value !== newState.value) {
            this.states.set(entityId, newState);
            changed = true;
            this.resetStaleTimeout(entityId);
          }
        }
      }

      if (changed) {
        this.callback(this.states);
      }
    });
  }

  private parseEntity(entityId: string, entity: HassEntity): SensorState {
    const value = parseFloat(entity.state);
    return {
      entityId,
      value: isNaN(value) ? 0 : value,
      unit: entity.attributes.unit_of_measurement || 'W',
      isStale: false,
      lastUpdated: Date.now()
    };
  }

  private resetStaleTimeout(entityId: string) {
    clearTimeout(this.staleTimeouts.get(entityId));

    const timeout = window.setTimeout(() => {
      const state = this.states.get(entityId);
      if (state) {
        state.isStale = true;
        this.callback(this.states);
      }
    }, 60000);

    this.staleTimeouts.set(entityId, timeout);
  }

  public destroy() {
    if (this.unsubscribe) this.unsubscribe();
    this.staleTimeouts.forEach(clearTimeout);
  }
}
```

#### Step 1.3: Implement Particle Engine

**Purpose**: Render animated particles on canvas

```typescript
// src/particle-engine.ts
export interface Particle {
  id: number;
  x: number;
  y: number;
  progress: number;
  speed: number;
  color: string;
  isActive: boolean;
}

export class ParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private particlePool: Particle[] = [];
  private nextId = 0;
  private animationId = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    // Pre-allocate particle pool
    for (let i = 0; i < 200; i++) {
      this.particlePool.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    return {
      id: this.nextId++,
      x: 0,
      y: 0,
      progress: 0,
      speed: 0.01,
      color: '#3b82f6',
      isActive: false
    };
  }

  public spawnParticle(startX: number, startY: number, endX: number, endY: number, color: string) {
    const particle = this.particlePool.pop() || this.createParticle();
    particle.x = startX;
    particle.y = startY;
    particle.progress = 0;
    particle.color = color;
    particle.isActive = true;
    this.particles.push(particle);
  }

  public start() {
    this.animate();
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.progress += particle.speed;

      if (particle.progress >= 1) {
        particle.isActive = false;
        this.particles.splice(i, 1);
        this.particlePool.push(particle);
      } else {
        this.drawParticle(particle);
      }
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  private drawParticle(particle: Particle) {
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  public stop() {
    cancelAnimationFrame(this.animationId);
  }
}
```

---

## Testing Strategy

### Unit Tests (Jest)

```typescript
// tests/unit/sensor-manager.test.ts
import { SensorManager } from '../../src/sensor-manager';

describe('SensorManager', () => {
  it('should parse sensor values correctly', () => {
    const mockHass = {
      connection: {
        subscribeEntities: jest.fn()
      }
    };

    const callback = jest.fn();
    const manager = new SensorManager(mockHass as any, callback);

    // Test implementation
  });
});
```

### Integration Tests (Playwright)

```typescript
// tests/integration/card-lifecycle.spec.ts
import { test, expect } from '@playwright/test';

test('card renders with valid configuration', async ({ page }) => {
  await page.goto('http://localhost:8123/');
  // Test card rendering in Home Assistant
});
```

---

## Home Assistant Integration

### HACS Installation (Manual)

1. Copy `dist/energy-flow-card.js` to `custom_components/energy-flow-card/`
2. Add to Lovelace resources:
```yaml
resources:
  - url: /local/energy-flow-card.js
    type: module
```

### Add Card to Dashboard

```yaml
type: custom:energy-flow-card
entities:
  solar: sensor.solar_power
  battery: sensor.battery_power
  grid: sensor.grid_power
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────┐
│ EnergyFlowCard (LitElement)                         │
│ - Main entry point                                  │
│ - Manages card lifecycle                            │
│ - Renders canvas + UI                               │
└───────────────┬─────────────────────────────────────┘
                │
         ┌──────┴──────┬──────────────┬
         │             │              │
┌────────▼────────┐ ┌─▼─────────┐ ┌─▼────────────┐
│ SensorManager   │ │ ParticleEngine│ │ NodeRenderer │
│ - WS subscribe  │ │ - Canvas draw │ │ - Layout     │
│ - State parse   │ │ - Animation   │ │ - Positioning│
└─────────────────┘ └───────────────┘ └──────────────┘
```

---

## Key Decisions from Research

- **Canvas over SVG**: Better performance for 100+ animated particles
- **LitElement**: Required for Home Assistant integration
- **d3-force**: Automatic node layout without overlap
- **Object pooling**: Prevents GC pauses during animation
- **60-second stale timeout**: Show warnings but retain last valid value

---

## Helpful Resources

- [Home Assistant Custom Cards](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
- [LitElement Docs](https://lit.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [d3-force Documentation](https://github.com/d3/d3-force)

---

## Next Steps

1. Review [data-model.md](data-model.md) for complete type definitions
2. Review [contracts/card-config.schema.json](contracts/card-config.schema.json) for configuration validation
3. Run `/speckit.tasks` to generate actionable implementation tasks
4. Begin with P1 tasks (MVP - User Story 1)

---

**Questions?** Refer back to:
- [spec.md](spec.md) - Feature requirements
- [plan.md](plan.md) - Implementation plan
- [research.md](research.md) - Technical decisions
