/**
 * SourceFlowRenderer - Renders Sankey flows from sources to the energy bus
 * Handles bidirectional flows (import/export, charge/discharge)
 *
 * Flow scenarios handled:
 * - Solar -> Bus (powering home)
 * - Solar -> Battery (charging)
 * - Solar -> Grid (exporting)
 * - Grid -> Bus (importing)
 * - Battery -> Bus (discharging)
 * - Grid/Solar -> Battery (charging)
 */

import { EnergySourceNode } from './types';
import { EnergyFlow } from './utils/energy-flow-calculator';
import { formatPower, formatDisplay } from './utils/unit-formatter';
import { BusConfig } from './bus-renderer';

/**
 * Color scheme for energy sources
 */
const SOURCE_COLORS = {
  solar: '#ffa500',   // Orange
  battery: '#4caf50', // Green
  grid: '#f44336',    // Red
  hub: '#64b5f6',     // Blue
} as const;

/**
 * Connection point configuration for each source type on the bus
 * Values are percentages from top of bus (0 = top, 1 = bottom)
 */
const BUS_CONNECTION_POINTS: Record<string, number> = {
  solar: 0.2,    // Solar connects high on the bus
  grid: 0.5,     // Grid connects in the middle
  battery: 0.8,  // Battery connects low on the bus
};

export class SourceFlowRenderer {
  private ctx: CanvasRenderingContext2D;
  private animationTime: number = 0;

  // Flow scaling configuration
  private powerToWidthScale: number = 0.03;  // 1W = 0.03px width
  private minWidth: number = 3;               // Minimum flow width in pixels
  private maxWidth: number = 40;              // Maximum flow width in pixels

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
   * Convert power in watts to flow width in pixels
   * @param watts Power value in watts
   * @returns Width in pixels
   */
  private powerToWidth(watts: number): number {
    const absWatts = Math.abs(watts);
    const width = absWatts * this.powerToWidthScale;
    return Math.max(this.minWidth, Math.min(width, this.maxWidth));
  }

  /**
   * Format power value for display label
   * @param watts Power value in watts
   * @returns Formatted string (e.g., "1.5 kW" or "500 W")
   */
  private formatPowerLabel(watts: number): string {
    const formatted = formatPower(Math.abs(watts));
    return formatDisplay(formatted);
  }

  /**
   * Get the color for a flow based on source type
   * @param sourceType Type of energy source
   * @returns Hex color string
   */
  private getFlowColor(sourceType: string): string {
    return SOURCE_COLORS[sourceType as keyof typeof SOURCE_COLORS] || '#999999';
  }

  /**
   * Get the Y position on the bus for a given source type
   * @param sourceType Type of energy source
   * @param busConfig Bus configuration
   * @returns Y coordinate for connection point
   */
  private getBusConnectionY(sourceType: string, busConfig: BusConfig): number {
    const relativePosition = BUS_CONNECTION_POINTS[sourceType] ?? 0.5;
    return busConfig.y + (busConfig.height * (relativePosition - 0.5));
  }

  /**
   * Render all source flows to the bus and between sources
   * @param flows Array of energy flows
   * @param sourceNodes Array of source nodes (solar, battery, grid)
   * @param busConfig Configuration for the energy bus
   */
  public renderSourceFlows(
    flows: EnergyFlow[],
    sourceNodes: EnergySourceNode[],
    busConfig: BusConfig
  ): void {
    // Separate flows into bus flows and inter-source flows
    const busFlows = flows.filter(f => f.to === 'hub');
    const interSourceFlows = flows.filter(f => f.to !== 'hub');

    // Render inter-source flows first (behind bus flows)
    for (const flow of interSourceFlows) {
      if (flow.powerWatts >= 10) {
        this.renderInterSourceFlow(flow, sourceNodes);
      }
    }

    // Render flows to bus
    for (const flow of busFlows) {
      if (flow.powerWatts >= 10) {
        this.renderFlowToBus(flow, sourceNodes, busConfig);
      }
    }
  }

  /**
   * Render a flow from a source node to the energy bus
   * @param flow Energy flow data
   * @param sourceNodes Array of source nodes
   * @param busConfig Bus configuration
   */
  private renderFlowToBus(
    flow: EnergyFlow,
    sourceNodes: EnergySourceNode[],
    busConfig: BusConfig
  ): void {
    const sourceNode = sourceNodes.find(n => n.type === flow.from);
    if (!sourceNode) return;

    // Source position (center of node)
    const fromX = sourceNode.x;
    const fromY = sourceNode.y;

    // Destination position (left edge of bus at appropriate height)
    const toX = busConfig.x;
    const toY = this.getBusConnectionY(flow.from, busConfig);

    const width = this.powerToWidth(flow.powerWatts);
    const color = flow.color || this.getFlowColor(flow.from);
    const label = this.formatPowerLabel(flow.powerWatts);

    this.renderSankeyPath(fromX, fromY, toX, toY, width, color, label);
  }

