# Implementation Plan: Home Assistant Energy Flow Visualization Card

**Branch**: `001-energy-flow-card` | **Date**: 2025-10-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-energy-flow-card/spec.md`

## Summary

A custom Home Assistant dashboard card that visualizes real-time energy flow between power sources (solar, battery, grid) and consumption devices using animated particle effects. The card provides an intuitive "at-a-glance" view of household energy distribution with support for hierarchical device grouping, battery status monitoring, and responsive design for tablets, phones, and desktop browsers.

**Primary Requirement**: Real-time animated visualization showing power magnitude through particle density, color-coded by energy source, with expandable device categories and GUI-based configuration.

**Technical Approach**: Custom web component (LitElement) integrated with Home Assistant's Lovelace dashboard system, using HTML5 Canvas for particle animations, WebSocket subscriptions for real-time sensor updates, and localStorage for configuration persistence.

## Technical Context

**Language/Version**: TypeScript 5.x (compiled to ES2020), HTML5, CSS3
**Primary Dependencies**:
- LitElement 3.x (Web Components)
- Home Assistant Frontend APIs (hass object, custom card interface)
- HTML5 Canvas API (particle rendering)
- Home Assistant Lovelace Card Helpers

**Storage**: Browser localStorage (card configuration), no backend storage required
**Testing**:
- Jest + Testing Library (unit tests)
- Playwright (integration tests with Home Assistant)
- Manual testing on target devices (Android app, tablets)

**Target Platform**:
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Home Assistant Android app (WebView)
- Responsive: 320px to 2560px width

**Project Type**: Web (single custom card component)

**Performance Goals**:
- 30+ FPS particle animation with 25 devices
- <2 second sensor update response
- <200ms interaction response (expand/collapse)
- Smooth rendering on 2GB RAM devices

**Constraints**:
- Maximum 25 devices, 10 categories (scalability limit)
- 60-second stale data timeout
- Single-level category nesting only
- All categories default to collapsed state
- Must integrate with Home Assistant card editor

**Scale/Scope**:
- Single custom card component
- ~2000-3000 LOC (TypeScript + template)
- 7 user stories (1 P1, 4 P2, 2 P3)
- 23 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS - No constitution file provided (template default), proceeding with standard best practices.

**Applicable Principles** (Default for custom component project):
- **Component-First**: Single custom card, self-contained
- **No Backend Required**: Client-side only, browser-based storage
- **Testing Required**: Unit + integration tests mandatory before implementation
- **Home Assistant Integration**: Must follow HA custom card conventions

## Project Structure

### Documentation (this feature)

```
specs/001-energy-flow-card/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (in progress)
├── data-model.md        # Phase 1 output (pending)
├── quickstart.md        # Phase 1 output (pending)
├── contracts/           # Phase 1 output (pending)
│   └── card-config.schema.json
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```
energy-flow-card/
├── src/
│   ├── energy-flow-card.ts        # Main card component (LitElement)
│   ├── types.ts                   # TypeScript interfaces
│   ├── config-editor.ts           # GUI configuration component
│   ├── particle-engine.ts         # Canvas particle rendering
│   ├── node-renderer.ts           # Energy node visualization
│   ├── sensor-manager.ts          # Home Assistant sensor integration
│   ├── styles.ts                  # Lit CSS styles
│   └── utils/
│       ├── power-calculations.ts  # Hierarchical power math
│       ├── unit-formatter.ts      # W/kW auto-scaling
│       └── layout-engine.ts       # Responsive node positioning
│
├── tests/
│   ├── unit/
│   │   ├── particle-engine.test.ts
│   │   ├── power-calculations.test.ts
│   │   ├── unit-formatter.test.ts
│   │   └── sensor-manager.test.ts
│   ├── integration/
│   │   ├── card-lifecycle.test.ts
│   │   ├── config-editor.test.ts
│   │   └── hass-integration.test.ts
│   └── visual/
│       └── particle-animation.manual.html
│
├── dist/                          # Build output (bundled JS)
├── package.json
├── tsconfig.json
├── rollup.config.js               # Build configuration
└── README.md
```

**Structure Decision**: Single project (Option 1) - Custom web component with no backend. All logic client-side using LitElement for Home Assistant integration. Canvas-based rendering for performance. Standard Home Assistant custom card file structure.

## Complexity Tracking

*No violations - constitution check passed*

---

## Phase 0: Research & Technical Decisions

*Status: Starting Phase 0 - generating research.md*

### Research Areas Identified

1. **Home Assistant Custom Card Architecture**
   - Lovelace card interface requirements
   - Card registration and discovery
   - Configuration schema validation
   - GUI editor integration patterns

2. **Particle Animation Performance**
   - Canvas vs SVG for 100+ animated particles
   - RequestAnimationFrame optimization
   - Throttling strategies for 30+ FPS
   - Memory management for continuous rendering

3. **Real-Time Sensor Integration**
   - Home Assistant WebSocket subscription patterns
   - State change event handling
   - Sensor unavailability detection (60s timeout)
   - Unit conversion (W/kW/MW)

4. **Responsive Layout Strategy**
   - Node positioning algorithms (320px-2560px)
   - Adaptive particle density
   - Touch target sizing (tablet optimization)
   - Canvas scaling on resize

5. **Browser Compatibility**
   - ES2020 feature support verification
   - Android WebView quirks
   - Canvas API compatibility matrix
   - LocalStorage persistence patterns

### Technical Unknowns to Resolve

- **NEEDS CLARIFICATION**: Canvas rendering performance with 25 nodes + 100+ particles on 2GB RAM Android devices
- **NEEDS CLARIFICATION**: Home Assistant Lovelace card editor custom element schema format
- **NEEDS CLARIFICATION**: Optimal particle spawn rate calculation for power magnitude mapping
- **NEEDS CLARIFICATION**: Layout algorithm for dynamic node positioning without overlap

*Proceeding to generate research.md...*
