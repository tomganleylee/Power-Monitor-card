# Tasks: Home Assistant Energy Flow Visualization Card

**Input**: Design documents from `/specs/001-energy-flow-card/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/card-config.schema.json

**Tests**: Tests not explicitly requested in specification. Focus on implementation tasks with manual testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Project root**: `energy-flow-card/`
- **Source**: `energy-flow-card/src/`
- **Tests**: `energy-flow-card/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project root directory `energy-flow-card/` at repository root
- [ ] T002 Initialize npm project with `package.json` including name, version, description, scripts
- [ ] T003 [P] Install production dependencies: lit@^3.0.0, d3-force@^3.0.0
- [ ] T004 [P] Install dev dependencies: typescript@^5.0.0, rollup@^4.0.0, @rollup/plugin-typescript@^11.0.0, @rollup/plugin-terser@^0.4.0, rollup-plugin-filesize@^10.0.0
- [ ] T005 [P] Create TypeScript configuration in `tsconfig.json` targeting ES2020
- [ ] T006 [P] Create Rollup build configuration in `rollup.config.js` with TypeScript plugin and terser minification
- [ ] T007 [P] Create `.gitignore` excluding node_modules/, dist/, *.log
- [ ] T008 Create source directory structure: `src/`, `src/utils/`
- [ ] T009 Create test directory structure: `tests/unit/`, `tests/integration/`, `tests/visual/`
- [ ] T010 [P] Create README.md with project description, installation, and usage instructions
- [ ] T011 Add npm scripts to package.json: build, watch, lint

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T012 [P] Create TypeScript type definitions in `src/types.ts` for EnergyFlowCardConfig, DeviceConfig, CategoryConfig, WarningConfig
- [ ] T013 [P] Create TypeScript interfaces in `src/types.ts` for runtime state: EnergySourceNode, ConsumptionDeviceNode, SensorState, Particle
- [ ] T014 [P] Implement unit formatter utility in `src/utils/unit-formatter.ts` with formatPower(watts) returning {value, unit} for W/kW/MW scaling
- [ ] T015 [P] Implement power calculation utility in `src/utils/power-calculations.ts` with calculateRemainder(circuitWatts, childrenWatts[]) for hierarchical calculations
- [ ] T016 Create SensorManager class in `src/sensor-manager.ts` with subscribe(), parseEntity(), and 60-second stale detection
- [ ] T017 [P] Create base Lit CSS styles in `src/styles.ts` with :host, canvas, and card-content styles

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Real-Time Energy Flow at a Glance (Priority: P1) 🎯 MVP

**Goal**: Display real-time energy flow between sources (solar, battery, grid) and consumption using animated particles, providing instant visual feedback of power generation and usage.

**Independent Test**: Install card on Home Assistant dashboard, configure solar/battery/grid sensor entities, verify animated particles flow from sources to consumption nodes with appropriate colors and density reflecting power magnitude.

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create main card component skeleton in `src/energy-flow-card.ts` extending LitElement with @customElement decorator
- [ ] T019 [P] [US1] Implement getStubConfig() static method returning default config structure
- [ ] T020 [P] [US1] Implement setConfig(config) method with validation for required entities field
- [ ] T021 [P] [US1] Implement getCardSize() method returning 4 (grid rows occupied)
- [ ] T022 [US1] Add hass property with @property decorator in `src/energy-flow-card.ts`
- [ ] T023 [US1] Add _config state property in `src/energy-flow-card.ts`
- [ ] T024 [US1] Implement render() method in `src/energy-flow-card.ts` returning ha-card with canvas element
- [ ] T025 [US1] Create ParticleEngine class in `src/particle-engine.ts` with canvas initialization
- [ ] T026 [P] [US1] Implement particle object pool in `src/particle-engine.ts` with createParticle() and pre-allocated 200 particles
- [ ] T027 [P] [US1] Implement spawnParticle(startX, startY, endX, endY, color) method in ParticleEngine
- [ ] T028 [US1] Implement animate() method in ParticleEngine with requestAnimationFrame loop
- [ ] T029 [US1] Implement drawParticle(particle) method rendering 3px circles on canvas
- [ ] T030 [US1] Add adaptive throttling in animate() to reduce particle count if FPS < 30
- [ ] T031 [US1] Create NodeRenderer class in `src/node-renderer.ts` with drawNode(node, ctx) method
- [ ] T032 [P] [US1] Implement drawEnergySourceNode() in NodeRenderer with pulsing ring animation for active nodes
- [ ] T033 [P] [US1] Implement drawConsumptionNode() in NodeRenderer with power value labels
- [ ] T034 [US1] Add color-coding logic in NodeRenderer: yellow for solar, green for battery, red/blue for grid
- [ ] T035 [US1] Integrate SensorManager in energy-flow-card.ts with subscription to entities.solar, entities.battery, entities.grid
- [ ] T036 [US1] Add sensor state callback in energy-flow-card.ts to update node display values
- [ ] T037 [US1] Implement particle spawn rate calculation: clamp(powerWatts / 100, 1, 10) particles/second
- [ ] T038 [US1] Add bidirectional flow support: reverse particle direction for negative power values
- [ ] T039 [US1] Implement stale sensor indicator: warning icon overlay when SensorState.isStale = true
- [ ] T040 [US1] Add window.customCards registration array with card metadata
- [ ] T041 [US1] Build bundle with `npm run build` and verify dist/energy-flow-card.js output
- [ ] T042 [US1] Create manual test HTML in `tests/visual/particle-animation.manual.html` with demo mode

