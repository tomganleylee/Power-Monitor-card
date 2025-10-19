# Feature Specification: Home Assistant Energy Flow Visualization Card

**Feature Branch**: `001-energy-flow-card`
**Created**: 2025-10-15
**Status**: Draft
**Input**: User description: "inital spec.md  image.png energy-field-dashboard.html  amke sure to ask clardfiation quwesiton"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Real-Time Energy Flow at a Glance (Priority: P1)

As a homeowner with solar panels and battery storage, I want to instantly see where my energy is coming from and where it's being consumed, so I can make informed decisions about my energy usage throughout the day.

**Why this priority**: This is the core value proposition of the card. Without real-time visualization, users cannot understand their energy flow, making all other features irrelevant. This represents the MVP.

**Independent Test**: Can be fully tested by installing the card on a Home Assistant dashboard, connecting power sensor entities, and verifying that energy flows are visually represented with animated particles showing direction and magnitude. Delivers immediate value by showing users their energy status.

**Acceptance Scenarios**:

1. **Given** solar panels are generating 2.8kW, **When** I view the dashboard, **Then** I see the solar node displaying "2.8kW" with animated particles flowing toward consumption nodes
2. **Given** battery is charging at 0.4kW, **When** I view the dashboard, **Then** I see particles flowing from solar to battery node with appropriate color coding
3. **Given** I am exporting 1.5kW to grid, **When** I view the dashboard, **Then** I see particles flowing from solar/battery nodes toward the grid node
4. **Given** total home consumption is 3.2kW, **When** I view the dashboard, **Then** I see the total consumption displayed in the central hub node
5. **Given** no solar generation at night, **When** I view the dashboard, **Then** I see the solar node inactive (no pulsing animation) and particles flowing from grid/battery to consumption

---

### User Story 2 - Monitor Individual Device Consumption (Priority: P2)

As a homeowner, I want to see which specific devices or circuits are consuming the most power, so I can identify energy-intensive appliances and optimize my usage patterns.

**Why this priority**: After understanding overall energy flow (P1), users naturally want to drill down into specific consumption sources. This enables actionable insights and behavior changes.

**Independent Test**: Can be tested by configuring device/circuit sensors in the card settings and verifying that individual consumption nodes display accurate power readings and show proportional particle flow. Delivers value by helping users identify high-consumption devices.

**Acceptance Scenarios**:

1. **Given** AC unit is consuming 1.8kW, **When** I view the dashboard, **Then** I see the AC node showing "1.8kW" with dense particle flow indicating high consumption
2. **Given** multiple devices are active, **When** I view the dashboard, **Then** I see each device node with particle density proportional to its power consumption
3. **Given** lights are consuming 120W, **When** I view the dashboard, **Then** I see sparse particle flow to the lights node reflecting low consumption
4. **Given** a device is turned off, **When** I view the dashboard, **Then** the device node shows "0W" with no particle animation

---

### User Story 3 - View Battery Status and Charge Level (Priority: P2)

As a homeowner with battery storage, I want to see the current battery charge percentage, remaining capacity, and time to empty, so I can plan my energy usage during peak rate periods or power outages.

**Why this priority**: Battery management is critical for users with energy storage systems. This information helps users decide when to use stored energy versus grid power, especially with time-of-use electricity rates.

**Independent Test**: Can be tested by configuring battery-specific sensors (state of charge, capacity, time to empty) and verifying the battery node displays a visual fill level indicator and detailed statistics. Delivers value by enabling strategic battery usage decisions.

**Acceptance Scenarios**:

1. **Given** battery is at 75% charge, **When** I view the dashboard, **Then** I see the battery icon filled to 75% with "75%" displayed
2. **Given** battery has 5.25 kWh remaining out of 7 kWh capacity, **When** I hover/click the battery node, **Then** I see "5.25 kWh / 7 kWh" displayed
3. **Given** battery is discharging at current rate, **When** I hover/click the battery node, **Then** I see estimated time to empty (e.g., "3.5 hours remaining")
4. **Given** battery is charging, **When** I view the dashboard, **Then** I see particles flowing toward the battery node and "Charging" status

---

### User Story 4 - Configure Card via GUI Editor (Priority: P2)

As a Home Assistant user, I want to configure the energy flow card using the visual card editor, so I can easily set up my sensor entities without editing YAML code.

