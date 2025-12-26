/**
 * BusRenderer - Renders horizontal energy bus with power contribution visualization
 *
 * The bus displays power contributions from multiple sources (solar, grid, battery)
 * as stacked colored segments, with animated glow effects and connection points
 * for energy flow visualization.
 */

import { formatPower, formatDisplay } from './utils/unit-formatter';

export interface BusConfig {
  x: number;           // Left edge X position
  y: number;           // Center Y position
  width: number;       // Total bus width
  height: number;      // Bus bar height (e.g., 40px)
}

export interface PowerContribution {
  source: 'solar' | 'grid' | 'battery';
  watts: number;
  color: string;
}

// Default colors for each source type
const SOURCE_COLORS: Record<string, string> = {
  solar: '#ffa500',    // Orange/yellow for solar
  grid: '#f44336',     // Red for grid
  battery: '#4caf50'   // Green for battery
};

export class BusRenderer {
  private ctx: CanvasRenderingContext2D;
  private animationTime: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Update animation time for glow/pulse effects
   * @param deltaTime Time elapsed since last update in seconds
   */
  public updateAnimation(deltaTime: number): void {
    this.animationTime += deltaTime;
  }

  /**
   * Render the energy bus with power contribution segments
   * @param config Bus configuration (position, size)
   * @param contributions Array of power contributions from sources
   * @param totalPower Total power flowing through the bus
   */
  public renderBus(config: BusConfig, contributions: PowerContribution[], totalPower: number): void {
    const ctx = this.ctx;
    ctx.save();

    // Calculate bus rectangle bounds
    const top = config.y - config.height / 2;
    const cornerRadius = Math.min(config.height / 4, 10);

    // Calculate pulse animation
    const pulsePhase = (this.animationTime % 2000) / 2000;
    const pulseIntensity = 0.7 + Math.sin(pulsePhase * Math.PI * 2) * 0.3;
    const glowSize = 12 + Math.sin(pulsePhase * Math.PI * 2) * 4;

    // Draw outer glow ring
    ctx.shadowBlur = glowSize;
    ctx.shadowColor = 'rgba(100, 181, 246, 0.5)';
    ctx.globalAlpha = 0.2 * pulseIntensity;
    ctx.strokeStyle = '#64b5f6';
    ctx.lineWidth = 2;
    this.drawRoundedRect(config.x - 4, top - 4, config.width + 8, config.height + 8, cornerRadius + 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Draw bus background with dark gradient
    const bgGradient = ctx.createLinearGradient(config.x, top, config.x, top + config.height);
    bgGradient.addColorStop(0, 'rgba(25, 35, 55, 0.95)');
    bgGradient.addColorStop(0.5, 'rgba(15, 25, 45, 0.95)');
    bgGradient.addColorStop(1, 'rgba(20, 30, 50, 0.95)');

    this.drawRoundedRect(config.x, top, config.width, config.height, cornerRadius);
    ctx.fillStyle = bgGradient;
    ctx.fill();

    // Draw glowing border
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#64b5f6';
    ctx.strokeStyle = '#64b5f6';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Render the power contribution bars inside the bus
    this.renderContributionBars(config, contributions, totalPower);

    // Draw total power label in the center
    this.renderTotalPowerLabel(config, totalPower);

    ctx.restore();
  }

  /**
   * Get the connection point for a specific source type on the left side of the bus
   * Sources are stacked vertically: solar (top), grid (middle), battery (bottom)
   * @param config Bus configuration
   * @param sourceType The source type to get connection point for
   * @returns Connection point coordinates
   */
  public getSourceConnectionPoint(config: BusConfig, sourceType: 'solar' | 'grid' | 'battery'): { x: number; y: number } {
    const spacing = config.height / 4;
    let yOffset: number;

    switch (sourceType) {
      case 'solar':
        yOffset = -spacing;      // Top position
        break;
      case 'grid':
        yOffset = 0;             // Middle position
        break;
      case 'battery':
        yOffset = spacing;       // Bottom position
        break;
      default:
        yOffset = 0;
    }

    return {
      x: config.x,
      y: config.y + yOffset
    };
  }

  /**
   * Get the connection point for the consumer trunk on the right side of the bus
   * @param config Bus configuration
   * @returns Connection point coordinates (center of right edge)
   */
  public getConsumerConnectionPoint(config: BusConfig): { x: number; y: number } {
    return {
      x: config.x + config.width,
      y: config.y
    };
  }

  /**
   * Render stacked contribution bars proportionally inside the bus
   * Order: solar (left), grid, battery (right)
   * @param config Bus configuration
   * @param contributions Power contributions from each source
   * @param totalPower Total power for calculating proportions
   */
  private renderContributionBars(config: BusConfig, contributions: PowerContribution[], totalPower: number): void {
    const ctx = this.ctx;

    if (totalPower <= 0 || contributions.length === 0) {
      return;
    }

    // Calculate bar dimensions with padding
    const padding = 6;
    const barHeight = config.height - (padding * 2);
    const barTop = config.y - barHeight / 2;
    const maxBarWidth = config.width - (padding * 2);

    // Sort contributions by source order: solar, grid, battery
    const sourceOrder = ['solar', 'grid', 'battery'];
    const sortedContributions = [...contributions].sort((a, b) => {
      return sourceOrder.indexOf(a.source) - sourceOrder.indexOf(b.source);
    });

    // Calculate pulse for animated glow
    const pulsePhase = (this.animationTime % 1500) / 1500;
    const barGlow = 6 + Math.sin(pulsePhase * Math.PI * 2) * 3;

    let currentX = config.x + padding;

    for (const contribution of sortedContributions) {
      if (contribution.watts <= 0) continue;

      const proportion = contribution.watts / totalPower;
      const barWidth = maxBarWidth * proportion;

      if (barWidth < 2) continue; // Skip very thin bars

      // Get color for this source
      const color = contribution.color || SOURCE_COLORS[contribution.source] || '#64b5f6';

      // Parse color for gradient
      const rgb = this.parseColor(color);

      // Create gradient for 3D effect
      const gradient = ctx.createLinearGradient(currentX, barTop, currentX, barTop + barHeight);
      gradient.addColorStop(0, `rgba(${rgb.r + 40}, ${rgb.g + 40}, ${rgb.b + 40}, 0.9)`);
      gradient.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`);
      gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`);
      gradient.addColorStop(1, `rgba(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)}, 0.9)`);

      // Draw glowing bar
      ctx.save();
      ctx.shadowBlur = barGlow;
      ctx.shadowColor = color;

      ctx.fillStyle = gradient;
      ctx.beginPath();

      // Determine corner radius based on position
      const isFirst = currentX === config.x + padding;
      const isLast = currentX + barWidth >= config.x + config.width - padding - 1;
      const barCornerRadius = Math.min(barHeight / 4, 6);

      this.drawContributionBar(currentX, barTop, barWidth, barHeight, barCornerRadius, isFirst, isLast);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();

      currentX += barWidth;
    }
  }

