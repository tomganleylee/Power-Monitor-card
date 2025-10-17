/**
 * LayoutEngine - Manages node positioning using d3-force layout
 */

import {
  forceSimulation,
  forceLink,
  forceCollide,
  forceManyBody,
  forceX,
  forceY,
  SimulationNodeDatum,
  SimulationLinkDatum
} from 'd3-force';
import {
  EnergySourceNode,
  ConsumptionDeviceNode
} from './types';

interface LayoutNode extends SimulationNodeDatum {
  id: string;
  type: 'source' | 'hub' | 'consumption';
  radius: number;
  fx?: number | null;
  fy?: number | null;
}

interface LayoutLink extends SimulationLinkDatum<LayoutNode> {
  source: string | LayoutNode;
  target: string | LayoutNode;
  strength: number;
}

export class LayoutEngine {
  private simulation: any;
  private width: number;
  private height: number;
  private nodes: LayoutNode[] = [];
  private links: LayoutLink[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initializeSimulation();
  }

  /**
   * Initialize d3-force simulation
   */
  private initializeSimulation(): void {
    this.simulation = forceSimulation<LayoutNode>()
      .force('link', forceLink<LayoutNode, LayoutLink>()
        .id((d: any) => d.id)
        .distance(150)
        .strength((d: any) => d.strength))
      .force('charge', forceManyBody<LayoutNode>()
        .strength(-300))
      .force('collide', forceCollide<LayoutNode>()
        .radius((d: any) => d.radius + 10)
        .strength(0.7))
      .force('centerX', forceX<LayoutNode>(this.width / 2)
        .strength(0.05))
      .force('centerY', forceY<LayoutNode>(this.height / 2)
        .strength(0.05))
      .alphaDecay(0.02)
      .velocityDecay(0.4);
  }

  /**
   * Update layout with new nodes and connections
   * @param sourceNodes Energy source nodes
   * @param consumptionNodes Consumption device nodes
   */
  public updateLayout(
    sourceNodes: EnergySourceNode[],
    consumptionNodes: ConsumptionDeviceNode[]
  ): void {
    this.nodes = [];
    this.links = [];

    // Add source nodes (solar, battery, grid)
    for (const source of sourceNodes) {
      this.nodes.push({
        id: source.entityId,
        type: 'source',
        radius: source.radius,
        x: source.x || this.width * 0.2,
        y: source.y || this.height / 2,
        fx: null,
        fy: null
      });
    }

    // Add hub node (energy distribution center)
    const hubNode: LayoutNode = {
      id: 'hub',
      type: 'hub',
      radius: 30,
      x: this.width / 2,
      y: this.height / 2,
      fx: this.width / 2,  // Fix hub in center
      fy: this.height / 2
    };
    this.nodes.push(hubNode);

    // Add consumption nodes
    for (const device of consumptionNodes) {
      if (device.isVisible) {
        this.nodes.push({
          id: device.entityId,
          type: 'consumption',
          radius: device.radius,
          x: device.x || this.width * 0.8,
          y: device.y || this.height / 2,
          fx: null,
          fy: null
        });
      }
    }

    // Create links from sources to hub
    for (const source of sourceNodes) {
      if (source.isActive && source.powerWatts > 0) {
        this.links.push({
          source: source.entityId,
          target: 'hub',
          strength: 0.5
        });
      }
    }

    // Create links from hub to consumption devices
    for (const device of consumptionNodes) {
      if (device.isVisible && device.powerWatts > 0) {
        this.links.push({
          source: 'hub',
          target: device.entityId,
          strength: 0.5
        });
      }
    }

    // Update simulation
    this.simulation
      .nodes(this.nodes)
      .force('link').links(this.links);

    // Restart simulation
    this.simulation.alpha(0.3).restart();
  }

  /**
   * Run simulation for a fixed number of iterations
   * Used for initial layout calculation
   * @param iterations Number of iterations to run
   */
  public tick(iterations: number = 100): void {
    for (let i = 0; i < iterations; i++) {
      this.simulation.tick();
    }
  }