  /**
   * Render a flow between two source nodes (e.g., solar charging battery)
   * @param flow Energy flow data
   * @param sourceNodes Array of source nodes
   */
  private renderInterSourceFlow(
    flow: EnergyFlow,
    sourceNodes: EnergySourceNode[]
  ): void {
    const fromNode = sourceNodes.find(n => n.type === flow.from);
    const toNode = sourceNodes.find(n => n.type === flow.to);

    if (!fromNode || !toNode) return;

    const width = this.powerToWidth(flow.powerWatts);
    const color = flow.color || this.getFlowColor(flow.from);
    const label = this.formatPowerLabel(flow.powerWatts);

    this.renderSankeyPath(
      fromNode.x,
      fromNode.y,
      toNode.x,
      toNode.y,
      width,
      color,
      label
    );
  }

  /**
   * Render a Sankey-style path between two points with bezier curves,
   * gradients, and glow effects
   * @param fromX Source X coordinate
   * @param fromY Source Y coordinate
   * @param toX Destination X coordinate
   * @param toY Destination Y coordinate
   * @param width Line width in pixels
   * @param color Base color for the flow
   * @param label Optional power label to display
   */
  private renderSankeyPath(
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

    // Calculate path direction
    const dx = toX - fromX;
    const dy = toY - fromY;

    // Calculate Bezier curve control points at 50% horizontal distance
    const cp1x = fromX + dx * 0.5;
    const cp1y = fromY;
    const cp2x = toX - dx * 0.5;
    const cp2y = toY;

    // Extract RGB values from hex color
    const rgb = this.hexToRgb(color);
    const r = rgb.r;
    const g = rgb.g;
    const b = rgb.b;

    // Create gradient from source (brighter) to destination (dimmer)
    const gradient = ctx.createLinearGradient(fromX, fromY, toX, toY);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);      // Source (brighter)
    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.7)`);    // Near source
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.6)`);    // Near destination
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.5)`);      // Destination (dimmer)

    // Draw glow/shadow effect (larger blur for wider flows)
    const glowSize = Math.min(width * 0.6, 20);
    ctx.shadowBlur = glowSize;
    ctx.shadowColor = color;

    // Draw the main curved path
    ctx.lineWidth = width;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
    ctx.stroke();

    // Draw a subtle inner highlight for depth
    if (width > 8) {
      ctx.shadowBlur = 0;
      const innerWidth = Math.max(width * 0.3, 2);
      const innerGradient = ctx.createLinearGradient(fromX, fromY, toX, toY);
      innerGradient.addColorStop(0, `rgba(255, 255, 255, 0.3)`);
      innerGradient.addColorStop(0.5, `rgba(255, 255, 255, 0.15)`);
      innerGradient.addColorStop(1, `rgba(255, 255, 255, 0.1)`);

      ctx.lineWidth = innerWidth;
      ctx.strokeStyle = innerGradient;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
      ctx.stroke();
    }

    // Draw label at midpoint of the path
    if (label && width >= 5) {
      // Calculate approximate midpoint of bezier curve
      const t = 0.5;
      const midX = this.bezierPoint(fromX, cp1x, cp2x, toX, t);
      const midY = this.bezierPoint(fromY, cp1y, cp2y, toY, t);

      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Offset label slightly above the path
      const labelOffsetY = -width / 2 - 8;
      ctx.fillText(label, midX, midY + labelOffsetY);
    }

    ctx.restore();
  }

  /**
   * Calculate a point on a cubic bezier curve
   * @param p0 Start point
   * @param p1 First control point
   * @param p2 Second control point
   * @param p3 End point
   * @param t Parameter (0-1)
   * @returns Point coordinate
   */
  private bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const mt = 1 - t;
    return mt * mt * mt * p0 +
           3 * mt * mt * t * p1 +
           3 * mt * t * t * p2 +
           t * t * t * p3;
  }

  /**
   * Convert hex color to RGB values
   * @param hex Hex color string (e.g., "#ffa500")
   * @returns Object with r, g, b values
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Handle rgba format
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
      const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10)
        };
      }
    }

    // Handle hex format
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);

    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      };
    }

    // Default fallback
    return { r: 150, g: 150, b: 150 };
  }

  /**
   * Set the power-to-width scaling factor
   * @param scale Pixels per watt
   */
  public setPowerScale(scale: number): void {
    this.powerToWidthScale = scale;
  }

  /**
   * Set the minimum flow width
   * @param minWidth Minimum width in pixels
   */
  public setMinWidth(minWidth: number): void {
    this.minWidth = minWidth;
  }

  /**
   * Set the maximum flow width
   * @param maxWidth Maximum width in pixels
   */
  public setMaxWidth(maxWidth: number): void {
    this.maxWidth = maxWidth;
  }

  /**
   * Get current animation time (for external animation sync)
   * @returns Animation time in seconds
   */
  public getAnimationTime(): number {
    return this.animationTime;
  }
}