**Checkpoint**: At this point, User Story 1 (MVP) should be fully functional - energy flow visualization with animated particles works independently

---

## Phase 4: User Story 2 - Monitor Individual Device Consumption (Priority: P2)

**Goal**: Display individual consumption devices/circuits with particle flows proportional to their power usage, enabling users to identify high-consumption appliances.

**Independent Test**: Configure multiple device sensors (AC, lights, computer) in card config, verify each device node displays correct power value and particle density reflects consumption level.

### Implementation for User Story 2

- [ ] T043 [P] [US2] Add devices array support in setConfig() validation in `src/energy-flow-card.ts`
- [ ] T044 [P] [US2] Parse DeviceConfig array and create ConsumptionDeviceNode instances in `src/energy-flow-card.ts`
- [ ] T045 [US2] Subscribe to device entity IDs via SensorManager in `src/energy-flow-card.ts`
- [ ] T046 [US2] Implement device node rendering in NodeRenderer with custom icons (MDI format)
- [ ] T047 [US2] Calculate particle spawn points from source nodes to each device node
- [ ] T048 [US2] Implement particle density variation: more particles for higher consumption devices
- [ ] T049 [US2] Add "show_when_off" config support: hide devices with 0W if show_when_off = false
- [ ] T050 [US2] Validate max 25 devices constraint in setConfig() with error message

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - basic flow + individual device monitoring

---

## Phase 5: User Story 3 - View Battery Status and Charge Level (Priority: P2)

**Goal**: Display battery state of charge with visual fill indicator, capacity information, and time-to-empty calculation for strategic energy planning.

**Independent Test**: Configure battery power, battery_soc, and battery_capacity sensors, verify battery node shows fill percentage, displays "X kWh / Y kWh", and calculates time remaining.

### Implementation for User Story 3

- [ ] T051 [P] [US3] Add battery_soc and battery_capacity entity support in `src/types.ts` EnergyFlowCardConfig
- [ ] T052 [P] [US3] Parse optional battery_soc and battery_capacity sensors in setConfig()
- [ ] T053 [US3] Subscribe to battery_soc and battery_capacity entities in SensorManager
- [ ] T054 [US3] Implement drawBatteryNode() in NodeRenderer with fill indicator based on SoC percentage
- [ ] T055 [US3] Add SVG battery icon with dynamic fill rect scaled to 0-100% in NodeRenderer
- [ ] T056 [US3] Calculate time to empty: capacity_remaining_kWh / discharge_rate_kW * 60 minutes
- [ ] T057 [US3] Display capacity as "5.25 kWh / 7 kWh" tooltip on battery node hover
- [ ] T058 [US3] Display time remaining as "3.5 hours remaining" tooltip on battery node hover
- [ ] T059 [US3] Add "Charging" vs "Discharging" status indicator based on power sign
- [ ] T060 [US3] Handle missing battery_soc/capacity sensors gracefully: show power only

**Checkpoint**: At this point, User Stories 1, 2, AND 3 work independently - flow + devices + battery status

---

## Phase 6: User Story 4 - Configure Card via GUI Editor (Priority: P2)

**Goal**: Provide GUI-based configuration interface integrated with Home Assistant card editor for entity selection without YAML editing.

**Independent Test**: Open Home Assistant dashboard in edit mode, add Energy Flow Card, verify GUI shows entity pickers for solar/battery/grid, device list editor, verify config saves and persists.