**Why this priority**: Accessibility is crucial for broader adoption. Many Home Assistant users prefer GUI configuration over YAML editing. This significantly reduces setup friction.

**Independent Test**: Can be tested by adding the card through Home Assistant's visual dashboard editor, selecting sensor entities from dropdowns, and verifying the card displays correctly without requiring any YAML configuration. Delivers value by making the card accessible to non-technical users.

**Acceptance Scenarios**:

1. **Given** I'm in dashboard edit mode, **When** I add a new card and select "Energy Flow Card", **Then** I see a GUI configuration interface with sensor entity pickers
2. **Given** I'm configuring the card, **When** I select my solar power sensor from the dropdown, **Then** the solar node immediately displays the sensor's current value
3. **Given** I'm setting up device monitoring, **When** I add consumption categories (lights, AC, etc.), **Then** I see fields to assign sensor entities and custom icons for each device
4. **Given** I've configured all sensors, **When** I save the card, **Then** the configuration is stored and persists across page refreshes without YAML editing

---

### User Story 5 - View Card on Different Screen Sizes (Priority: P3)

As a user who monitors my energy on various devices (kitchen tablet, phone, desktop), I want the card to automatically scale and adapt to different screen sizes, so I can view my energy flow regardless of the device I'm using.

**Why this priority**: While important for usability, responsive design is a polish feature that enhances existing functionality rather than adding new core value. Users can initially use the card on their primary device.

**Independent Test**: Can be tested by viewing the card on different devices (phone, tablet, desktop) and verifying that nodes, text, and animations scale appropriately while maintaining readability and functionality. Delivers value by ensuring consistent experience across devices.

**Acceptance Scenarios**:

1. **Given** I'm viewing the card on a mobile phone (320px width), **When** the dashboard loads, **Then** I see smaller nodes with readable text and appropriately scaled particle animations
2. **Given** I'm viewing on a desktop monitor (1920px width), **When** the dashboard loads, **Then** I see larger nodes with more spacing and enhanced visual effects
3. **Given** I'm viewing on a kitchen tablet in portrait orientation, **When** I rotate to landscape, **Then** the card re-flows to utilize the available width
4. **Given** card height is constrained by dashboard settings, **When** the card renders, **Then** nodes and connections scale proportionally to fit the available space

---

### User Story 6 - See Energy Statistics and Insights (Priority: P3)

As a homeowner tracking energy efficiency, I want to see calculated statistics like self-sufficiency percentage, daily savings, and efficiency metrics, so I can measure my progress toward energy independence goals.

**Why this priority**: Statistics provide valuable insights but depend on the core visualization (P1) being functional first. These are enhancement features that increase engagement but aren't critical for basic functionality.

**Independent Test**: Can be tested by configuring optional statistic sensors or enabling built-in calculations, then verifying that metrics like "Self-Sufficient: 100%", "Daily Savings: $8.40", and "Efficiency: 94%" are displayed and update in real-time. Delivers value by gamifying energy savings and showing tangible benefits.

**Acceptance Scenarios**:

1. **Given** I'm fully powered by solar/battery, **When** I view the dashboard, **Then** I see "Self-Sufficient: 100%" in the statistics panel
2. **Given** I'm importing 1kW from grid while generating 3kW solar, **When** I view the dashboard, **Then** I see "Self-Sufficient: 75%" calculated correctly
3. **Given** I've saved $8.40 compared to grid-only power today, **When** I view the dashboard, **Then** I see "Daily Savings: $8.40" in the statistics panel
4. **Given** my system efficiency is 94%, **When** I view the dashboard, **Then** I see "Efficiency: 94%" displayed

---

### User Story 7 - View Hierarchical Device Groups with Calculated Remaining Power (Priority: P2)

As a homeowner with circuit-level monitoring and individual smart plugs, I want to group related devices into expandable categories and see the remaining unaccounted power from monitored circuits, so I can identify which grouped devices are consuming most power and track devices that aren't individually monitored.

**Why this priority**: This addresses a common real-world scenario where users have whole-circuit monitoring (e.g., "Sockets" circuit) plus individual device monitoring (e.g., smart plugs on TV and Computer). Without this, users can't easily see the breakdown or identify unmonitored consumption.

**Independent Test**: Can be tested by configuring a monitored circuit sensor (e.g., "Sockets: 1500W"), assigning individual devices to that circuit (e.g., "TV: 180W", "Computer: 85W"), and verifying the card displays the circuit as expandable showing individual devices plus calculated remaining power (e.g., "Other: 1235W"). Delivers value by helping users understand their complete power picture.

