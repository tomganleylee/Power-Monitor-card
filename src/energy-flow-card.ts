/**
 * Energy Flow Card - Home Assistant custom card for visualizing energy flow
 */

import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { styles } from './styles';
import {
  EnergyFlowCardConfig,
  HomeAssistant,
  LovelaceCard,
  EnergySourceNode,
  ConsumptionDeviceNode,
  HubNode
} from './types';
import { SensorManager } from './sensor-manager';
import { ParticleSystem } from './particle-system';
import { LayoutEngine } from './layout-engine';
import { NodeRenderer } from './node-renderer';
import { SankeyRenderer } from './sankey-renderer';
import { BusRenderer, BusConfig, PowerContribution } from './bus-renderer';
import { TrunkSankeyRenderer, TrunkConfig } from './trunk-sankey-renderer';
import { SourceFlowRenderer } from './source-flow-renderer';
import { getBatteryFlowDirection, getGridFlowDirection, calculateBatteryTimeRemaining, formatTimeRemaining } from './utils/power-calculations';
import { calculateEnergyFlows, EnergyFlow } from './utils/energy-flow-calculator';
import {
  VERSION,
  LAYOUT,
  NODE_SIZES,
  COLORS,
  THRESHOLDS,
  ANIMATION,
  DEFAULTS,
  PARTICLE
} from './constants';
import './config-editor'; // Import config editor to bundle it

@customElement('energy-flow-card')
export class EnergyFlowCard extends LitElement implements LovelaceCard {
  static styles = styles;

  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private config!: EnergyFlowCardConfig;
  @state() private sourceNodes: EnergySourceNode[] = [];
  @state() private consumptionNodes: ConsumptionDeviceNode[] = [];
  @state() private categoryNodes: Map<string, ConsumptionDeviceNode> = new Map();
  @state() private collapsedCategories: Set<string> = new Set();
  @state() private warnings: string[] = [];
  @state() private isLoading: boolean = true;
  @state() private errorMessage: string | null = null;

  @query('canvas') private canvas?: HTMLCanvasElement;

  private sensorManager?: SensorManager;
  private particleSystem?: ParticleSystem;
  private layoutEngine?: LayoutEngine;
  private nodeRenderer?: NodeRenderer;
  private sankeyRenderer?: SankeyRenderer;
  private busRenderer?: BusRenderer;
  private trunkSankeyRenderer?: TrunkSankeyRenderer;
  private sourceFlowRenderer?: SourceFlowRenderer;
  private animationFrameId?: number;
  private resizeObserver?: ResizeObserver;
  private updateTimer?: number;
  private lastFrameTime: number = 0;
  private lastDebugLog: number = 0;
  private resizeDebounceTimer?: number;
  private canvasClickHandler?: (event: MouseEvent) => void;
  private canvasHoverHandler?: (event: MouseEvent) => void;
  private tooltipElement?: HTMLDivElement;

  /**
   * Set the card configuration from Lovelace UI
   * @param config Card configuration object
   */
  public setConfig(config: EnergyFlowCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    if (config.type !== 'custom:energy-flow-card') {
      throw new Error('Invalid card type. Must be "custom:energy-flow-card"');
    }

    this.config = {
      ...config,
      update_interval: config.update_interval ?? DEFAULTS.UPDATE_INTERVAL,
      show_statistics: config.show_statistics ?? DEFAULTS.SHOW_STATISTICS,
      visualization_mode: config.visualization_mode ?? DEFAULTS.VISUALIZATION_MODE,
      min_height: config.min_height ?? DEFAULTS.MIN_HEIGHT,
      max_height: config.max_height ?? DEFAULTS.MAX_HEIGHT,
      debug: config.debug ?? false
    };

    this.isLoading = false;
  }

  /**
   * Get card size for Lovelace layout
   * @returns Card height in units (1 unit = ~50px)
   */
  public getCardSize(): number {
    const minHeight = this.config?.min_height ?? 1000;
    return Math.ceil(minHeight / 50);
  }

  /**
   * Get config editor element for Home Assistant UI
   * Required for visual editor in card picker
   * Note: Must return synchronously - the element will initialize itself
   */
  public static getConfigElement(): HTMLElement {
    console.log('[EnergyFlowCard] getConfigElement called');

    // The editor is already registered via @customElement decorator in config-editor.ts
    // which is imported at the top of this file
    const editor = document.createElement('energy-flow-card-editor');
    console.log('[EnergyFlowCard] energy-flow-card-editor element created:', editor);
    return editor;
  }

  /**
   * Get stub config for initial card setup
   * @returns Default configuration
   */
  public static getStubConfig(): EnergyFlowCardConfig {
    return {
      type: 'custom:energy-flow-card',
      entities: {},
      devices: [],
      update_interval: 2000,
      show_statistics: true,
      visualization_mode: 'particles',
      min_height: 400,
      max_height: 700
    };
  }

  /**
   * Lifecycle: Called when component is added to DOM
   */
  public connectedCallback(): void {
    super.connectedCallback();
    this.initializeSensorManager();
    this.startUpdateTimer();
  }