### Implementation for User Story 4

- [ ] T061 [P] [US4] Create ConfigEditor component in `src/config-editor.ts` extending LitElement
- [ ] T062 [P] [US4] Implement static getConfigElement() in energy-flow-card.ts returning config-editor element
- [ ] T063 [US4] Add @property for hass and config in config-editor.ts
- [ ] T064 [US4] Render entity picker for entities.solar using ha-entity-picker element
- [ ] T065 [P] [US4] Render entity picker for entities.battery using ha-entity-picker element
- [ ] T066 [P] [US4] Render entity picker for entities.grid using ha-entity-picker element
- [ ] T067 [P] [US4] Render entity picker for entities.battery_soc using ha-entity-picker element
- [ ] T068 [P] [US4] Render entity picker for entities.battery_capacity using ha-entity-picker element
- [ ] T069 [US4] Implement device list editor with add/remove buttons in config-editor.ts
- [ ] T070 [US4] Add entity picker for each device in devices array
- [ ] T071 [US4] Add icon picker (ha-icon-picker) for each device
- [ ] T072 [US4] Add text input for device name/label
- [ ] T073 [US4] Implement configChanged event dispatch when any config field changes
- [ ] T074 [US4] Validate JSON Schema in config-editor.ts against contracts/card-config.schema.json
- [ ] T075 [US4] Add update_interval slider (1-5 seconds) with default 2
- [ ] T076 [US4] Add show_statistics checkbox toggle
- [ ] T077 [US4] Test config persistence: verify localStorage save/load in energy-flow-card.ts

**Checkpoint**: User Stories 1-4 work independently - full card functionality with GUI configuration

---

## Phase 7: User Story 7 - View Hierarchical Device Groups (Priority: P2)

**Goal**: Support expandable/collapsible device categories with hierarchical power calculation (circuit total minus individual devices = remaining power).

**Independent Test**: Configure category "Sockets" with circuit_entity, add TV and Computer devices with parent_circuit = Sockets entity, verify category shows total, expands to show children + "Other: X W" remainder.

### Implementation for User Story 7

- [ ] T078 [P] [US7] Add categories array support in setConfig() validation in `src/energy-flow-card.ts`
- [ ] T079 [P] [US7] Parse CategoryConfig array and create category hierarchy in `src/energy-flow-card.ts`
- [ ] T080 [US7] Map devices to categories via DeviceConfig.category field
- [ ] T081 [US7] Implement calculateRemainder() for categories with circuit_entity in power-calculations.ts
- [ ] T082 [US7] Add collapsed state property to category nodes (default true per FR-017)
- [ ] T083 [US7] Implement category node click handler to toggle collapsed state
- [ ] T084 [US7] Render category node as expandable with chevron icon indicator
- [ ] T085 [US7] Hide/show child device nodes based on category collapsed state
- [ ] T086 [US7] Display calculated remainder as "Other devices: X W" child node
- [ ] T087 [US7] Update particle flows: spawn from category to children when expanded
- [ ] T088 [US7] Validate single-level nesting: reject nested category configurations
- [ ] T089 [US7] Validate max 10 categories constraint in setConfig()
- [ ] T090 [US7] Add category editor in config-editor.ts with category name, icon, circuit_entity fields
- [ ] T091 [US7] Add device-to-category assignment dropdown in device editor

**Checkpoint**: User Stories 1-4 + 7 work independently - hierarchical grouping complete

---

## Phase 8: User Story 5 - Responsive Design (Priority: P3)

**Goal**: Adapt card layout and visual elements to different screen sizes (320px to 2560px) for optimal viewing on phones, tablets, and desktops.

**Independent Test**: View card on mobile (320px), tablet (768px), and desktop (1920px) widths, verify nodes scale appropriately, text remains readable, animations perform smoothly.

### Implementation for User Story 5