**Acceptance Scenarios**:

1. **Given** I have a "Sockets" circuit consuming 1500W with TV (180W) and Computer (85W) assigned to it, **When** I view the dashboard, **Then** I see "Sockets: 1500W" as an expandable category node
2. **Given** I have configured device relationships, **When** I click/tap the "Sockets" node, **Then** it expands to show "TV: 180W", "Computer: 85W", and "Other devices: 1235W" with individual particle flows. The expanded state resets to collapsed on page refresh
3. **Given** I have "Network and Servers" category with multiple devices, **When** I expand the category, **Then** I see each server and network device listed individually with their consumption values
4. **Given** I have standalone "Lights" device not in any category, **When** I view the dashboard, **Then** I see "Lights" as a top-level node alongside grouped categories
5. **Given** a grouped device is turned off, **When** I view the expanded category, **Then** the remaining power calculation updates to reflect the change

---

### Edge Cases

- What happens when a sensor becomes unavailable or returns "unknown" state? The corresponding node displays a warning indicator and retains the last valid value for up to 60 seconds. After 60 seconds of stale data, the node shows "N/A" with a prominent warning indicator.
- What browsers must be supported? Card must work in modern browsers released within the last 2 years (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) and the Home Assistant Android app's WebView component.
- How does the system handle negative power values (e.g., grid export, battery charging)? Particle flow direction should reverse appropriately to show energy flowing to grid or into battery.
- What happens when consumption exceeds generation? Particles should flow from multiple sources (grid + battery + solar) toward consumption nodes, with grid becoming the primary source.
- How does the card perform with very high update frequencies (sub-second updates)? Animation frame rate should be throttled to prevent performance degradation while maintaining smooth visual updates.
- What happens when device power consumption is extremely low (<1W)? The node should display fractional watts (e.g., "0.5W") and show minimal or no particle animation to reflect negligible consumption.
- How does the card handle very large power values (e.g., 50kW industrial installation)? Display should automatically scale to appropriate units (kW, MW) and maintain readability.
- What happens when the card is resized to very small dimensions (e.g., 200px × 200px)? Nodes should scale down, possibly hiding labels or reducing detail while maintaining functionality.
- How does the system handle missing optional configuration (e.g., battery sensors when user has no battery)? Those nodes should be hidden or disabled gracefully without errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Card MUST display real-time power flow between energy sources (solar, battery, grid) and consumption points using animated particle effects
- **FR-002**: Card MUST visually represent power magnitude through particle density, where higher power transfer shows more frequent/dense particles
- **FR-003**: Card MUST use color-coded particles to indicate energy source (e.g., yellow/orange for solar, green for battery, red/blue for grid)
- **FR-004**: Card MUST display current power values with appropriate units (W, kW) auto-scaling based on magnitude
- **FR-005**: Card MUST support bidirectional energy flow visualization (e.g., grid import vs export, battery charging vs discharging)
- **FR-006**: Card MUST show active state indicators (pulsing rings) on source nodes that are currently producing/supplying power
- **FR-007**: Card MUST update visualization at user-configurable intervals (1-5 seconds) with a default of 2 seconds
- **FR-008**: Card MUST provide GUI-based configuration interface integrated with Home Assistant's card editor
- **FR-009**: Card MUST support configurable consumption categories with custom labels and icons, with a maximum of 10 categories and 25 total devices to ensure optimal performance
- **FR-010**: Card MUST display battery charge percentage as a visual fill indicator within the battery node icon
- **FR-011**: Card MUST show battery capacity information (current kWh / total kWh capacity)
- **FR-012**: Card MUST calculate and display estimated battery time remaining based on current discharge rate
- **FR-013**: Card MUST scale responsively to different screen widths and heights while maintaining readability
- **FR-014**: Card MUST support configuration of minimum and maximum height constraints
- **FR-015**: Card MUST allow users to configure which energy sources and consumption devices to display
- **FR-016**: Card MUST handle sensor unavailability gracefully by displaying warning indicators while retaining the last valid sensor value. If sensor data is invalid, non-numeric, or stale (no updates for 60 seconds), the node displays a warning icon but continues showing the last known good value to prevent display flicker
- **FR-017**: Card MUST support expandable/collapsible consumption categories where users can group related devices (e.g., "Network and Servers" expands to show individual servers and networking equipment, "AC" expands to show individual AC units) while also supporting top-level standalone devices (e.g., "Lights"). Categories support single-level nesting only - categories contain devices but not sub-categories. All categories default to collapsed state on page load
- **FR-017a**: Card MUST support hierarchical power calculation where monitored circuits (e.g., "Sockets") can have individual devices (e.g., "TV", "Computer") subtracted from their total, with users able to specify which devices are connected to which monitoring points to show remaining/unaccounted power consumption
- **FR-018**: Card MUST support touch-friendly interaction for tablet devices with minimum touch target sizes
- **FR-019**: Card MUST provide visual warning indicators (e.g., color changes, pulsing effects, warning icons) when user-defined threshold conditions are met, with support for configurable alert conditions
- **FR-020**: Card MUST persist user configuration across browser sessions and Home Assistant restarts
- **FR-021**: Card MUST support optional statistics display including efficiency, self-sufficiency percentage, and savings calculations
- **FR-022**: Card MUST work with standard Home Assistant sensor entity naming conventions
- **FR-023**: Card MUST provide fallback demo mode when sensors are not configured (for testing/preview)

