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
  ConsumptionDeviceNode
} from './types';
import { SensorManager } from './sensor-manager';
import { ParticleSystem } from './particle-system';
import { LayoutEngine } from './layout-engine';
import { NodeRenderer } from './node-renderer';
import { SankeyRenderer } from './sankey-renderer';
import { getBatteryFlowDirection, getGridFlowDirection, calculateBatteryTimeRemaining, formatTimeRemaining } from './utils/power-calculations';
import { calculateEnergyFlows } from './utils/energy-flow-calculator';
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
  private animationFrameId?: number;
  private resizeObserver?: ResizeObserver;
  private updateTimer?: number;
  private lastFrameTime: number = 0;

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
      update_interval: config.update_interval ?? 2000,
      show_statistics: config.show_statistics ?? true,
      visualization_mode: config.visualization_mode ?? 'particles',
      min_height: config.min_height ?? 400,
      max_height: config.max_height ?? 800
    };

    this.isLoading = false;
  }

  /**
   * Get card size for Lovelace layout
   * @returns Card height in units (1 unit = ~50px)
   */
  public getCardSize(): number {
    const minHeight = this.config?.min_height ?? 400;
    return Math.ceil(minHeight / 50);
  }

  /**
   * Get config editor element for Home Assistant UI
   * Required for visual editor in card picker
   */
  public static getConfigElement() {
    return document.createElement('energy-flow-card-editor');
  }

  /**
   * Get config form schema for Home Assistant UI
   * Using getConfigForm() instead of getConfigElement() for simpler, more reliable config UI
   */
  public static getConfigForm() {
    return {
      schema: [
        { name: '', type: 'grid', schema: [
          { name: 'entities.solar', label: 'Solar Power Entity', selector: { entity: { domain: 'sensor' } } },
          { name: 'entities.battery', label: 'Battery Power Entity', selector: { entity: { domain: 'sensor' } } },
          { name: 'entities.battery_soc', label: 'Battery SOC Entity', selector: { entity: { domain: 'sensor' } } },
          { name: 'entities.battery_capacity', label: 'Battery Capacity (kWh)', selector: { number: { min: 0, step: 0.1, mode: 'box' } } },
          { name: 'entities.grid', label: 'Grid Power Entity', selector: { entity: { domain: 'sensor' } } },
        ]},
        { name: '', type: 'grid', schema: [
          { name: 'visualization_mode', label: 'Visualization Mode', selector: { select: { options: [
            { value: 'particles', label: 'Animated Particles' },
            { value: 'sankey', label: 'Sankey Flow Lines' },
            { value: 'both', label: 'Both' }
          ]}}},
          { name: 'show_statistics', label: 'Show Statistics', selector: { boolean: {} } },
          { name: 'update_interval', label: 'Update Interval (ms)', selector: { number: { min: 500, max: 10000, step: 500, mode: 'box' } } },
        ]},
        { name: '', type: 'grid', schema: [
          { name: 'warnings.battery_low', label: 'Battery Low Warning (%)', selector: { number: { min: 0, max: 100, step: 5, mode: 'box' } } },
          { name: 'warnings.grid_import', label: 'High Grid Import Warning (W)', selector: { number: { min: 0, max: 10000, step: 100, mode: 'box' } } },
        ]}
      ]
    };
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

    const minHeight = this.config.min_height ?? 400;
    const maxHeight = this.config.max_height ?? 800;

    return html`
      <div class="card-content">
        <div class="canvas-container" style="min-height: ${minHeight}px; max-height: ${maxHeight}px;">
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

    // Calculate positions: Solar top, Grid left, Battery bottom
    const canvasHeight = this.canvas?.height ?? 500;
    const canvasWidth = this.canvas?.width ?? 800;

    // Solar node - TOP
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
        x: canvasWidth * 0.22,  // 22% from left
        y: canvasHeight * 0.20,  // Top (20% from top)
        radius: 50  // Large
      });
    }

    // Grid node - LEFT
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
        x: canvasWidth * 0.15,  // 15% from left (farthest left)
        y: canvasHeight * 0.55,  // Middle
        radius: 45  // Medium
      });
    }

    // Battery node - BOTTOM
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
        x: canvasWidth * 0.22,  // 22% from left
        y: canvasHeight * 0.80,  // Bottom (80% from top)
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

    // Calculate positions in zigzag pattern
    this.positionConsumptionNodes(nodes);

    return nodes;
  }

  /**
   * Position consumption nodes in zigzag pattern
   */
  private positionConsumptionNodes(nodes: ConsumptionDeviceNode[]): void {
    const canvasWidth = this.canvas?.width ?? 800;

    // Zigzag layout: alternate between right and far-right positions
    const rightX = canvasWidth * 0.75;  // Closer position (75% from left)
    const farRightX = canvasWidth * 0.90;  // Farther position (90% from left)
    const categorySpacing = 100;  // Spacing for category nodes
    const childSpacing = 70;  // Tighter spacing for child nodes
    const childIndent = canvasWidth * 0.05;  // Indent child nodes
    const startY = 60;  // Start from top with margin

    let currentY = startY;
    let visibleIndex = 0;

    for (const node of nodes) {
      if (!node.isVisible) continue;

      const isCategory = this.categoryNodes.has(node.id);
      const isCollapsed = this.collapsedCategories.has(node.id);

      if (isCategory) {
        // Category nodes - always visible
        node.x = (visibleIndex % 2 === 0) ? rightX : farRightX;
        node.y = currentY;
        currentY += categorySpacing;
        visibleIndex++;

        // Show children if expanded
        if (!isCollapsed && node.children) {
          for (const child of node.children) {
            if (child.isVisible) {
              child.x = ((visibleIndex % 2 === 0) ? rightX : farRightX) - childIndent;
              child.y = currentY;
              currentY += childSpacing;
              visibleIndex++;
            }
          }

          // Show remainder if exists
          if (node.calculatedRemainder && node.calculatedRemainder > 10) {
            // Remainder is displayed as part of category rendering
            currentY += childSpacing;
            visibleIndex++;
          }
        }
      } else {
        // Standalone device (not in category)
        node.x = (visibleIndex % 2 === 0) ? rightX : farRightX;
        node.y = currentY;
        currentY += categorySpacing;
        visibleIndex++;
      }
    }
  }

  /**
   * Handle canvas click event for category toggling
   */
  private handleCanvasClick(event: MouseEvent): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is on any category node
    for (const [categoryId, categoryNode] of this.categoryNodes) {
      const dx = x - categoryNode.x;
      const dy = y - categoryNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= categoryNode.radius) {
        this.handleCategoryClick(categoryId);
        break;
      }
    }
  }

  /**
   * Handle canvas hover for cursor changes
   */
  private handleCanvasHover(event: MouseEvent): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if hovering over any category node
    let isOverCategory = false;
    for (const categoryNode of this.categoryNodes.values()) {
      const dx = x - categoryNode.x;
      const dy = y - categoryNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= categoryNode.radius) {
        isOverCategory = true;
        break;
      }
    }

    // Update cursor
    this.canvas.style.cursor = isOverCategory ? 'pointer' : 'default';
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

    const container = this.canvas.parentElement;
    if (!container) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Initialize rendering systems
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      this.nodeRenderer = new NodeRenderer(ctx);
      this.sankeyRenderer = new SankeyRenderer(ctx);
      this.particleSystem = new ParticleSystem(500); // Increased from 200 to 500
      this.layoutEngine = new LayoutEngine(this.canvas.width, this.canvas.height);

      // Initialize node states
      this.updateNodeStates();
    }

    // Setup resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(container);

    // Setup click handler for category toggling
    this.canvas.addEventListener('click', (event) => {
      this.handleCanvasClick(event);
    });

    // Add hover cursor for interactive nodes
    this.canvas.addEventListener('mousemove', (event) => {
      this.handleCanvasHover(event);
    });
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

    // Get hub position
    const hubX = this.canvas.width / 2;
    const hubY = this.canvas.height / 2;

    // Calculate energy flows first (needed for all visualization modes)
    const solarNode = this.sourceNodes.find(n => n.type === 'solar');
    const batteryNode = this.sourceNodes.find(n => n.type === 'battery');
    const gridNode = this.sourceNodes.find(n => n.type === 'grid');
    const totalLoadNode = this.consumptionNodes.find(n => n.id === 'total_load');

    const energyFlows = calculateEnergyFlows({
      solar: solarNode?.powerWatts ?? 0,
      battery: batteryNode?.powerWatts ?? 0,
      grid: gridNode?.powerWatts ?? 0,
      totalLoad: totalLoadNode?.powerWatts ?? 0
    });

    const vizMode = this.config.visualization_mode ?? 'particles';

    // Render Sankey flows (for 'sankey' or 'both' modes)
    if (vizMode === 'sankey' || vizMode === 'both') {
      if (this.sankeyRenderer) {
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
      // Create hub node for particle spawning
      const hubNode: any = {
        type: 'hub',
        entityId: 'hub',
        x: hubX,
        y: hubY,
        radius: 30
      };

      // Spawn particles for energy flows between sources and to hub
      for (const flow of energyFlows) {
        const fromNode = this.sourceNodes.find(n => n.type === flow.from);
        const toNode = flow.to === 'hub' ? hubNode : this.sourceNodes.find(n => n.type === flow.to);

        if (fromNode && toNode && flow.powerWatts > 10) {
          // Add color to hub node based on flow
          hubNode.color = flow.color;

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
        if (!device.isVisible || device.powerWatts <= 10 || device.id === 'total_load') {
          continue;
        }

        const isCategory = this.categoryNodes.has(device.id);
        const isCollapsed = this.collapsedCategories.has(device.id);

        // Color based on dominant source
        const dominantFlow = energyFlows.find(f => f.to === 'hub');
        hubNode.color = dominantFlow?.color ?? '#64b5f6';

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

    // Render hub node
    this.nodeRenderer.renderHubNode(hubX, hubY, 30);

    // Render source nodes
    const batterySOC = this.config.entities?.battery_soc
      ? this.sensorManager?.getPercentageValue(this.config.entities.battery_soc)
      : undefined;

    const batteryCapacity = this.config.entities?.battery_capacity
      ? this.sensorManager?.getPowerValue(this.config.entities.battery_capacity)
      : undefined;

    const batteryPower = batteryNode?.powerWatts ?? 0;

    // Calculate battery time remaining
    let batteryTimeRemainingStr: string | undefined = undefined;
    if (batterySOC !== undefined && batteryCapacity) {
      const timeMinutes = calculateBatteryTimeRemaining(batterySOC, batteryCapacity, batteryPower);
      if (timeMinutes !== null) {
        const timeStr = formatTimeRemaining(timeMinutes);
        const direction = batteryPower > 10 ? 'empty' : 'full';
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

            // Render remainder node if exists
            if (device.calculatedRemainder && device.calculatedRemainder > 10) {
              const childIndent = this.canvas.width * 0.05;
              this.nodeRenderer.renderRemainderNode(
                device.x - childIndent,
                device.children[device.children.length - 1]?.y + 70 || device.y + 70,
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
}

// Conditionally register custom elements if not already registered (IIFE bundle compatibility)
if (!customElements.get('energy-flow-card')) {
  customElements.define('energy-flow-card', EnergyFlowCard);
}
if (!customElements.get('energy-flow-card-editor')) {
  // Placeholder - actual editor is defined in config-editor.ts
  customElements.define('energy-flow-card-editor', class extends HTMLElement {});
}

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

console.log('Energy Flow Card v1.0.0 loaded successfully');