  /**
   * Lifecycle: Called when component is removed from DOM
   */
  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.cleanup();
  }

  /**
   * Lifecycle: Called when properties change
   */
  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('hass')) {
      this.handleHassUpdate();
    }

    if (changedProperties.has('config')) {
      this.reinitialize();
    }

    // Initialize canvas rendering after first render
    if (this.canvas && !this.animationFrameId) {
      this.initializeCanvas();
      this.startAnimationLoop();
    }
  }

  /**
   * Render the card content
   */
  protected render() {
    if (this.isLoading) {
      return html`
        <div class="card-content">
          <div class="loading">Loading energy flow...</div>
        </div>
      `;
    }

    if (this.errorMessage) {
      return html`
        <div class="card-content">
          <div class="error">
            <div class="error-icon">⚠️</div>
            <div class="error-message">${this.errorMessage}</div>
          </div>
        </div>
      `;
    }

    const minHeight = this.config.min_height ?? 1000;

    return html`
      <div class="card-content">
        <div class="canvas-container" style="min-height: ${minHeight}px; height: auto;">
          <canvas></canvas>
        </div>
        ${this.config.show_statistics ? this.renderStatistics() : ''}
      </div>
    `;
  }

  /**
   * Render card header with title and refresh button
   */
  private renderHeader() {
    return html`
      <div class="card-header">
        <div class="card-title">Energy Flow</div>
        <button
          class="refresh-button"
          @click=${this.handleRefresh}
          aria-label="Refresh">
          🔄
        </button>
      </div>
    `;
  }

  /**
   * Render warning banners
   */
  private renderWarnings() {
    return html`
      ${this.warnings.map(warning => html`
        <div class="warning-banner">
          <span class="warning-icon">⚠️</span>
          <span>${warning}</span>
        </div>
      `)}
    `;
  }

  /**
   * Render statistics panel
   */
  private renderStatistics() {
    // Calculate statistics from current node states
    const solarPower = this.sourceNodes.find(n => n.type === 'solar')?.powerWatts ?? 0;
    const batteryPower = this.sourceNodes.find(n => n.type === 'battery')?.powerWatts ?? 0;
    const gridPower = this.sourceNodes.find(n => n.type === 'grid')?.powerWatts ?? 0;

    // Calculate total consumption
    const totalConsumption = this.consumptionNodes.reduce((sum, node) => sum + node.powerWatts, 0);

    // Calculate total generation (solar + battery discharge if positive)
    const totalGeneration = solarPower + Math.max(0, batteryPower);

    // Calculate efficiency: (generation / consumption) * 100
    const efficiency = totalConsumption > 0
      ? Math.min(100, Math.round((totalGeneration / totalConsumption) * 100))
      : 0;

    // Calculate self-sufficiency: what % of consumption is from local sources
    const selfSufficiency = totalConsumption > 0
      ? Math.min(100, Math.round((totalGeneration / totalConsumption) * 100))
      : 100;

    // Format values for display
    const formatPower = (watts: number) => {
      const abs = Math.abs(watts);
      if (abs >= 1000) {
        return `${(abs / 1000).toFixed(2)} kW`;
      }
      return `${Math.round(abs)} W`;
    };

    return html`
      <div class="statistics-panel">
        <div class="stat-item">
          <div class="stat-label">Efficiency</div>
          <div class="stat-value">${efficiency}<span class="stat-unit">%</span></div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Self-Sufficiency</div>
          <div class="stat-value">${selfSufficiency}<span class="stat-unit">%</span></div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Solar</div>
          <div class="stat-value">${formatPower(solarPower)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Grid</div>
          <div class="stat-value">${formatPower(gridPower)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize sensor manager and subscriptions
   */
  private initializeSensorManager(): void {
    if (!this.hass || !this.config) return;

    const entityIds = this.getAllEntityIds();
    const staleThreshold = 60000; // 60 seconds

    this.sensorManager = new SensorManager(this.hass, staleThreshold);
    this.sensorManager.subscribe(entityIds, () => {
      this.updateNodeStates();
      this.checkWarnings();
    });
  }

  /**
   * Get all entity IDs from config
   */
  private getAllEntityIds(): string[] {
    const ids: string[] = [];

    if (this.config.entities?.solar) ids.push(this.config.entities.solar);
    if (this.config.entities?.battery) ids.push(this.config.entities.battery);
    if (this.config.entities?.battery_soc) ids.push(this.config.entities.battery_soc);
    if (this.config.entities?.battery_capacity) ids.push(this.config.entities.battery_capacity);
    if (this.config.entities?.grid) ids.push(this.config.entities.grid);

    if (this.config.devices) {
      for (const device of this.config.devices) {
        ids.push(device.entity_id);
      }
    }

    if (this.config.categories) {
      for (const category of this.config.categories) {
        if (category.circuit_entity) {
          ids.push(category.circuit_entity);
        }
      }
    }

    return ids;
  }

  /**
   * Update node states from sensor manager
   */
  private updateNodeStates(): void {
    if (!this.sensorManager) return;

    // Update source nodes
    this.sourceNodes = this.createSourceNodes();

    // Update consumption nodes
    this.consumptionNodes = this.createConsumptionNodes();

    // Update layout if initialized
    if (this.layoutEngine && this.canvas) {
      this.layoutEngine.updateLayout(this.sourceNodes, this.consumptionNodes);
      this.layoutEngine.useFixedLayout(this.sourceNodes, this.consumptionNodes);
      this.layoutEngine.applyPositions(this.sourceNodes, this.consumptionNodes);
    }

    this.requestUpdate();
  }

  /**
   * Create source nodes from configuration
   */
  private createSourceNodes(): EnergySourceNode[] {
    const nodes: EnergySourceNode[] = [];
    const now = Date.now();

    // Calculate positions: Compressed triangle layout - sources on left, more space for devices
    const canvasHeight = this.canvas?.height ?? 500;
    const canvasWidth = this.canvas?.width ?? 800;

    // Grid node - LEFT VERTEX (far left, middle height)
    if (this.config.entities?.grid) {
      const gridPower = this.sensorManager?.getPowerValue(this.config.entities.grid) ?? 0;
      const sensorState = this.sensorManager?.getSensorState(this.config.entities.grid);
      const flowDirection = getGridFlowDirection(gridPower);

      nodes.push({
        type: 'grid',
        entityId: this.config.entities.grid,
        powerWatts: gridPower,
        isActive: Math.abs(gridPower) > 10,
        isStale: sensorState?.isStale ?? false,
        lastUpdated: sensorState?.lastUpdated ?? now,
        displayValue: String(Math.round(Math.abs(gridPower))),
        displayUnit: 'W',
        color: this.config.theme?.grid_color ?? '#f44336',
        icon: flowDirection === 'export' ? '⚡⬆' : flowDirection === 'import' ? '⚡⬇' : '⚡',
        x: canvasWidth * 0.08,  // 8% from left (compressed left - was 10%)
        y: canvasHeight * 0.50,  // Middle (50% from top)
        radius: 45  // Medium
      });
    }

    // Solar node - TOP VERTEX (top of triangle)
    if (this.config.entities?.solar) {
      const solarPower = this.sensorManager?.getPowerValue(this.config.entities.solar) ?? 0;
      const sensorState = this.sensorManager?.getSensorState(this.config.entities.solar);

      nodes.push({
        type: 'solar',
        entityId: this.config.entities.solar,
        powerWatts: solarPower,
        isActive: solarPower > 10,
        isStale: sensorState?.isStale ?? false,
        lastUpdated: sensorState?.lastUpdated ?? now,
        displayValue: String(Math.round(solarPower)),
        displayUnit: 'W',
        color: this.config.theme?.solar_color ?? '#ffa500',
        icon: '☀️',
        x: canvasWidth * 0.22,  // 22% from left (compressed - was 30%)
        y: canvasHeight * 0.15,  // Top (15% from top)
        radius: 50  // Large
      });
    }

    // Battery node - BOTTOM VERTEX (below grid-hub line, forms triangle with Solar)
    if (this.config.entities?.battery) {
      const batteryPower = this.sensorManager?.getPowerValue(this.config.entities.battery) ?? 0;
      const sensorState = this.sensorManager?.getSensorState(this.config.entities.battery);
      const flowDirection = getBatteryFlowDirection(batteryPower);

      nodes.push({
        type: 'battery',
        entityId: this.config.entities.battery,
        powerWatts: batteryPower,
        isActive: Math.abs(batteryPower) > 10,
        isStale: sensorState?.isStale ?? false,
        lastUpdated: sensorState?.lastUpdated ?? now,
        displayValue: String(Math.round(Math.abs(batteryPower))),
        displayUnit: 'W',
        color: this.config.theme?.battery_color ?? '#4caf50',
        icon: flowDirection === 'charging' ? '🔋⬆' : flowDirection === 'discharging' ? '🔋⬇' : '🔋',
        x: canvasWidth * 0.22,  // 22% from left (compressed - was 40%)
        y: canvasHeight * 0.70,  // Bottom-middle (70% from top - below grid/hub)
        radius: 45  // Medium
      });
    }

    return nodes;
  }

  /**
   * Create consumption device nodes from configuration
   * Supports hierarchical categories with circuit remainder calculation
   */
  private createConsumptionNodes(): ConsumptionDeviceNode[] {
    const nodes: ConsumptionDeviceNode[] = [];
    const now = Date.now();

    if (!this.config.devices) return nodes;

    // Create device nodes
    const deviceNodes: ConsumptionDeviceNode[] = [];
    for (const deviceConfig of this.config.devices) {
      const powerWatts = this.sensorManager?.getPowerValue(deviceConfig.entity_id) ?? 0;
      const sensorState = this.sensorManager?.getSensorState(deviceConfig.entity_id);
      const isVisible = deviceConfig.show_when_off || powerWatts > 0;

      deviceNodes.push({
        id: deviceConfig.id,
        entityId: deviceConfig.entity_id,
        name: deviceConfig.name ?? deviceConfig.id,
        powerWatts,
        isStale: sensorState?.isStale ?? false,
        lastUpdated: sensorState?.lastUpdated ?? now,
        displayValue: String(Math.round(powerWatts)),
        displayUnit: 'W',
        icon: deviceConfig.icon ?? '💡',
        categoryId: deviceConfig.category,
        x: 0,
        y: 0,
        radius: 30,
        isVisible
      });
    }

    // Build category nodes if categories are configured
    this.categoryNodes.clear();
    const categoryMap = new Map<string, ConsumptionDeviceNode[]>();
    const categorizedDeviceIds = new Set<string>();

    if (this.config.categories) {
      for (const categoryConfig of this.config.categories) {
        // Get devices in this category
        const categoryDevices = deviceNodes.filter(d => d.categoryId === categoryConfig.id);

        // Mark these devices as categorized so they don't get added standalone
        for (const device of categoryDevices) {
          categorizedDeviceIds.add(device.id);
        }

        // Calculate total power (from circuit entity if provided, else sum of devices)
        let totalPower = 0;
        let circuitEntityId = categoryConfig.circuit_entity || '';

        if (categoryConfig.circuit_entity) {
          totalPower = this.sensorManager?.getPowerValue(categoryConfig.circuit_entity) ?? 0;
          circuitEntityId = categoryConfig.circuit_entity;
        } else {
          totalPower = categoryDevices.reduce((sum, d) => sum + d.powerWatts, 0);
          circuitEntityId = `category_${categoryConfig.id}`;
        }

        // Calculate remainder if circuit entity provided
        let remainder = 0;
        if (categoryConfig.circuit_entity) {
          const childSum = categoryDevices.reduce((sum, d) => sum + d.powerWatts, 0);
          remainder = Math.max(0, totalPower - childSum); // Don't show negative remainder
        }

        // Create category node
        const isCollapsed = this.collapsedCategories.has(categoryConfig.id);
        const categoryNode: ConsumptionDeviceNode = {
          id: categoryConfig.id,
          entityId: circuitEntityId,
          name: categoryConfig.name,
          powerWatts: totalPower,
          isStale: false,
          lastUpdated: now,
          displayValue: String(Math.round(totalPower)),
          displayUnit: 'W',
          icon: categoryConfig.icon ?? '📁',
          children: categoryDevices,
          calculatedRemainder: remainder,
          x: 0,
          y: 0,
          radius: 35,
          isVisible: true
        };

        this.categoryNodes.set(categoryConfig.id, categoryNode);
        categoryMap.set(categoryConfig.id, categoryDevices);
        nodes.push(categoryNode);
      }
    }

    // Add standalone devices (not in any category)
    const standaloneDevices = deviceNodes.filter(d => !d.categoryId && !categorizedDeviceIds.has(d.id));
    nodes.push(...standaloneDevices);

    // Calculate unmonitored power and add as a device if significant
    const totalMonitoredPower = nodes.reduce((sum, node) => sum + node.powerWatts, 0);
    const totalHubLoad = this.sourceNodes.reduce((sum, node) => sum + node.powerWatts, 0);
    const unmonitoredPower = Math.max(0, totalHubLoad - totalMonitoredPower);

    // Only show unmonitored device if power is > 50W (configurable threshold)
    if (unmonitoredPower > 50) {
      const unmonitoredNode: ConsumptionDeviceNode = {
        id: 'unmonitored',
        entityId: 'calculated.unmonitored',
        name: 'Unmonitored',
        powerWatts: unmonitoredPower,
        isStale: false,
        lastUpdated: now,
        displayValue: String(Math.round(unmonitoredPower)),
        displayUnit: 'W',
        icon: '❓',
        x: 0,
        y: 0,
        radius: 30,
        isVisible: true
      };
      nodes.push(unmonitoredNode);
    }

    // Calculate positions in zigzag pattern
    this.positionConsumptionNodes(nodes);

    return nodes;
  }

  /**
   * Position consumption nodes in single column layout with dynamic spacing
   */
  private positionConsumptionNodes(nodes: ConsumptionDeviceNode[]): void {
    const canvasWidth = this.canvas?.width ?? 800;
    const canvasHeight = this.canvas?.height ?? 1000;

    // Calculate total visible items (categories + standalones only, children are to the right)
    let totalVisibleItems = 0;
    for (const node of nodes) {
      if (!node.isVisible) continue;
      totalVisibleItems++; // Count categories and standalone devices only
      // Children don't take vertical space - they're positioned to the right
    }

    // Dynamic spacing calculation
    const topMargin = 60;
    const bottomMargin = 60;
    const minSpacing = 60;  // Minimum spacing between items to prevent overlap
    const availableHeight = canvasHeight - topMargin - bottomMargin;

    // Calculate optimal spacing based on available height and item count
    const calculatedSpacing = totalVisibleItems > 0
      ? Math.max(minSpacing, availableHeight / totalVisibleItems)
      : 100;

    // Use calculated spacing for categories and devices
    const categorySpacing = calculatedSpacing;

    // Position categories/devices with zigzag pattern (more space now!)
    const categoryLeftX = canvasWidth * 0.55;   // Left position (55% from left - was 70%)
    const categoryRightX = canvasWidth * 0.68;  // Right position (68% from left - was 80%)
    const childLeftX = canvasWidth * 0.80;      // Children left position (80% from left - was 88%)
    const childRightX = canvasWidth * 0.92;     // Children right position (92% from left - was 94%)
    const startY = topMargin;

    // Margins for bounds checking
    const nodeRadius = 35;  // Max node radius
    const rightMargin = 50; // Keep nodes away from edge
    const maxY = canvasHeight - bottomMargin - nodeRadius;

    let currentY = startY;
    let visibleIndex = 0;

    for (const node of nodes) {
      if (!node.isVisible) continue;

      const isCategory = this.categoryNodes.has(node.id);
      const isCollapsed = this.collapsedCategories.has(node.id);

      // Position category or standalone device with zigzag
      node.x = (visibleIndex % 2 === 0) ? categoryLeftX : categoryRightX;
      node.y = Math.min(currentY, maxY);  // Ensure within bounds

      if (isCategory && !isCollapsed && node.children) {
        // Position children vertically to the RIGHT of category
        const visibleChildren = node.children.filter(c => c.isVisible);

        if (visibleChildren.length > 0) {
          const childVerticalSpacing = 65;  // Vertical spacing between children
          const totalChildHeight = visibleChildren.length * childVerticalSpacing;

          // Center children vertically around the category's Y position
          let childStartY = node.y - (totalChildHeight / 2) + (childVerticalSpacing / 2);

          // Ensure first child is within top bounds
          childStartY = Math.max(topMargin, childStartY);

          // Position each child vertically to the right with zigzag
          visibleChildren.forEach((child, index) => {
            // Zigzag children between two X positions
            const childX = (index % 2 === 0) ? childLeftX : childRightX;
            child.x = Math.min(childX, canvasWidth - rightMargin);  // Keep within right bounds
            child.y = Math.min(childStartY + (index * childVerticalSpacing), maxY);  // Keep within bottom bounds
          });
        }
      }

      // Move to next row
      currentY += categorySpacing;
      visibleIndex++;
    }
  }

  /**
   * Handle canvas click event for category toggling and entity dialogs
   */
  private handleCanvasClick(event: MouseEvent): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is on any category node (toggle expand/collapse)
    for (const [categoryId, categoryNode] of this.categoryNodes) {
      const dx = x - categoryNode.x;
      const dy = y - categoryNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= categoryNode.radius) {
        this.handleCategoryClick(categoryId);
        return;
      }
    }

    // Check if click is on any entity node (open HA dialog)
    const entity = this.findEntityAtPosition(x, y);
    if (entity && entity.entityId) {
      this.openEntityDialog(entity.entityId);
    }
  }

  /**
   * Handle canvas hover for cursor changes and tooltips
   */
  private handleCanvasHover(event: MouseEvent): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if hovering over any interactive element
    let isOverInteractive = false;

    // Check category nodes
    for (const categoryNode of this.categoryNodes.values()) {
      const dx = x - categoryNode.x;
      const dy = y - categoryNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= categoryNode.radius) {
        isOverInteractive = true;
        break;
      }
    }

    // Check for entity under cursor (for tooltip)
    const entity = this.findEntityAtPosition(x, y);
    if (entity) {
      isOverInteractive = true;

      // Show tooltip with entity info
      const powerStr = Math.abs(entity.power) >= 1000
        ? `${(entity.power / 1000).toFixed(2)} kW`
        : `${Math.round(entity.power)} W`;

      const tooltipContent = `
        <div style="font-weight: bold; margin-bottom: 4px;">${entity.name}</div>
        <div style="color: #64b5f6;">${powerStr}</div>
        <div style="font-size: 10px; color: #888; margin-top: 4px;">Click to view details</div>
      `;
      this.showTooltip(event.clientX, event.clientY, tooltipContent);
    } else {
      this.hideTooltip();
    }

    // Update cursor
    this.canvas.style.cursor = isOverInteractive ? 'pointer' : 'default';
  }

  /**
   * Handle category node click to toggle expand/collapse
   */
  private handleCategoryClick(categoryId: string): void {
    if (this.collapsedCategories.has(categoryId)) {
      this.collapsedCategories.delete(categoryId);
    } else {
      this.collapsedCategories.add(categoryId);
    }

    // Recalculate positions
    this.updateNodeStates();
    this.requestUpdate();
  }

  /**
   * Check for warning conditions
   */
  private checkWarnings(): void {
    const warnings: string[] = [];

    // Check for stale sensors
    if (this.sensorManager) {
      const staleSensors = this.sensorManager.getStaleSensors();
      if (staleSensors.length > 0) {
        warnings.push(`${staleSensors.length} sensor(s) not responding`);
      }
    }

    // Check battery low warning
    if (this.config.warnings?.battery_low && this.config.entities?.battery_soc) {
      const soc = this.sensorManager?.getPercentageValue(this.config.entities.battery_soc) ?? 0;
      if (soc < this.config.warnings.battery_low) {
        warnings.push(`Battery low: ${soc}%`);
      }
    }

    // Check grid import warning
    if (this.config.warnings?.grid_import && this.config.entities?.grid) {
      const gridPower = this.sensorManager?.getPowerValue(this.config.entities.grid) ?? 0;
      if (gridPower > this.config.warnings.grid_import) {
        warnings.push(`High grid import: ${Math.round(gridPower)}W`);
      }
    }

    this.warnings = warnings;
  }

  /**
   * Initialize canvas for rendering
   */
  private initializeCanvas(): void {
    if (!this.canvas) return;

    // Add initializing class to prevent flash
    this.canvas.classList.add('initializing');

    const container = this.canvas.parentElement;
    if (!container) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Remove initializing class after a frame to allow smooth fade-in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.canvas?.classList.remove('initializing');
      });
    });

    // Initialize rendering systems
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      this.nodeRenderer = new NodeRenderer(ctx);
      this.sankeyRenderer = new SankeyRenderer(ctx);
      this.particleSystem = new ParticleSystem(500); // Increased from 200 to 500
      this.layoutEngine = new LayoutEngine(this.canvas.width, this.canvas.height);

      // Initialize bus layout renderers
      this.busRenderer = new BusRenderer(ctx);
      this.trunkSankeyRenderer = new TrunkSankeyRenderer(ctx);
      this.sourceFlowRenderer = new SourceFlowRenderer(ctx);

      // Initialize node states
      this.updateNodeStates();
    }

    // Setup resize observer with debounce
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResizeDebounced();
    });
    this.resizeObserver.observe(container);

    // Setup click handler for category toggling and entity dialogs
    this.canvasClickHandler = (event: MouseEvent) => {
      this.handleCanvasClick(event);
    };
    this.canvas.addEventListener('click', this.canvasClickHandler);

    // Add hover handler for cursor changes and tooltips
    this.canvasHoverHandler = (event: MouseEvent) => {
      this.handleCanvasHover(event);
    };
    this.canvas.addEventListener('mousemove', this.canvasHoverHandler);

    // Hide tooltip when leaving canvas
    this.canvas.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });
  }

  /**
   * Debounced resize handler
   */
  private handleResizeDebounced(): void {
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
    this.resizeDebounceTimer = window.setTimeout(() => {
      this.handleResize();
    }, ANIMATION.RESIZE_DEBOUNCE);
  }

  /**
   * Handle canvas resize
   */
  private handleResize(): void {
    if (!this.canvas) return;

    const container = this.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Update layout engine dimensions
    if (this.layoutEngine) {
      this.layoutEngine.resize(rect.width, rect.height);
    }

    // Recalculate node positions on resize
    this.updateNodeStates();
  }

  /**
   * Start animation loop
   */
  private startAnimationLoop(): void {
    this.lastFrameTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
      this.lastFrameTime = currentTime;

      this.renderCanvas(deltaTime);
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Render canvas content
   */
  private renderCanvas(deltaTime: number): void {
    if (!this.canvas || !this.nodeRenderer) return;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    this.nodeRenderer.clear(this.canvas.width, this.canvas.height);

    // Draw dark gradient background
    const gradient = ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
    );
    gradient.addColorStop(0, 'rgba(30, 50, 80, 0.3)');
    gradient.addColorStop(1, 'rgba(10, 20, 35, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render version number in top-left corner
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`v${VERSION}`, 10, 10);
    ctx.restore();

    // Check layout mode and render accordingly
    if (this.config.layout_mode === 'horizontal_bus') {
      this.renderBusLayout(ctx, deltaTime);
      return;
    }

    // === Triangle Layout (default) ===

    // Get hub position (compressed left - 40% from left, between sources and devices)
    const hubX = this.canvas.width * 0.40;
    const hubY = this.canvas.height / 2;

    // Calculate energy flows first (needed for all visualization modes)
    const solarNode = this.sourceNodes.find(n => n.type === 'solar');
    const batteryNode = this.sourceNodes.find(n => n.type === 'battery');
    const gridNode = this.sourceNodes.find(n => n.type === 'grid');

    // Calculate total load from all visible consumption nodes (excluding total_load if it exists)
    const totalLoad = this.consumptionNodes
      .filter(n => n.id !== 'total_load')
      .reduce((sum, node) => sum + node.powerWatts, 0);

    // Apply inversions for GivEnergy compatibility
    // GivEnergy uses negative for charging/importing (opposite of standard)
    let batteryPower = batteryNode?.powerWatts ?? 0;
    let gridPower = gridNode?.powerWatts ?? 0;

    if (this.config.entities?.battery_invert) {
      batteryPower = -batteryPower;
    }
    if (this.config.entities?.grid_invert) {
      gridPower = -gridPower;
    }

    const energyFlows = calculateEnergyFlows({
      solar: solarNode?.powerWatts ?? 0,
      battery: batteryPower,
      grid: gridPower,
      totalLoad: totalLoad
    });

    // Debug: Log energy flows once every 5 seconds (only if debug enabled)
    if (this.config.debug) {
      const now = Date.now();
      if (!this.lastDebugLog || now - this.lastDebugLog > THRESHOLDS.DEBUG_LOG_INTERVAL) {
        console.log('=== ENERGY FLOW DEBUG ===');
        console.log('Input Values:', {
          solar: solarNode?.powerWatts ?? 0,
          battery: batteryNode?.powerWatts ?? 0,
          grid: gridNode?.powerWatts ?? 0,
          totalLoad: totalLoad
        });
        console.log('Calculated Flows:');
        energyFlows.forEach(flow => {
          console.log(`  ${flow.from} → ${flow.to}: ${Math.round(flow.powerWatts)}W (${flow.color})`);
        });
        this.lastDebugLog = now;
      }
    }

    const vizMode = this.config.visualization_mode ?? 'particles';

    // Render Sankey flows (for 'sankey' or 'both' modes)
    if (vizMode === 'sankey' || vizMode === 'both') {
      if (this.sankeyRenderer) {
        // Update animation time for flowing gradient effect
        this.sankeyRenderer.updateAnimation(deltaTime);

        // Render Sankey flows between sources
        this.sankeyRenderer.renderEnergyFlows(energyFlows, this.sourceNodes, hubX, hubY);

        // Render Sankey flows from hub to devices
        this.sankeyRenderer.renderDeviceFlows(
          this.consumptionNodes,
          hubX,
          hubY,
          this.categoryNodes,
          this.collapsedCategories
        );
      }
    }

    // Render thin connection lines (for 'particles' mode only)
    if (vizMode === 'particles') {
      for (const flow of energyFlows) {
        const fromNode = this.sourceNodes.find(n => n.type === flow.from);
        const toNodeSource = this.sourceNodes.find(n => n.type === flow.to);

        if (fromNode && toNodeSource) {
          // Source to source connection
          this.nodeRenderer.renderConnection(
            fromNode.x, fromNode.y,
            toNodeSource.x, toNodeSource.y,
            flow.color,
            2,
            0.3
          );
        } else if (fromNode && flow.to === 'hub') {
          // Source to hub connection
          this.nodeRenderer.renderConnection(
            fromNode.x, fromNode.y,
            hubX, hubY,
            flow.color,
            2,
            0.3
          );
        }
      }

      // Render connections from hub to devices (respecting hierarchy)
      for (const device of this.consumptionNodes) {
        if (!device.isVisible || device.powerWatts <= 10 || device.id === 'total_load') {
          continue;
        }

        const isCategory = this.categoryNodes.has(device.id);
        const isCollapsed = this.collapsedCategories.has(device.id);

        // Draw connection from hub to category/device
        this.nodeRenderer.renderConnection(
          hubX, hubY,
          device.x, device.y,
          '#999999',
          2,
          0.3
        );

        // If category is expanded, draw connections to children
        if (isCategory && !isCollapsed && device.children) {
          for (const child of device.children) {
            if (child.isVisible && child.powerWatts > 10) {
              this.nodeRenderer.renderConnection(
                device.x, device.y,
                child.x, child.y,
                '#666666',
                1,
                0.2
              );
            }
          }
        }
      }
    }

    // Particle system (for 'particles' or 'both' modes)
    if ((vizMode === 'particles' || vizMode === 'both') && this.particleSystem) {
      // Create hub node for particle spawning - larger size
      const hubNode: HubNode = {
        type: 'hub',
        entityId: 'hub',
        x: hubX,
        y: hubY,
        radius: NODE_SIZES.HUB_RADIUS,
        color: this.getDominantSourceColor(energyFlows)
      };

      // Spawn particles for energy flows between sources and to hub
      for (const flow of energyFlows) {
        const fromNode = this.sourceNodes.find(n => n.type === flow.from);
        const toNode = flow.to === 'hub' ? hubNode : this.sourceNodes.find(n => n.type === flow.to);

        if (fromNode && toNode && flow.powerWatts > THRESHOLDS.POWER_MIN_DISPLAY) {

          // Spawn particles for this flow
          this.particleSystem.spawnParticles(
            fromNode,
            toNode as any,
            flow.powerWatts,
            deltaTime
          );
        }
      }

      // Spawn particles from hub to devices (respecting category hierarchy)
      for (const device of this.consumptionNodes) {
        if (!device.isVisible || device.powerWatts <= THRESHOLDS.POWER_MIN_DISPLAY || device.id === 'total_load') {
          continue;
        }

        const isCategory = this.categoryNodes.has(device.id);
        const isCollapsed = this.collapsedCategories.has(device.id);

        if (isCategory) {
          // For categories, spawn particles to the category node
          this.particleSystem.spawnParticles(
            hubNode,
            device,
            device.powerWatts,
            deltaTime
          );

          // If expanded, spawn particles from category to children
          if (!isCollapsed && device.children) {
            for (const child of device.children) {
              if (child.isVisible && child.powerWatts > 10) {
                this.particleSystem.spawnParticles(
                  device,
                  child,
                  child.powerWatts,
                  deltaTime * 0.5 // Slower particle spawn rate for child flows
                );
              }
            }
          }
        } else {
          // Standalone device (not in category)
          this.particleSystem.spawnParticles(
            hubNode,
            device,
            device.powerWatts,
            deltaTime
          );
        }
      }

      // Update particles
      this.particleSystem.update(deltaTime);

      // Render particles
      this.particleSystem.render(ctx);
    }

    // Render hub node with total load (calculated earlier) - larger size
    this.nodeRenderer.renderHubNode(hubX, hubY, 50, totalLoad);

    // Render source nodes
    const batterySOC = this.config.entities?.battery_soc
      ? this.sensorManager?.getPercentageValue(this.config.entities.battery_soc)
      : undefined;

    const batteryCapacity = this.config.entities?.battery_capacity
      ? this.sensorManager?.getPowerValue(this.config.entities.battery_capacity)
      : undefined;

    const batteryPowerRaw = batteryNode?.powerWatts ?? 0;

    // Calculate battery time remaining
    let batteryTimeRemainingStr: string | undefined = undefined;
    if (batterySOC !== undefined && batteryCapacity) {
      const timeMinutes = calculateBatteryTimeRemaining(batterySOC, batteryCapacity, batteryPowerRaw);
      if (timeMinutes !== null) {
        const timeStr = formatTimeRemaining(timeMinutes);
        const direction = batteryPowerRaw > 10 ? 'empty' : 'full';
        batteryTimeRemainingStr = timeStr ? `${timeStr} to ${direction}` : undefined;
      }
    }

    for (const source of this.sourceNodes) {
      const soc = source.type === 'battery' ? batterySOC : undefined;
      const capacity = source.type === 'battery' ? batteryCapacity : undefined;
      const timeRemaining = source.type === 'battery' ? batteryTimeRemainingStr : undefined;

      // Check for warnings
      let hasWarning = false;
      if (source.type === 'battery' && soc !== undefined && this.config.warnings?.battery_low) {
        hasWarning = soc < this.config.warnings.battery_low;
      } else if (source.type === 'grid' && this.config.warnings?.grid_import) {
        hasWarning = source.powerWatts > this.config.warnings.grid_import;
      }

      this.nodeRenderer.renderSourceNode(source, soc, capacity, timeRemaining, hasWarning);
    }

    // Render consumption nodes (categories and devices)
    for (const device of this.consumptionNodes) {
      if (device.isVisible) {
        const isCategory = this.categoryNodes.has(device.id);
        const isCollapsed = this.collapsedCategories.has(device.id);

        if (isCategory) {
          // Render category node with expand/collapse indicator
          this.nodeRenderer.renderCategoryNode(device, isCollapsed);

          // Render children if expanded
          if (!isCollapsed && device.children) {
            for (const child of device.children) {
              if (child.isVisible) {
                this.nodeRenderer.renderConsumptionNode(child);
              }
            }

            // Render remainder node if exists (positioned below last child)
            if (device.calculatedRemainder && device.calculatedRemainder > 10) {
              const lastChild = device.children[device.children.length - 1];
              const childVerticalSpacing = 65;

              // Position remainder below the last child
              this.nodeRenderer.renderRemainderNode(
                lastChild ? lastChild.x : device.x + 120,
                lastChild ? lastChild.y + childVerticalSpacing : device.y + 80,
                device.calculatedRemainder
              );
            }
          }
        } else {
          // Render standalone device
          this.nodeRenderer.renderConsumptionNode(device);
        }
      }
    }
  }

  /**
   * Render horizontal bus layout - compact layout for tablet top strip
   * Sources on left → Bus in center → Consumers on right via trunk distribution
   */
  private renderBusLayout(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    if (!this.canvas || !this.busRenderer || !this.trunkSankeyRenderer || !this.sourceFlowRenderer) {
      return;
    }

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Layout configuration for horizontal bus
    // Bus takes up center portion, sources on left, consumers on right
    const busWidth = width * 0.25;  // Bus is 25% of width
    const busHeight = 40;
    const busX = width * 0.35;      // Bus starts at 35% from left
    const busY = height * 0.5;      // Vertically centered

    // Source node positions (left side, in a vertical stack)
    const sourceAreaX = width * 0.12;
    const sourceSpacing = height * 0.28;
    const sourceCenterY = height * 0.5;

    // Consumer trunk configuration (right side)
    const trunkStartX = busX + busWidth;
    const trunkX = busX + busWidth + 60;  // Trunk line 60px from bus edge

    // Calculate energy data
    const solarNode = this.sourceNodes.find(n => n.type === 'solar');
    const batteryNode = this.sourceNodes.find(n => n.type === 'battery');
    const gridNode = this.sourceNodes.find(n => n.type === 'grid');

    // Apply inversions for compatibility
    let batteryPower = batteryNode?.powerWatts ?? 0;
    let gridPower = gridNode?.powerWatts ?? 0;

    if (this.config.entities?.battery_invert) {
      batteryPower = -batteryPower;
    }
    if (this.config.entities?.grid_invert) {
      gridPower = -gridPower;
    }

    // Calculate total load
    const totalLoad = this.consumptionNodes
      .filter(n => n.id !== 'total_load')
      .reduce((sum, node) => sum + node.powerWatts, 0);

    // Calculate energy flows
    const energyFlows = calculateEnergyFlows({
      solar: solarNode?.powerWatts ?? 0,
      battery: batteryPower,
      grid: gridPower,
      totalLoad: totalLoad
    });

    // Update source node positions for horizontal layout
    const updatedSourceNodes: EnergySourceNode[] = this.sourceNodes.map(node => {
      let yOffset = 0;
      switch (node.type) {
        case 'solar':
          yOffset = -sourceSpacing;
          break;
        case 'grid':
          yOffset = 0;
          break;
        case 'battery':
          yOffset = sourceSpacing;
          break;
      }
      return {
        ...node,
        x: sourceAreaX,
        y: sourceCenterY + yOffset,
        radius: 35
      };
    });

    // Bus configuration
    const busConfig: BusConfig = {
      x: busX,
      y: busY,
      width: busWidth,
      height: busHeight
    };

    // Calculate power contributions to the bus (only inflows)
    const contributions: PowerContribution[] = [];

    // Solar contribution to bus
    const solarToBus = energyFlows.find(f => f.from === 'solar' && f.to === 'hub');
    if (solarToBus && solarToBus.powerWatts > 0) {
      contributions.push({
        source: 'solar',
        watts: solarToBus.powerWatts,
        color: '#ffa500'
      });
    }

    // Grid contribution to bus (import only)
    const gridToBus = energyFlows.find(f => f.from === 'grid' && f.to === 'hub');
    if (gridToBus && gridToBus.powerWatts > 0) {
      contributions.push({
        source: 'grid',
        watts: gridToBus.powerWatts,
        color: '#f44336'
      });
    }

    // Battery contribution to bus (discharge only)
    const batteryToBus = energyFlows.find(f => f.from === 'battery' && f.to === 'hub');
    if (batteryToBus && batteryToBus.powerWatts > 0) {
      contributions.push({
        source: 'battery',
        watts: batteryToBus.powerWatts,
        color: '#4caf50'
      });
    }

    const totalBusPower = contributions.reduce((sum, c) => sum + c.watts, 0);

    // Update animation times
    this.busRenderer.updateAnimation(deltaTime);
    this.sourceFlowRenderer.updateAnimation(deltaTime);
    this.trunkSankeyRenderer.updateAnimation(deltaTime);

    // Render source flows to bus (and inter-source flows like solar→battery)
    this.sourceFlowRenderer.renderSourceFlows(energyFlows, updatedSourceNodes, busConfig);

    // Render the energy bus
    this.busRenderer.renderBus(busConfig, contributions, totalBusPower);

    // Trunk configuration for consumer distribution
    const trunkConfig: TrunkConfig = {
      startX: trunkStartX,
      startY: busY,
      trunkX: trunkX
    };

    // Update consumption node positions for horizontal layout
    const consumerAreaX = width * 0.85;
    const maxVisibleDevices = 8;
    const visibleDevices = this.consumptionNodes.filter(
      d => d.isVisible && d.powerWatts >= 10 && d.id !== 'total_load'
    );
    const deviceCount = Math.min(visibleDevices.length, maxVisibleDevices);
    const deviceSpacing = deviceCount > 1 ? (height * 0.7) / (deviceCount - 1) : 0;
    const deviceStartY = height * 0.15;

    const updatedConsumptionNodes: ConsumptionDeviceNode[] = this.consumptionNodes.map((node, idx) => {
      const visibleIdx = visibleDevices.findIndex(d => d.id === node.id);
      const yPos = visibleIdx >= 0 ? deviceStartY + visibleIdx * deviceSpacing : node.y;
      return {
        ...node,
        x: consumerAreaX,
        y: yPos,
        radius: 25
      };
    });

    // Render trunk-based consumer flows
    this.trunkSankeyRenderer.render(
      trunkConfig,
      updatedConsumptionNodes,
      this.categoryNodes,
      this.collapsedCategories,
      totalLoad
    );

    // Render source nodes
    const batterySOC = this.config.entities?.battery_soc
      ? this.sensorManager?.getPercentageValue(this.config.entities.battery_soc)
      : undefined;

    const batteryCapacity = this.config.entities?.battery_capacity
      ? this.sensorManager?.getPowerValue(this.config.entities.battery_capacity)
      : undefined;

    for (const source of updatedSourceNodes) {
      const soc = source.type === 'battery' ? batterySOC : undefined;
      const capacity = source.type === 'battery' ? batteryCapacity : undefined;

      let hasWarning = false;
      if (source.type === 'battery' && soc !== undefined && this.config.warnings?.battery_low) {
        hasWarning = soc < this.config.warnings.battery_low;
      } else if (source.type === 'grid' && this.config.warnings?.grid_import) {
        hasWarning = source.powerWatts > this.config.warnings.grid_import;
      }

      this.nodeRenderer?.renderSourceNode(source, soc, capacity, undefined, hasWarning);
    }

    // Render consumption nodes
    for (const device of updatedConsumptionNodes) {
      if (device.isVisible && device.id !== 'total_load') {
        const isCategory = this.categoryNodes.has(device.id);
        const isCollapsed = this.collapsedCategories.has(device.id);

        if (isCategory) {
          this.nodeRenderer?.renderCategoryNode(device, isCollapsed);
        } else {
          this.nodeRenderer?.renderConsumptionNode(device);
        }
      }
    }
  }

  /**
   * Start periodic update timer
   */
  private startUpdateTimer(): void {
    const interval = this.config?.update_interval ?? 2000;

    this.updateTimer = window.setInterval(() => {
      if (this.sensorManager) {
        this.sensorManager.refresh();
      }
    }, interval);
  }

  /**
   * Handle hass property update
   */
  private handleHassUpdate(): void {
    if (!this.hass || !this.config) return;

    // Reinitialize sensor manager with new hass instance
    if (this.sensorManager) {
      this.sensorManager.unsubscribe();
    }
    this.initializeSensorManager();
  }

  /**
   * Reinitialize card (called when config changes)
   */
  private reinitialize(): void {
    this.cleanup();
    this.initializeSensorManager();
    this.startUpdateTimer();
  }

  /**
   * Handle refresh button click
   */
  private handleRefresh(): void {
    if (this.sensorManager) {
      this.sensorManager.refresh();
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }

    // Clear update timer
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }

    // Clear resize debounce timer
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = undefined;
    }

    // Remove canvas event listeners
    if (this.canvas) {
      if (this.canvasClickHandler) {
        this.canvas.removeEventListener('click', this.canvasClickHandler);
        this.canvasClickHandler = undefined;
      }
      if (this.canvasHoverHandler) {
        this.canvas.removeEventListener('mousemove', this.canvasHoverHandler);
        this.canvasHoverHandler = undefined;
      }
    }

    // Remove tooltip
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = undefined;
    }

    // Unsubscribe from sensors
    if (this.sensorManager) {
      this.sensorManager.unsubscribe();
    }

    // Clear particle system
    if (this.particleSystem) {
      this.particleSystem.clear();
    }

    // Stop layout engine
    if (this.layoutEngine) {
      this.layoutEngine.stop();
    }

    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  /**
   * Get dominant energy source color for hub display
   * @param flows Energy flow array
   * @returns Color hex string
   */
  private getDominantSourceColor(flows: EnergyFlow[]): string {
    // Find flows going to hub
    const hubFlows = flows.filter(f => f.to === 'hub');
    if (hubFlows.length === 0) return COLORS.HUB;

    // Find the highest power flow
    let maxPower = 0;
    let dominantColor: string = COLORS.HUB;

    for (const flow of hubFlows) {
      if (flow.powerWatts > maxPower) {
        maxPower = flow.powerWatts;
        dominantColor = flow.color;
      }
    }

    return dominantColor;
  }

  /**
   * Open Home Assistant entity dialog (more-info)
   * @param entityId Entity ID to show dialog for
   */
  private openEntityDialog(entityId: string): void {
    if (!this.hass || !entityId || entityId.startsWith('calculated.')) return;

    // Fire Home Assistant event to open more-info dialog
    const event = new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId }
    });
    this.dispatchEvent(event);
  }

  /**
   * Find entity at canvas position
   * @param x X coordinate
   * @param y Y coordinate
   * @returns Entity ID if found, null otherwise
   */
  private findEntityAtPosition(x: number, y: number): { entityId: string; name: string; power: number } | null {
    // Check source nodes
    for (const node of this.sourceNodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= node.radius) {
        return {
          entityId: node.entityId,
          name: node.type.charAt(0).toUpperCase() + node.type.slice(1),
          power: node.powerWatts
        };
      }
    }

    // Check hub node
    const hubX = (this.canvas?.width ?? 800) * LAYOUT.HUB_X;
    const hubY = (this.canvas?.height ?? 500) * LAYOUT.HUB_Y;
    const hubDx = x - hubX;
    const hubDy = y - hubY;
    if (Math.sqrt(hubDx * hubDx + hubDy * hubDy) <= NODE_SIZES.HUB_RADIUS) {
      return null; // Hub doesn't have an entity
    }

    // Check consumption nodes
    for (const node of this.consumptionNodes) {
      if (!node.isVisible) continue;
      const dx = x - node.x;
      const dy = y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= node.radius + 10) { // Slightly larger hitbox for rectangles
        return {
          entityId: node.entityId,
          name: node.name,
          power: node.powerWatts
        };
      }

      // Check children if category
      if (node.children) {
        for (const child of node.children) {
          if (!child.isVisible) continue;
          const cdx = x - child.x;
          const cdy = y - child.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist <= child.radius + 10) {
            return {
              entityId: child.entityId,
              name: child.name,
              power: child.powerWatts
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Show tooltip at position
   */
  private showTooltip(x: number, y: number, content: string): void {
    if (!this.tooltipElement) {
      this.tooltipElement = document.createElement('div');
      this.tooltipElement.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        z-index: 10000;
        max-width: 200px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
      `;
      document.body.appendChild(this.tooltipElement);
    }

    this.tooltipElement.innerHTML = content;
    this.tooltipElement.style.display = 'block';
    this.tooltipElement.style.left = `${x + 15}px`;
    this.tooltipElement.style.top = `${y + 15}px`;
  }

  /**
   * Hide tooltip
   */
  private hideTooltip(): void {
    if (this.tooltipElement) {
      this.tooltipElement.style.display = 'none';
    }
  }
}

// Conditionally register custom elements if not already registered (IIFE bundle compatibility)
if (!customElements.get('energy-flow-card')) {
  customElements.define('energy-flow-card', EnergyFlowCard);
}
// Note: energy-flow-card-editor is registered via @customElement decorator in config-editor.ts

// TypeScript type declaration
declare global {
  interface HTMLElementTagNameMap {
    'energy-flow-card': EnergyFlowCard;
  }
}

// Export for Home Assistant
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'custom:energy-flow-card',
  name: 'Energy Flow Card',
  description: 'Visualize real-time energy flow between sources and devices',
  preview: true,
  documentationURL: 'https://github.com/yourusername/energy-flow-card'
});

// Version logging with styling for easy identification
console.log(
  '%c⚡ Energy Flow Card %c' + VERSION + '%c loaded successfully',
  'color: #4caf50; font-weight: bold; font-size: 14px;',
  'color: #64b5f6; font-weight: bold; font-size: 14px; background: #1e3250; padding: 2px 8px; border-radius: 3px;',
  'color: #999; font-size: 12px;'
);