### Key Entities *(include if feature involves data)*

- **Energy Source Node**: Represents a power generation or storage source (solar panel, battery, grid connection). Attributes include current power output/input, active state, visual styling (color, icon), and associated Home Assistant sensor entity ID.

- **Consumption Device Node**: Represents an individual appliance, circuit, or device category consuming power. Attributes include current power consumption, device icon, label, optional parent category (single level only), and associated sensor entity ID. A device can belong to at most one category.

- **Hub Node**: Represents the central aggregation point showing total household consumption. Attributes include total power value and calculated from all consumption nodes.

- **Energy Flow Particle**: Represents visual indication of power transfer between nodes. Attributes include source node, destination node, color (inherited from source), speed (proportional to power magnitude), and animation path.

- **Battery Status**: Represents detailed battery information beyond simple power flow. Attributes include state of charge percentage, current capacity (kWh), total capacity (kWh), charge/discharge rate, and estimated time to full/empty.

- **Statistics Panel**: Represents calculated energy metrics. Attributes include efficiency percentage, self-sufficiency percentage, daily savings amount, and peak/average indicators.

- **Card Configuration**: Represents user-defined settings for the card. Attributes include sensor entity mappings, enabled features, layout preferences, height/width constraints, color schemes, and warning thresholds.

## Clarifications

### Session 2025-10-15

- Q: What are the maximum scalability limits for devices and categories to ensure performance? → A: 25 devices maximum, 10 categories maximum
- Q: What is the maximum nesting depth for device categories? → A: Single level only - categories contain devices, no nested categories
- Q: Should expanded/collapsed category states persist across page refreshes? → A: Reset on refresh - all categories start collapsed when page loads
- Q: How should the card handle invalid or stale sensor data? → A: Warn and display last valid value - show warning indicator but keep displaying last known good value if sensor data becomes invalid or stale (timeout after 60 seconds)
- Q: What browser compatibility level is required? → A: Modern browsers (2 years) - last 2 years of major browser versions, must work in Home Assistant Android app

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can understand their current energy flow (sources and consumption) within 3 seconds of viewing the dashboard without reading instructions
- **SC-002**: Card updates energy flow visualization within 2 seconds of sensor state changes to maintain real-time accuracy
- **SC-003**: 90% of users can successfully configure the card using only the GUI editor without consulting documentation
- **SC-004**: Card renders smoothly at 30+ frames per second with particle animations on devices with at least 2GB RAM, tested with up to 25 devices and 10 categories
- **SC-005**: Card remains functional and readable on screen sizes from 320px to 2560px width, compatible with browsers released within the last 2 years including Home Assistant Android app
- **SC-006**: Users can identify which device is consuming the most power within 5 seconds by observing particle density
- **SC-007**: Battery charge level is visually apparent within 1 second through the fill indicator without reading percentage text
- **SC-008**: Card installation and basic configuration (3 sources, 5 consumption devices) can be completed in under 10 minutes by average users
- **SC-009**: Visual display accurately reflects actual power flow direction within 1% margin of error based on sensor values
- **SC-010**: Card gracefully handles sensor failures affecting no more than one node while keeping rest of visualization functional