  /**
   * Draw a contribution bar segment with appropriate corner rounding
   */
  private drawContributionBar(x: number, y: number, width: number, height: number, radius: number, isFirst: boolean, isLast: boolean): void {
    const ctx = this.ctx;
    ctx.beginPath();

    const leftRadius = isFirst ? radius : 0;
    const rightRadius = isLast ? radius : 0;

    ctx.moveTo(x + leftRadius, y);
    ctx.lineTo(x + width - rightRadius, y);
    if (rightRadius > 0) {
      ctx.quadraticCurveTo(x + width, y, x + width, y + rightRadius);
    }
    ctx.lineTo(x + width, y + height - rightRadius);
    if (rightRadius > 0) {
      ctx.quadraticCurveTo(x + width, y + height, x + width - rightRadius, y + height);
    }
    ctx.lineTo(x + leftRadius, y + height);
    if (leftRadius > 0) {
      ctx.quadraticCurveTo(x, y + height, x, y + height - leftRadius);
    }
    ctx.lineTo(x, y + leftRadius);
    if (leftRadius > 0) {
      ctx.quadraticCurveTo(x, y, x + leftRadius, y);
    }
    ctx.closePath();
  }

  /**
   * Render total power label in the center of the bus
   */
  private renderTotalPowerLabel(config: BusConfig, totalPower: number): void {
    const ctx = this.ctx;

    const powerText = this.formatPower(totalPower);

    // Draw text background for readability
    ctx.font = 'bold 16px sans-serif';
    const metrics = ctx.measureText(powerText);
    const textWidth = metrics.width;
    const textHeight = 18;
    const bgPadding = 6;

    // Semi-transparent background behind text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.drawRoundedRect(
      config.x + config.width / 2 - textWidth / 2 - bgPadding,
      config.y - textHeight / 2 - 2,
      textWidth + bgPadding * 2,
      textHeight + 4,
      4
    );
    ctx.fill();

    // Draw text with shadow for depth
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(powerText, config.x + config.width / 2, config.y);
    ctx.shadowBlur = 0;
  }

  /**
   * Draw a rounded rectangle path
   */
  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
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
   * Format power value to appropriate scale (W or kW)
   * @param watts Power in watts
   * @returns Formatted string
   */
  private formatPower(watts: number): string {
    const formatted = formatPower(Math.abs(watts));
    return formatDisplay(formatted);
  }

  /**
   * Parse color string to RGB values
   */
  private parseColor(color: string): { r: number; g: number; b: number } {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16)
        };
      } else if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16)
        };
      }
    }

    // Handle rgb/rgba colors
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      };
    }

    // Default to blue if parsing fails
    return { r: 100, g: 181, b: 246 };
  }
}
