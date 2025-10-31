/**
 * NodeRenderer - Renders energy source and consumption nodes to canvas
 */

import {
  EnergySourceNode,
  ConsumptionDeviceNode
} from './types';
import { formatPower, formatPercentage, formatDisplay } from './utils/unit-formatter';

export class NodeRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Render an energy source node (solar, battery, grid)
   * @param node Source node to render
   * @param batterySOC Battery state of charge (0-100) if applicable
   * @param batteryCapacity Battery capacity in kWh if applicable
   * @param batteryTimeRemaining Time to empty/full in formatted string if applicable
   * @param hasWarning Whether node has an active warning (adds pulsing effect)
   */
  public renderSourceNode(node: EnergySourceNode, batterySOC?: number, batteryCapacity?: number, batteryTimeRemaining?: string, hasWarning?: boolean): void {
    const ctx = this.ctx;

    ctx.save();

    // Warning pulsing ring (if has warning)
    if (hasWarning) {
      const pulsePhase = (Date.now() % 1500) / 1500; // 1.5 second pulse
      const pulseOpacity = 0.3 + Math.sin(pulsePhase * Math.PI * 2) * 0.2;
      const pulseRadius = node.radius + 12 + Math.sin(pulsePhase * Math.PI * 2) * 4;

      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ff0000';
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.globalAlpha = pulseOpacity;
      ctx.beginPath();
      ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // Draw glowing outer ring effect
    if (node.isActive) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = node.color;
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // Draw node circle with dark fill
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

    // Dark fill with slight transparency
    ctx.fillStyle = 'rgba(15, 25, 40, 0.85)';
    ctx.fill();

    // Draw neon border with glow
    if (node.isActive) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = node.color;
    }
    ctx.strokeStyle = node.isActive ? node.color : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    if (node.isStale) {
      ctx.setLineDash([8, 4]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Draw icon with glow at top of circle
    ctx.shadowBlur = 8;
    ctx.shadowColor = node.isActive ? node.color : 'rgba(255, 255, 255, 0.5)';
    ctx.fillStyle = '#ffffff';
    ctx.font = `${node.radius * 0.7}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.icon, node.x, node.y - node.radius * 0.2);
    ctx.shadowBlur = 0;

    // Draw power label INSIDE circle below icon (except for battery)
    const formattedPower = formatPower(Math.abs(node.powerWatts));
    const powerText = formatDisplay(formattedPower);

    if (node.type !== 'battery') {
      // For non-battery nodes, show power inside the circle
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.fillStyle = node.isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(powerText, node.x, node.y + node.radius * 0.25);
      ctx.shadowBlur = 0;
    } else {
      // For battery, keep power below (need space for battery indicator)
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.fillStyle = node.isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(powerText, node.x, node.y + node.radius + 12);
      ctx.shadowBlur = 0;
    }

    // Draw battery charge indicator if applicable
    if (node.type === 'battery' && batterySOC !== undefined) {
      this.renderBatteryIndicator(node, batterySOC, batteryCapacity, batteryTimeRemaining);
    }

    // Draw type label above node
    const typeLabel = this.getTypeLabel(node.type);
    ctx.font = '13px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(typeLabel, node.x, node.y - node.radius - 10);

    // Draw stale indicator
    if (node.isStale) {
      this.renderStaleIndicator(node.x, node.y - node.radius - 5);
    }

    ctx.restore();
  }

  /**
   * Render a consumption device node (as rectangle)
   * @param node Device node to render
   */
  public renderConsumptionNode(node: ConsumptionDeviceNode): void {
    const ctx = this.ctx;

    ctx.save();

    const isActive = node.powerWatts > 0;
    const color = this.getDeviceColor(node.powerWatts);

    // Rectangle dimensions based on radius
    const width = node.radius * 2;
    const height = node.radius * 1.6;
    const x = node.x - width / 2;
    const y = node.y - height / 2;
    const cornerRadius = 8;

    // Draw glowing outer rectangle effect for active devices
    if (isActive) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      this.roundRect(x - 6, y - 6, width + 12, height + 12, cornerRadius + 3);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // Draw node rectangle with dark fill
    this.roundRect(x, y, width, height, cornerRadius);

    // Dark fill
    ctx.fillStyle = 'rgba(15, 25, 40, 0.85)';
    ctx.fill();

    // Draw neon border with glow
    if (isActive) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
    }
    ctx.strokeStyle = isActive ? color : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    if (node.isStale) {
      ctx.setLineDash([6, 3]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Draw icon with glow at top of rectangle
    ctx.shadowBlur = 6;
    ctx.shadowColor = isActive ? color : 'rgba(255, 255, 255, 0.3)';
    ctx.fillStyle = '#ffffff';
    ctx.font = `${node.radius * 0.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.icon, node.x, node.y - height * 0.15);
    ctx.shadowBlur = 0;

    // Draw power label INSIDE rectangle below icon
    const formattedPower = formatPower(node.powerWatts);
    const powerText = formatDisplay(formattedPower);

    ctx.shadowBlur = 3;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(powerText, node.x, node.y + height * 0.2);
    ctx.shadowBlur = 0;

    // Draw device name above node
    ctx.font = '12px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(node.name, node.x, y - 8);

    // Draw stale indicator
    if (node.isStale) {
      this.renderStaleIndicator(node.x, y - 5);
    }

    ctx.restore();
  }

  /**
   * Helper method to draw rounded rectangle
   */
  private roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Render a category node (collapsible group) as rectangle
   * @param node Category node to render
   * @param isCollapsed Whether the category is collapsed
   */
  public renderCategoryNode(node: ConsumptionDeviceNode, isCollapsed: boolean): void {
    const ctx = this.ctx;

    ctx.save();

    const isActive = node.powerWatts > 0;
    const color = this.getDeviceColor(node.powerWatts);

    // Rectangle dimensions - slightly larger than regular devices
    const width = node.radius * 2.2;
    const height = node.radius * 1.8;
    const x = node.x - width / 2;
    const y = node.y - height / 2;
    const cornerRadius = 10;

    // Draw glowing outer rectangle effect for active categories
    if (isActive) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.25;
      this.roundRect(x - 8, y - 8, width + 16, height + 16, cornerRadius + 4);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // Draw node rectangle with dark fill
    this.roundRect(x, y, width, height, cornerRadius);

    // Slightly lighter fill for categories
    ctx.fillStyle = 'rgba(20, 35, 55, 0.9)';
    ctx.fill();

    // Draw neon border with glow (slightly thicker for categories)
    if (isActive) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
    }
    ctx.strokeStyle = isActive ? color : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    if (node.isStale) {
      ctx.setLineDash([6, 3]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Draw icon with glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = isActive ? color : 'rgba(255, 255, 255, 0.3)';
    ctx.fillStyle = '#ffffff';
    ctx.font = `${node.radius * 0.9}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.icon, node.x - width * 0.15, node.y);
    ctx.shadowBlur = 0;

    // Draw expand/collapse indicator
    const indicatorSize = node.radius * 0.4;
    const indicatorX = node.x + width * 0.3;
    const indicatorY = node.y;
    ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
    ctx.font = `${indicatorSize}px sans-serif`;
    ctx.fillText(isCollapsed ? '▶' : '▼', indicatorX, indicatorY);

    // Draw power label below node
    const formattedPower = formatPower(node.powerWatts);
    const powerText = formatDisplay(formattedPower);

    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(powerText, node.x, y + height + 10);
    ctx.shadowBlur = 0;

    // Draw category name above node
    ctx.font = 'bold 13px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(node.name, node.x, y - 10);

    // Draw child count if collapsed
    if (isCollapsed && node.children && node.children.length > 0) {
      const activeCount = node.children.filter(c => c.powerWatts > 0).length;
      const countText = `${activeCount}/${node.children.length}`;
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(countText, node.x, y + height + 28);
    }

    ctx.restore();
  }

  /**
   * Render a remainder node (uncategorized power in a circuit)
   * @param x X position
   * @param y Y position
   * @param powerWatts Remainder power in watts
   */
  public renderRemainderNode(x: number, y: number, powerWatts: number): void {
    const ctx = this.ctx;

    ctx.save();

    const radius = 25;
    const color = '#9e9e9e'; // Gray for remainder

    // Draw node circle with dark fill
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 25, 40, 0.75)';
    ctx.fill();

    // Draw dashed border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw icon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = `${radius * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❓', x, y);

    // Draw power label below node
    const formattedPower = formatPower(powerWatts);
    const powerText = formatDisplay(formattedPower);

    ctx.shadowBlur = 3;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(powerText, x, y + radius + 8);
    ctx.shadowBlur = 0;

    // Draw label above node
    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('Other', x, y - radius - 8);

    ctx.restore();
  }

  /**
   * Render battery charge indicator
   * @param node Battery node
   * @param soc State of charge (0-100)
   * @param capacity Total battery capacity in kWh (optional)
   * @param timeRemaining Formatted time remaining string (optional)
   */
  private renderBatteryIndicator(node: EnergySourceNode, soc: number, capacity?: number, timeRemaining?: string): void {
    const ctx = this.ctx;
    const barWidth = node.radius * 1.5;
    const barHeight = 8;
    const x = node.x - barWidth / 2;
    const y = node.y + node.radius + 32;

    // Background (dark)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Charge level with glow
    const chargeWidth = (barWidth * soc) / 100;
    const chargeColor = soc > 80 ? '#4caf50' : soc > 20 ? '#ff9800' : '#f44336';

    ctx.shadowBlur = 8;
    ctx.shadowColor = chargeColor;
    ctx.fillStyle = chargeColor;
    ctx.fillRect(x, y, chargeWidth, barHeight);
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Percentage text with capacity if available
    let displayText: string;
    if (capacity !== undefined && capacity > 0) {
      const currentKWh = (capacity * soc / 100).toFixed(1);
      displayText = `${soc}% (${currentKWh}/${capacity.toFixed(1)} kWh)`;
    } else {
      const formattedSOC = formatPercentage(soc, 0);
      displayText = formatDisplay(formattedSOC);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(displayText, node.x, y + barHeight + 4);

    // Time remaining (if applicable)
    if (timeRemaining) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px sans-serif';
      ctx.fillText(timeRemaining, node.x, y + barHeight + 18);
    }
  }

  /**
   * Render stale data indicator
   * @param x X position
   * @param y Y position
   */
  private renderStaleIndicator(x: number, y: number): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff9800';
    ctx.fillStyle = '#ff9800';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠', x, y);
    ctx.restore();
  }

  /**
   * Render connection line between nodes
   * @param sourceX Source node X
   * @param sourceY Source node Y
   * @param targetX Target node X
   * @param targetY Target node Y
   * @param color Line color
   * @param width Line width
   * @param opacity Line opacity
   */
  public renderConnection(
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    color: string,
    width: number = 2,
    opacity: number = 0.3
  ): void {
    const ctx = this.ctx;

    ctx.save();

    // Draw glowing connection line
    if (opacity > 0.1) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
    }

    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render the hub node (energy distribution center)
   * @param x Hub X position
   * @param y Hub Y position
   * @param radius Hub radius
   * @param totalLoad Total power consumption in watts (optional)
   */
  public renderHubNode(x: number, y: number, radius: number = 30, totalLoad?: number): void {
    const ctx = this.ctx;

    ctx.save();

    const hubColor = '#64b5f6'; // Blue for home/hub

    // Draw glowing outer ring
    ctx.shadowBlur = 18;
    ctx.shadowColor = hubColor;
    ctx.strokeStyle = hubColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Draw hub circle with dark fill
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 25, 40, 0.85)';
    ctx.fill();

    // Draw neon border
    ctx.shadowBlur = 15;
    ctx.shadowColor = hubColor;
    ctx.strokeStyle = hubColor;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw icon with glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = hubColor;
    ctx.fillStyle = '#ffffff';
    ctx.font = `${radius * 0.9}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏠', x, y);
    ctx.shadowBlur = 0;

    // Draw total load power below hub if provided
    if (totalLoad !== undefined && totalLoad > 0) {
      const formattedPower = formatPower(totalLoad);
      const powerText = formatDisplay(formattedPower);

      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(powerText, x, y + radius + 12);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  /**
   * Get color for device based on power consumption
   * @param powerWatts Power in watts
   * @returns Color hex code
   */
  private getDeviceColor(powerWatts: number): string {
    if (powerWatts <= 0) {
      return '#cccccc';
    } else if (powerWatts < 100) {
      return '#4caf50'; // Green (low)
    } else if (powerWatts < 500) {
      return '#2196f3'; // Blue (medium)
    } else if (powerWatts < 1000) {
      return '#ff9800'; // Orange (high)
    } else {
      return '#f44336'; // Red (very high)
    }
  }

  /**
   * Lighten a hex color by a percentage
   * @param color Hex color code
   * @param percent Percentage to lighten (0-100)
   * @returns Lightened hex color
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, ((num >> 16) & 0xff) + amt);
    const G = Math.min(255, ((num >> 8) & 0xff) + amt);
    const B = Math.min(255, (num & 0xff) + amt);
    return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  /**
   * Get human-readable label for source type
   * @param type Source type
   * @returns Label string
   */
  private getTypeLabel(type: string): string {
    switch (type) {
      case 'solar':
        return 'Solar';
      case 'battery':
        return 'Battery';
      case 'grid':
        return 'Grid';
      case 'hub':
        return 'Hub';
      default:
        return type;
    }
  }

  /**
   * Clear the canvas
   * @param width Canvas width
   * @param height Canvas height
   */
  public clear(width: number, height: number): void {
    this.ctx.clearRect(0, 0, width, height);
  }
}