  /**
   * Apply calculated positions back to nodes
   * @param sourceNodes Energy source nodes to update
   * @param consumptionNodes Consumption device nodes to update
   */
  public applyPositions(
    sourceNodes: EnergySourceNode[],
    consumptionNodes: ConsumptionDeviceNode[]
  ): void {
    // Apply positions to source nodes
    for (const source of sourceNodes) {
      const layoutNode = this.nodes.find(n => n.id === source.entityId);
      if (layoutNode) {
        source.x = layoutNode.x ?? source.x;
        source.y = layoutNode.y ?? source.y;
      }
    }

    // Apply positions to consumption nodes
    for (const device of consumptionNodes) {
      const layoutNode = this.nodes.find(n => n.id === device.entityId);
      if (layoutNode) {
        device.x = layoutNode.x ?? device.x;
        device.y = layoutNode.y ?? device.y;
      }
    }
  }

  /**
   * Set fixed position for a source node (left side)
   * @param nodeId Node ID
   * @param index Index in source array
   * @param total Total number of sources
   */
  public setSourcePosition(nodeId: string, index: number, total: number): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      const spacing = this.height / (total + 1);
      node.fx = this.width * 0.15;
      node.fy = spacing * (index + 1);
    }
  }

  /**
   * Set fixed position for a consumption node (right side)
   * @param nodeId Node ID
   * @param index Index in consumption array
   * @param total Total number of devices
   */
  public setConsumptionPosition(nodeId: string, index: number, total: number): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      const spacing = this.height / (total + 1);
      node.fx = this.width * 0.85;
      node.fy = spacing * (index + 1);
    }
  }

  /**
   * Release fixed positions for all nodes
   */
  public releasePositions(): void {
    for (const node of this.nodes) {
      if (node.type !== 'hub') {
        node.fx = null;
        node.fy = null;
      }
    }
  }

  /**
   * Update canvas dimensions
   * @param width New canvas width
   * @param height New canvas height
   */
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;

    // Update force centers
    this.simulation
      .force('centerX', forceX<LayoutNode>(width / 2).strength(0.05))
      .force('centerY', forceY<LayoutNode>(height / 2).strength(0.05));

    // Update hub position
    const hubNode = this.nodes.find(n => n.id === 'hub');
    if (hubNode) {
      hubNode.fx = width / 2;
      hubNode.fy = height / 2;
    }

    // Restart simulation with new dimensions
    this.simulation.alpha(0.3).restart();
  }

  /**
   * Stop the simulation
   */
  public stop(): void {
    this.simulation.stop();
  }

  /**
   * Get hub node position
   */
  public getHubPosition(): { x: number; y: number } {
    const hubNode = this.nodes.find(n => n.id === 'hub');
    return {
      x: hubNode?.x ?? this.width / 2,
      y: hubNode?.y ?? this.height / 2
    };
  }

  /**
   * Use simple fixed layout instead of force simulation
   * Useful for predictable positioning
   * @param sourceNodes Energy source nodes
   * @param consumptionNodes Consumption device nodes
   */
  public useFixedLayout(
    sourceNodes: EnergySourceNode[],
    consumptionNodes: ConsumptionDeviceNode[]
  ): void {
    // Position sources on left side
    const sourceSpacing = this.height / (sourceNodes.length + 1);
    sourceNodes.forEach((source, index) => {
      source.x = this.width * 0.15;
      source.y = sourceSpacing * (index + 1);
    });

    // Position consumption devices on right side
    const visibleDevices = consumptionNodes.filter(d => d.isVisible);
    const deviceSpacing = this.height / (visibleDevices.length + 1);
    visibleDevices.forEach((device, index) => {
      device.x = this.width * 0.85;
      device.y = deviceSpacing * (index + 1);
    });
  }
}
