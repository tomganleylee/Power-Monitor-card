/**
 * TrunkSankeyRenderer - Renders trunk-based Sankey flows to consumers
 * Prevents line overlap by using a central distribution trunk
 *
 * Instead of direct lines from hub to each device (which overlap), this renderer:
 * 1. Draws a single vertical "trunk" line from the hub
 * 2. Horizontal branches split off at different Y positions to each consumer
 * 3. Categories can have sub-trunks for their children
 */

import { ConsumptionDeviceNode } from './types';

export interface TrunkConfig {
  startX: number;      // X position where trunk starts (right of bus)
  startY: number;      // Y position (center of bus)
  trunkX: number;      // X position of vertical trunk line
}

export interface TrunkBranch {
  device: ConsumptionDeviceNode;
  branchY: number;     // Y position where branch splits from trunk
  width: number;       // Line width based on power
}

export class TrunkSankeyRenderer {
  private ctx: CanvasRenderingContext2D;
  private animationTime: number = 0;

  // Power to width scaling configuration
  private powerToWidthScale: number = 0.02;  // 1W = 0.02px width
  private minWidth: number = 2;              // Minimum flow width
  private maxWidth: number = 30;             // Maximum flow width

  // Colors
  private readonly TRUNK_COLOR = 'rgba(100, 181, 246, 0.6)';
  private readonly BRANCH_COLOR = 'rgba(100, 181, 246, 0.5)';
  private readonly CHILD_BRANCH_COLOR = 'rgba(100, 181, 246, 0.4)';

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Update animation time (call this each frame)
   * @param deltaTime Time since last frame in seconds
   */
  public updateAnimation(deltaTime: number): void {
    this.animationTime += deltaTime;
  }

  /**
   * Calculate flow width based on power consumption
   * @param watts Power in watts
   * @returns Width in pixels
   */
  private powerToWidth(watts: number): number {
    const width = Math.abs(watts) * this.powerToWidthScale;
    return Math.max(this.minWidth, Math.min(width, this.maxWidth));
  }