- [ ] T092 [P] [US5] Create LayoutEngine class in `src/utils/layout-engine.ts` wrapping d3-force simulation
- [ ] T093 [P] [US5] Implement forceSimulation with forceCollide, forceCenter, forceX, forceY in LayoutEngine
- [ ] T094 [US5] Calculate collision radius based on screen width: 40px mobile, 60px desktop
- [ ] T095 [US5] Implement getGroupX() positioning: sources left (15%), hub center (50%), devices right (85%)
- [ ] T096 [US5] Implement getGroupY() with vertical distribution to prevent overlap
- [ ] T097 [US5] Add ResizeObserver to canvas element in energy-flow-card.ts
- [ ] T098 [US5] Recalculate layout on resize events with debounce (200ms)
- [ ] T099 [US5] Scale node sizes: mobile 50px → tablet 70px → desktop 100px
- [ ] T100 [US5] Scale font sizes: mobile 0.8em → tablet 1em → desktop 1.2em
- [ ] T101 [US5] Adjust particle density: mobile 0.5x → tablet 1x → desktop 1.5x
- [ ] T102 [US5] Add CSS media queries in styles.ts for @media (max-width: 768px)
- [ ] T103 [US5] Implement touch target sizing: minimum 48x48px hit areas for expandable categories
- [ ] T104 [US5] Add min_height and max_height config support in setConfig()
- [ ] T105 [US5] Clamp canvas height between min_height and max_height constraints

**Checkpoint**: User Stories 1-4, 7, AND 5 work independently - fully responsive across devices

---

## Phase 9: User Story 6 - Energy Statistics Display (Priority: P3)

**Goal**: Calculate and display energy efficiency, self-sufficiency percentage, and daily savings metrics for tracking energy independence progress.

**Independent Test**: Enable show_statistics config, verify statistics panel displays efficiency %, self-sufficiency %, and daily savings, verify calculations update in real-time.

### Implementation for User Story 6

- [ ] T106 [P] [US6] Create StatisticsPanel component interface in `src/types.ts`
- [ ] T107 [P] [US6] Implement calculateEfficiency(totalGeneration, totalConsumption) utility
- [ ] T108 [P] [US6] Implement calculateSelfSufficiency(totalConsumption, gridImport) utility
- [ ] T109 [US6] Render statistics panel div at bottom of card when show_statistics = true
- [ ] T110 [US6] Display efficiency percentage: (consumption / generation) * 100
- [ ] T111 [US6] Display self-sufficiency percentage: ((consumption - gridImport) / consumption) * 100
- [ ] T112 [US6] Add optional grid_rate sensor support for daily savings calculation
- [ ] T113 [US6] Calculate daily savings: (generation - gridImport) * gridRate * hoursElapsed
- [ ] T114 [US6] Update statistics every sensor update via SensorManager callback
- [ ] T115 [US6] Style statistics panel with dark background, blue text, 3-column grid layout

**Checkpoint**: All user stories (1-7 including 5-6) work independently - complete feature set

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T116 [P] Add visual warning indicators: check warning thresholds and apply pulsing/color effects
- [ ] T117 [P] Implement warning threshold configuration in config-editor.ts
- [ ] T118 [P] Add theme color customization (solar_color, battery_color, grid_color) in config-editor.ts
- [ ] T119 [P] Implement demo mode: detect missing entities and show simulated data
- [ ] T120 [P] Add random value generation for demo mode (1.5-4kW solar, 0-0.8kW battery, etc.)
- [ ] T121 Add comprehensive error handling: try/catch around sensor subscriptions, canvas rendering
- [ ] T122 Add logging: console.error for critical failures, console.warn for stale sensors
- [ ] T123 [P] Create HACS info.json with card metadata (name, version, render_readme)
- [ ] T124 [P] Add installation instructions to README.md (HACS, manual, config examples)
- [ ] T125 [P] Create example configuration YAML in README.md
- [ ] T126 Test on Home Assistant Android app WebView: verify Canvas willReadFrequently hint
- [ ] T127 Test on physical tablet device: verify 30+ FPS with 25 devices
- [ ] T128 Performance optimization: profile with Chrome DevTools, optimize hot paths
- [ ] T129 Bundle size check: verify dist/energy-flow-card.js is under 70KB gzipped
- [ ] T130 Accessibility audit: verify keyboard navigation for expand/collapse
- [ ] T131 [P] Code cleanup: remove console.log statements, add JSDoc comments
- [ ] T132 Final validation: run through all acceptance scenarios from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 node rendering but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Extends US1 with battery visualization, independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Configuration interface, independently testable
- **User Story 7 (P2)**: Can start after US2 complete (needs device nodes) - Adds category grouping
- **User Story 5 (P3)**: Can start after US1 complete (needs layout system) - Responsive design overlay
- **User Story 6 (P3)**: Can start after US1 complete (needs sensor data) - Statistics calculations

### Within Each User Story

