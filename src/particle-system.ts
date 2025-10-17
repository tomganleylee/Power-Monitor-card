/**
 * ParticleSystem - Manages particle animation with object pooling
 */

import {
  Particle,
  EnergySourceNode,
  ConsumptionDeviceNode
} from './types';
import { calculateParticleSpawnRate, calculateParticleSpeed } from './utils/power-calculations';

export class ParticleSystem {
  private particlePool: Particle[] = [];
  private activeParticles: Set<number> = new Set();
  private nextParticleId: number = 0;
  private poolSize: number = 500;
  private lastSpawnTime: Map<string, number> = new Map();

  constructor(poolSize: number = 500) {
    this.poolSize = poolSize;
    this.initializePool();
  }

  /**
   * Initialize particle object pool
   */
  private initializePool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.particlePool.push(this.createParticle(i));
    }
  }

  /**
   * Create a new particle object
   */
  private createParticle(id: number): Particle {
    return {
      id,
      sourceNode: null,
      targetNode: null,
      lifetime: 0,
      x: 0,
      y: 0,
      vx: 0,  // Velocity X
      vy: 0,  // Velocity Y
      color: '#ffffff',
      radius: 4,  // Smaller for cloud effect
      opacity: 1,
      isActive: false,
      wanderAngle: Math.random() * Math.PI * 2,
      wanderSpeed: 0.3 + Math.random() * 0.7,  // Slower wander
      maxSpeed: 60  // Max pixels per second
    };
  }

  /**
   * Spawn particles for a connection between source and target
   * @param sourceNode Source energy node
   * @param targetNode Target consumption node
   * @param powerWatts Power flow in watts
   * @param deltaTime Time since last frame in seconds
   */
  public spawnParticles(
    sourceNode: EnergySourceNode | ConsumptionDeviceNode,
    targetNode: ConsumptionDeviceNode,
    powerWatts: number,
    deltaTime: number
  ): void {
    // Calculate spawn rate based on power
    const particlesPerSecond = calculateParticleSpawnRate(powerWatts);
    const spawnInterval = 1000 / particlesPerSecond; // ms between spawns

    // Create unique key for this connection
    const sourceType = 'type' in sourceNode ? sourceNode.type : 'device';
    const connectionKey = `${sourceType}_${sourceNode.entityId}_${targetNode.entityId}`;

    // Get last spawn time for this connection
    const lastSpawn = this.lastSpawnTime.get(connectionKey) ?? 0;
    const now = Date.now();

    // Check if enough time has passed to spawn new particle
    if (now - lastSpawn < spawnInterval) {
      return;
    }

    // Spawn particle
    const particle = this.acquireParticle();
    if (particle) {
      const speed = calculateParticleSpeed(powerWatts);

      // Get color from source node (EnergySourceNode has color, ConsumptionDeviceNode doesn't)
      const particleColor = 'color' in sourceNode ? sourceNode.color : '#999999';

      particle.sourceNode = sourceNode;
      particle.targetNode = targetNode;
      particle.lifetime = 0;
      // Spawn at source with slight random offset
      const spawnOffset = 20;
      particle.x = sourceNode.x + (Math.random() - 0.5) * spawnOffset;
      particle.y = sourceNode.y + (Math.random() - 0.5) * spawnOffset;
      // Initial velocity towards target with randomness
      const dx = targetNode.x - particle.x;
      const dy = targetNode.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const initialSpeed = speed * 30; // Convert to pixels per second
      particle.vx = (dx / distance) * initialSpeed + (Math.random() - 0.5) * 20;
      particle.vy = (dy / distance) * initialSpeed + (Math.random() - 0.5) * 20;
      particle.color = particleColor;
      particle.opacity = 0; // Start transparent, fade in
      particle.isActive = true;
      particle.wanderAngle = Math.random() * Math.PI * 2;
      particle.wanderSpeed = 0.3 + Math.random() * 0.7;
      particle.maxSpeed = 270; // 20% slower than 340 (340 * 0.8 = 272)

      this.activeParticles.add(particle.id);
      this.lastSpawnTime.set(connectionKey, now);
    }
  }

  /**
   * Update all active particles
   * @param deltaTime Time since last frame in seconds
   */
  public update(deltaTime: number): void {
    const particlesToRelease: number[] = [];

    for (const particleId of this.activeParticles) {
      const particle = this.particlePool[particleId];

      if (!particle || !particle.isActive) {
        particlesToRelease.push(particleId);
        continue;
      }

      // Update particle lifetime
      particle.lifetime += deltaTime;

      // Physics-based floating to target
      if (particle.targetNode) {
        // Calculate direction and distance to target
        const dx = particle.targetNode.x - particle.x;
        const dy = particle.targetNode.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if reached target (within 30px)
        if (distance < 30) {
          particlesToRelease.push(particleId);
          continue;
        }

        // Release particles after 3.5 seconds (longer for slower speed)
        if (particle.lifetime > 3.5) {
          particlesToRelease.push(particleId);
          continue;
        }

        // 20% slower than 2550 = 2040
        const attractionStrength = 2040; // Pixels per second squared
        const directionX = dx / distance;
        const directionY = dy / distance;
        const attractionX = directionX * attractionStrength * deltaTime;
        const attractionY = directionY * attractionStrength * deltaTime;

        // More wander force for visible floating effect
        particle.wanderAngle += (Math.random() - 0.5) * 0.4; // More angle change for wobble
        const wanderForce = particle.wanderSpeed * 8; // More wander strength
        const wanderX = Math.cos(particle.wanderAngle) * wanderForce * deltaTime;
        const wanderY = Math.sin(particle.wanderAngle) * wanderForce * deltaTime;

        // Apply forces to velocity
        particle.vx += attractionX + wanderX;
        particle.vy += attractionY + wanderY;

        // Almost no drag - maximum speed to reach target quickly
        const drag = 0.998;
        particle.vx *= drag;
        particle.vy *= drag;

        // Limit max speed
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > particle.maxSpeed) {
          particle.vx = (particle.vx / speed) * particle.maxSpeed;
          particle.vy = (particle.vy / speed) * particle.maxSpeed;
        }

        // Update position
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
      }

      // Fade in/out opacity (faster timing for quick transitions)
      if (particle.lifetime < 0.2) {
        particle.opacity = particle.lifetime / 0.2; // Fade in over 0.2s
      } else if (particle.lifetime > 2) {
        particle.opacity = Math.max(0, (2.5 - particle.lifetime) / 0.5); // Fade out last 0.5s
      } else {
        particle.opacity = 0.9; // Fully visible
      }
    }

    // Release completed particles back to pool
    for (const particleId of particlesToRelease) {
      this.releaseParticle(particleId);
    }
  }

  /**
   * Render all active particles to canvas
   * @param ctx Canvas rendering context
   */
  public render(ctx: CanvasRenderingContext2D): void {
    for (const particleId of this.activeParticles) {
      const particle = this.particlePool[particleId];

      if (!particle || !particle.isActive) {
        continue;
      }

      ctx.save();
      ctx.globalAlpha = particle.opacity;

      // Add glow effect to particles
      ctx.shadowBlur = 12;
      ctx.shadowColor = particle.color;

      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();

      // Add bright center
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Acquire a particle from the pool
   * @returns Particle object or null if pool is exhausted
   */
  private acquireParticle(): Particle | null {
    // Find first inactive particle
    for (let i = 0; i < this.particlePool.length; i++) {
      const particle = this.particlePool[i];
      if (!particle.isActive) {
        return particle;
      }
    }

    // Pool exhausted - adaptive throttling
    // Reduce particle count by releasing oldest particles
    if (this.activeParticles.size > 0) {
      const oldestId = this.activeParticles.values().next().value;
      if (oldestId !== undefined) {
        this.releaseParticle(oldestId);
        return this.particlePool[oldestId];
      }
    }

    return null;
  }

  /**
   * Release a particle back to the pool
   * @param particleId Particle ID to release
   */
  private releaseParticle(particleId: number): void {
    const particle = this.particlePool[particleId];
    if (particle) {
      particle.isActive = false;
      particle.sourceNode = null;
      particle.targetNode = null;
      this.activeParticles.delete(particleId);
    }
  }

  /**
   * Easing function for smooth particle movement
   * @param t Progress value (0-1)
   * @returns Eased progress value (0-1)
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Get count of active particles
   */
  public getActiveCount(): number {
    return this.activeParticles.size;
  }

  /**
   * Get pool utilization percentage
   */
  public getUtilization(): number {
    return (this.activeParticles.size / this.poolSize) * 100;
  }

  /**
   * Clear all active particles
   */
  public clear(): void {
    for (const particleId of this.activeParticles) {
      this.releaseParticle(particleId);
    }
    this.lastSpawnTime.clear();
  }

  /**
   * Reset the particle system
   */
  public reset(): void {
    this.clear();
    this.nextParticleId = 0;
  }

  /**
   * Get all active particles (for debugging)
   */
  public getActiveParticles(): Particle[] {
    return Array.from(this.activeParticles)
      .map(id => this.particlePool[id])
      .filter(p => p && p.isActive);
  }
}