  /**
   * Render the main trunk line from hub to distribution point
   * @param config Trunk configuration (startX, startY, trunkX)
   * @param totalPower Total power flowing through the trunk
   */
  public renderMainTrunk(config: TrunkConfig, totalPower: number): void {
    const ctx = this.ctx;
    ctx.save();

    const width = this.powerToWidth(totalPower);

    // Create gradient from hub (brighter) to trunk (slightly dimmer)
    const gradient = ctx.createLinearGradient(
      config.startX, config.startY,
      config.trunkX, config.startY
    );
    gradient.addColorStop(0, 'rgba(100, 181, 246, 0.7)');
    gradient.addColorStop(1, 'rgba(100, 181, 246, 0.6)');

    // Draw horizontal segment from hub to trunk position
    ctx.lineWidth = width;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(100, 181, 246, 0.5)';

    ctx.beginPath();
    ctx.moveTo(config.startX, config.startY);
    ctx.lineTo(config.trunkX, config.startY);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render all consumer branches from the trunk
   * @param config Trunk configuration
   * @param devices All consumption device nodes
   * @param categoryNodes Map of category ID to category node
   * @param collapsedCategories Set of collapsed category IDs
   */
  public renderConsumerBranches(
    config: TrunkConfig,
    devices: ConsumptionDeviceNode[],
    categoryNodes: Map<string, ConsumptionDeviceNode> = new Map(),
    collapsedCategories: Set<string> = new Set()
  ): void {
    // Filter visible devices with power
    const visibleDevices = devices.filter(d =>
      d.isVisible && d.powerWatts >= 10 && d.id !== 'total_load'
    );

    if (visibleDevices.length === 0) return;

    // Sort devices by Y position for consistent trunk rendering
    const sortedDevices = [...visibleDevices].sort((a, b) => a.y - b.y);

    // Calculate trunk Y extent
    const minY = Math.min(...sortedDevices.map(d => d.y));
    const maxY = Math.max(...sortedDevices.map(d => d.y));

    // Render vertical trunk segment
    this.renderVerticalTrunk(config.trunkX, minY, maxY, sortedDevices);

    // Render branches to each device
    for (const device of sortedDevices) {
      const isCategory = categoryNodes.has(device.id);
      const isCollapsed = collapsedCategories.has(device.id);

      // Render branch from trunk to device
      this.renderBranch(
        config.trunkX,
        device.y,
        device.x,
        device.y,
        this.powerToWidth(device.powerWatts),
        this.BRANCH_COLOR,
        `${Math.round(device.powerWatts)}W`
      );

      // If category is expanded, render children branches
      if (isCategory && !isCollapsed && device.children) {
        this.renderCategoryChildren(device, config.trunkX);
      }
    }
  }

  /**
   * Render the vertical trunk segment
   * @param trunkX X position of trunk
   * @param minY Top Y position
   * @param maxY Bottom Y position
   * @param devices Devices to calculate cumulative power
   */
  private renderVerticalTrunk(
    trunkX: number,
    minY: number,
    maxY: number,
    devices: ConsumptionDeviceNode[]
  ): void {
    const ctx = this.ctx;
    ctx.save();

    // Calculate total power at each segment for variable width
    // For simplicity, use average power for the trunk
    const totalPower = devices.reduce((sum, d) => sum + d.powerWatts, 0);
    const avgWidth = this.powerToWidth(totalPower / Math.max(devices.length, 1));

    // Create vertical gradient (brighter at center, dimmer at edges)
    const gradient = ctx.createLinearGradient(trunkX, minY, trunkX, maxY);
    gradient.addColorStop(0, 'rgba(100, 181, 246, 0.5)');
    gradient.addColorStop(0.5, 'rgba(100, 181, 246, 0.6)');
    gradient.addColorStop(1, 'rgba(100, 181, 246, 0.5)');

    // Draw vertical trunk line
    ctx.lineWidth = avgWidth;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(100, 181, 246, 0.4)';

    ctx.beginPath();
    ctx.moveTo(trunkX, minY);
    ctx.lineTo(trunkX, maxY);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render a branch from trunk to device with smooth bezier curve
   * @param fromX Source X (trunk position)
   * @param fromY Source Y (branch point)
   * @param toX Target X (device position)
   * @param toY Target Y (device position)
   * @param width Line width
   * @param color Line color
   * @param label Optional power label
   */
  private renderBranch(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    width: number,
    color: string,
    label?: string
  ): void {
    const ctx = this.ctx;
    ctx.save();

    const dx = toX - fromX;

    // Create gradient from trunk (brighter) to device (dimmer)
    const gradient = ctx.createLinearGradient(fromX, fromY, toX, toY);

    // Parse color for gradient manipulation
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    const r = rgbaMatch ? parseInt(rgbaMatch[1]) : 100;
    const g = rgbaMatch ? parseInt(rgbaMatch[2]) : 181;
    const b = rgbaMatch ? parseInt(rgbaMatch[3]) : 246;

    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.7)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.6)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.4)`);

    // Calculate bezier control points for smooth horizontal-to-target curve
    // First segment is horizontal, then curves toward target
    const curveStart = Math.min(dx * 0.6, 60); // How far horizontal before curving

    const cp1x = fromX + curveStart;
    const cp1y = fromY;
    const cp2x = fromX + dx * 0.7;
    const cp2y = toY;

    // Draw the curved branch with glow
    ctx.lineWidth = width;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10 + width * 0.3;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
    ctx.stroke();

    // Draw junction point at trunk (small glow circle)
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
    ctx.beginPath();
    ctx.arc(fromX, fromY, width * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Draw power label at midpoint of curve
    if (label && width > 3) {
      // Calculate approximate midpoint of bezier curve
      const t = 0.5;
      const midX = Math.pow(1-t, 3) * fromX +
                   3 * Math.pow(1-t, 2) * t * cp1x +
                   3 * (1-t) * Math.pow(t, 2) * cp2x +
                   Math.pow(t, 3) * toX;
      const midY = Math.pow(1-t, 3) * fromY +
                   3 * Math.pow(1-t, 2) * t * cp1y +
                   3 * (1-t) * Math.pow(t, 2) * cp2y +
                   Math.pow(t, 3) * toY;

      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, midX, midY - width / 2 - 4);
    }

    ctx.restore();
  }

  /**
   * Render sub-branches from an expanded category to its children
   * Creates a mini-trunk from the category node to its child devices
   * @param category Category node with children
   * @param mainTrunkX X position of main trunk (for reference)
   */
  private renderCategoryChildren(
    category: ConsumptionDeviceNode,
    mainTrunkX: number
  ): void {
    if (!category.children || category.children.length === 0) return;

    const ctx = this.ctx;

    // Filter visible children with power
    const visibleChildren = category.children.filter(c =>
      c.isVisible && c.powerWatts >= 10
    );

    if (visibleChildren.length === 0) return;

    // Sort children by Y position
    const sortedChildren = [...visibleChildren].sort((a, b) => a.y - b.y);

    // Calculate sub-trunk position (to the right of category node)
    const subTrunkX = category.x + category.radius * 1.5;
    const minChildY = Math.min(...sortedChildren.map(c => c.y));
    const maxChildY = Math.max(...sortedChildren.map(c => c.y));

    // Draw horizontal line from category to sub-trunk
    const categoryTotalPower = sortedChildren.reduce((sum, c) => sum + c.powerWatts, 0);
    const subTrunkWidth = this.powerToWidth(categoryTotalPower);

    ctx.save();

    // Horizontal segment from category to sub-trunk
    ctx.lineWidth = subTrunkWidth;
    ctx.strokeStyle = this.CHILD_BRANCH_COLOR;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(100, 181, 246, 0.3)';

    ctx.beginPath();
    ctx.moveTo(category.x + category.radius, category.y);
    ctx.lineTo(subTrunkX, category.y);
    ctx.stroke();

    // Vertical sub-trunk
    const subTrunkMinY = Math.min(category.y, minChildY);
    const subTrunkMaxY = Math.max(category.y, maxChildY);

    ctx.beginPath();
    ctx.moveTo(subTrunkX, subTrunkMinY);
    ctx.lineTo(subTrunkX, subTrunkMaxY);
    ctx.stroke();

    ctx.restore();

    // Draw branches to each child
    for (const child of sortedChildren) {
      this.renderBranch(
        subTrunkX,
        child.y,
        child.x,
        child.y,
        this.powerToWidth(child.powerWatts),
        this.CHILD_BRANCH_COLOR,
        `${Math.round(child.powerWatts)}W`
      );
    }
  }

  /**
   * Render the complete trunk system in one call
   * Convenience method that combines main trunk and all branches
   * @param config Trunk configuration
   * @param devices All consumption device nodes
   * @param categoryNodes Map of category ID to category node
   * @param collapsedCategories Set of collapsed category IDs
   * @param totalPower Total power consumption
   */
  public render(
    config: TrunkConfig,
    devices: ConsumptionDeviceNode[],
    categoryNodes: Map<string, ConsumptionDeviceNode> = new Map(),
    collapsedCategories: Set<string> = new Set(),
    totalPower?: number
  ): void {
    // Calculate total power if not provided
    const power = totalPower ?? devices
      .filter(d => d.isVisible && d.id !== 'total_load')
      .reduce((sum, d) => sum + d.powerWatts, 0);

    if (power < 10) return;

    // Render main trunk from hub
    this.renderMainTrunk(config, power);

    // Render all consumer branches
    this.renderConsumerBranches(config, devices, categoryNodes, collapsedCategories);
  }

  /**
   * Set the power-to-width scaling factor
   * @param scale Pixels per watt
   */
  public setPowerScale(scale: number): void {
    this.powerToWidthScale = scale;
  }

  /**
   * Set minimum flow width
   * @param minWidth Minimum width in pixels
   */
  public setMinWidth(minWidth: number): void {
    this.minWidth = minWidth;
  }

  /**
   * Set maximum flow width
   * @param maxWidth Maximum width in pixels
   */
  public setMaxWidth(maxWidth: number): void {
    this.maxWidth = maxWidth;
  }

  /**
   * Get current animation time (for synchronized effects)
   */
  public getAnimationTime(): number {
    return this.animationTime;
  }
}