- Foundation tasks (types, utilities) before component tasks
- Core visualization (US1) before advanced features
- SensorManager integration before rendering
- Canvas setup before particle engine
- Config validation before GUI editor
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T011)
- All Foundational tasks marked [P] can run in parallel (T012-T017)
- Within US1: T018-T021, T026-T027, T032-T034 can run in parallel
- Within US2: T043-T044, T046 can run in parallel
- Within US3: T051-T052, T055-T056 can run in parallel
- Within US4: T061-T062, T064-T068, T069-T072 can run in parallel
- Within US7: T078-T079, T083-T084 can run in parallel
- Within US5: T092-T096, T097-T101 can run in parallel
- Within US6: T106-T108, T110-T111 can run in parallel
- Polish: T116-T120, T123-T125, T131 can run in parallel

---

## Parallel Example: User Story 1 (MVP)

```bash
# Launch foundational utilities in parallel:
Task: "Create TypeScript type definitions in src/types.ts"
Task: "Implement unit formatter in src/utils/unit-formatter.ts"
Task: "Implement power calculation utility in src/utils/power-calculations.ts"

# Launch US1 component scaffolding in parallel:
Task: "Create main card component skeleton in src/energy-flow-card.ts"
Task: "Implement getStubConfig() static method"
Task: "Implement setConfig(config) method"
Task: "Implement getCardSize() method"

# Launch US1 rendering components in parallel:
Task: "Implement particle object pool in src/particle-engine.ts"
Task: "Implement spawnParticle() method"
Task: "Implement drawEnergySourceNode() in NodeRenderer"
Task: "Implement drawConsumptionNode() in NodeRenderer"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED START

1. Complete Phase 1: Setup (T001-T011) - ~2 hours
2. Complete Phase 2: Foundational (T012-T017) - ~3 hours
3. Complete Phase 3: User Story 1 (T018-T042) - ~2-3 days
4. **STOP and VALIDATE**: Test US1 independently with real Home Assistant sensors
5. Deploy/demo MVP to stakeholders
6. **Decision point**: Gather feedback before proceeding to P2 stories

**Estimated time to MVP**: 3-4 days

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (~1 day)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (~3 days)
3. Add User Story 2 → Test independently → Deploy/Demo (~2 days)
4. Add User Story 3 → Test independently → Deploy/Demo (~1 day)
5. Add User Story 4 → Test independently → Deploy/Demo (~2 days)
6. Add User Story 7 → Test independently → Deploy/Demo (~2 days)
7. Add User Story 5 → Test independently → Deploy/Demo (~2 days)
8. Add User Story 6 → Test independently → Deploy/Demo (~1 day)
9. Polish phase → Final release (~2 days)

**Total estimated time**: 3-4 weeks

### Parallel Team Strategy

With 2-3 developers:

1. Team completes Setup + Foundational together (~1 day)
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP - highest priority)
   - Developer B: User Story 4 (GUI Config - enables easier testing)
   - Developer C: User Story 2 (Device Monitoring)
3. After initial stories complete:
   - Developer A: User Story 3 (Battery Status)
   - Developer B: User Story 7 (Hierarchical Groups)
   - Developer C: User Story 5 (Responsive Design)
4. Final: User Story 6 + Polish phase

**Parallel estimated time**: 2 weeks with 3 developers

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independently
- Test with real Home Assistant instance and actual sensor entities
- Use manual testing HTML files in tests/visual/ for rapid iteration
- Monitor bundle size (target <70KB gzipped)
- Profile performance regularly (Chrome DevTools Performance tab)
- Test on target devices: Android tablet, phone, desktop browsers
- **MVP Success Criteria**: US1 complete → Real-time particle flow working with 3+ sensors

---

## Task Count Summary

- **Total Tasks**: 132
- **Setup (Phase 1)**: 11 tasks
- **Foundational (Phase 2)**: 6 tasks
- **User Story 1 (P1 MVP)**: 25 tasks
- **User Story 2 (P2)**: 8 tasks
- **User Story 3 (P2)**: 10 tasks
- **User Story 4 (P2)**: 17 tasks
- **User Story 7 (P2)**: 14 tasks
- **User Story 5 (P3)**: 14 tasks
- **User Story 6 (P3)**: 10 tasks
- **Polish (Final)**: 17 tasks

**Parallelizable Tasks**: 45 tasks marked [P]

**MVP Scope (Recommended)**: Complete Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1) = 42 tasks for working MVP

**First Deliverable**: After 42 tasks, you have a working energy flow visualization card displaying real-time animated particles showing power flow between solar/battery/grid sources and consumption!
