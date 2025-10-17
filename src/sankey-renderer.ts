/**
 * SankeyRenderer - Renders thick flow paths representing power magnitude
 */

import { EnergySourceNode, ConsumptionDeviceNode } from './types';
import { EnergyFlow } from './utils/energy-flow-calculator';

export interface SankeyPath {
  from: { x: number; y: number };
  to: { x: number; y: number };
  width: number;
  color: string;
  label: string;
}

export class SankeyRenderer {
  private ctx: CanvasRenderingContext2D;
  private powerToWidthScale: number = 0.05;  // 1W = 0.05px width
  private maxWidth: number = 100;  // Maximum flow width in pixels

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Calculate flow width based on power
   */
  private powerToWidth(watts: number): number {
    return Math.min(Math.abs(watts) * this.powerToWidthScale, this.maxWidth);
  }

  /**
   * Draw a Sankey flow path between two points
   */
  public renderFlow(path: SankeyPath): void {
    const ctx = this.ctx;
    ctx.save();

    // Create gradient for flow
    const gradient = ctx.createLinearGradient(
      path.from.x, path.from.y,
      path.to.x, path.to.y
    );

    // Parse color and create gradient
    const colorWithAlpha = path.color.includes('rgba')
      ? path.color
      : path.color.replace('rgb', 'rgba').replace(')', ', 0.6)');

    gradient.addColorStop(0, colorWithAlpha);
    gradient.addColorStop(1, colorWithAlpha.replace(/[\d.]+\)$/, '0.3)'));

    // Calculate Bezier curve control points
    const dx = path.to.x - path.from.x;
    const dy = path.to.y - path.from.y;
    const cp1x = path.from.x + dx * 0.5;
    const cp1y = path.from.y;
    const cp2x = path.to.x - dx * 0.5;
    const cp2y = path.to.y;

    // Draw thick curved path
    ctx.lineWidth = path.width;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 20;
    ctx.shadowColor = path.color;

    ctx.beginPath();
    ctx.moveTo(path.from.x, path.from.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, path.to.x, path.to.y);
    ctx.stroke();

    // Draw label at midpoint
    if (path.label && path.width > 5) {
      const midX = (path.from.x + path.to.x) / 2;
      const midY = (path.from.y + path.to.y) / 2;

      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(path.label, midX, midY - 10);
    }

    ctx.restore();
  }

  /**
   * Render Sankey flows for energy flows between sources
   */
  public renderEnergyFlows(
    flows: EnergyFlow[],
    sourceNodes: EnergySourceNode[],
    hubX: number,
    hubY: number
  ): void {
    for (const flow of flows) {
      const fromNode = sourceNodes.find(n => n.type === flow.from);

      if (!fromNode || flow.powerWatts < 10) continue;

      let toX: number, toY: number;

      if (flow.to === 'hub') {
        toX = hubX;
        toY = hubY;
      } else {
        const toNode = sourceNodes.find(n => n.type === flow.to);
        if (!toNode) continue;
        toX = toNode.x;
        toY = toNode.y;
      }

      const path: SankeyPath = {
        from: { x: fromNode.x, y: fromNode.y },
        to: { x: toX, y: toY },
        width: this.powerToWidth(flow.powerWatts),
        color: flow.color,
        label: Math.round(flow.powerWatts) + 'W'
      };

      this.renderFlow(path);
    }
  }

  /**
   * Render Sankey flows from hub to devices
   * NOTE: Only renders flows to top-level nodes (categories or standalone devices)
   * Children of categories are handled separately if expanded
   */
  public renderDeviceFlows(
    devices: ConsumptionDeviceNode[],
    hubX: number,
    hubY: number,
    categoryNodes: Map<string, ConsumptionDeviceNode> = new Map(),
    collapsedCategories: Set<string> = new Set(),
    color: string = '#64b5f6'
  ): void {
    for (const device of devices) {
      if (!device.isVisible || device.powerWatts < 10 || device.id === 'total_load') {
        continue;
      }

      const isCategory = categoryNodes.has(device.id);
      const isCollapsed = collapsedCategories.has(device.id);

      // Draw flow from hub to category/device
      const path: SankeyPath = {
        from: { x: hubX, y: hubY },
        to: { x: device.x, y: device.y },
        width: this.powerToWidth(device.powerWatts),
        color: 'rgba(100, 181, 246, 0.4)',
        label: Math.round(device.powerWatts) + 'W'
      };

      this.renderFlow(path);

      // If category is expanded, draw flows to children
      if (isCategory && !isCollapsed && device.children) {
        for (const child of device.children) {
          if (child.isVisible && child.powerWatts > 10) {
            const childPath: SankeyPath = {
              from: { x: device.x, y: device.y },
              to: { x: child.x, y: child.y },
              width: this.powerToWidth(child.powerWatts),
              color: 'rgba(100, 181, 246, 0.3)',
              label: Math.round(child.powerWatts) + 'W'
            };
            this.renderFlow(childPath);
          }
        }
      }
    }
  }

  /**
   * Set the power-to-width scaling factor
   */
  public setPowerScale(scale: number): void {
    this.powerToWidthScale = scale;
  }

  /**
   * Set maximum flow width
   */
  public setMaxWidth(maxWidth: number): void {
    this.maxWidth = maxWidth;
  }
}
