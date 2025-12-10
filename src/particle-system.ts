/**
 * ParticleSystem - Manages particle animation with object pooling
 * Features: O(1) particle acquisition via free list, power-based size variation
 */

import {
  Particle,
  EnergySourceNode,
  ConsumptionDeviceNode,
  HubNode
} from './types';
import { calculateParticleSpawnRate, calculateParticleSpeed } from './utils/power-calculations';
import {
  PHYSICS,
  PARTICLE,
  THRESHOLDS
} from './constants';

export class ParticleSystem {
  private particlePool: Particle[] = [];
  private activeParticles: Set<number> = new Set();
  private freeList: number[] = []; // O(1) free particle lookup
  private poolSize: number = PARTICLE.POOL_SIZE;
  private lastSpawnTime: Map<string, number> = new Map();

  constructor(poolSize: number = PARTICLE.POOL_SIZE) {
    this.poolSize = poolSize;
    this.initializePool();
  }

  /**
   * Initialize particle object pool with free list
   */
  private initializePool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.particlePool.push(this.createParticle(i));
      this.freeList.push(i); // Add all particles to free list
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
      vx: 0,
      vy: 0,
      color: '#ffffff',
      radius: PARTICLE.BASE_RADIUS,
      opacity: 1,
      isActive: false,
      wanderAngle: Math.random() * Math.PI * 2,
      wanderSpeed: 0.3 + Math.random() * 0.7,
      maxSpeed: PHYSICS.MAX_SPEED
    };
  }

  /**
   * Calculate particle radius based on power flow
   * Higher power = larger particles
   */
  private calculateParticleRadius(powerWatts: number): number {
    const powerScale = Math.min(1, Math.abs(powerWatts) / PARTICLE.MAX_POWER_FOR_SIZE);
    return PARTICLE.BASE_RADIUS + (powerScale * PARTICLE.RADIUS_SCALE);
  }

  /**
   * Spawn particles for a connection between source and target
   * @param sourceNode Source energy node
   * @param targetNode Target consumption node or hub node
   * @param powerWatts Power flow in watts
   * @param deltaTime Time since last frame in seconds
   */
  public spawnParticles(
    sourceNode: EnergySourceNode | ConsumptionDeviceNode | HubNode,
    targetNode: ConsumptionDeviceNode | HubNode,
    powerWatts: number,
    deltaTime: number
  ): void {
    // Calculate spawn rate based on power
    const particlesPerSecond = calculateParticleSpawnRate(powerWatts);
    const spawnInterval = 1000 / particlesPerSecond; // ms between spawns

    // Create unique key for this connection
    const sourceType = 'type' in sourceNode ? sourceNode.type : 'device';
    const targetId = 'entityId' in targetNode ? targetNode.entityId : 'hub';
    const connectionKey = `${sourceType}_${sourceNode.entityId}_${targetId}`;

    // Get last spawn time for this connection
    const lastSpawn = this.lastSpawnTime.get(connectionKey) ?? 0;
    const now = Date.now();

    // Check if enough time has passed to spawn new particle
    if (now - lastSpawn < spawnInterval) {
      return;
    }

    // Spawn particle using O(1) free list
    const particle = this.acquireParticle();
    if (particle) {
      const speed = calculateParticleSpeed(powerWatts);

      // Get color from source node
      const particleColor = 'color' in sourceNode && sourceNode.color ? sourceNode.color : '#999999';

      particle.sourceNode = sourceNode as EnergySourceNode | ConsumptionDeviceNode;
      particle.targetNode = targetNode as ConsumptionDeviceNode;
      particle.lifetime = 0;

      // Spawn at source with slight random offset
      particle.x = sourceNode.x + (Math.random() - 0.5) * PHYSICS.SPAWN_OFFSET;
      particle.y = sourceNode.y + (Math.random() - 0.5) * PHYSICS.SPAWN_OFFSET;

      // Initial velocity towards target with randomness
      const dx = targetNode.x - particle.x;
      const dy = targetNode.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const initialSpeed = speed * PHYSICS.SPEED_MULTIPLIER;
      particle.vx = (dx / distance) * initialSpeed + (Math.random() - 0.5) * PHYSICS.VELOCITY_RANDOMIZATION;
      particle.vy = (dy / distance) * initialSpeed + (Math.random() - 0.5) * PHYSICS.VELOCITY_RANDOMIZATION;

      particle.color = particleColor;
      particle.opacity = 0; // Start transparent, fade in
      particle.isActive = true;
      particle.wanderAngle = Math.random() * Math.PI * 2;
      particle.wanderSpeed = 0.3 + Math.random() * 0.7;
      particle.maxSpeed = PHYSICS.MAX_SPEED;

      // Set particle size based on power
      particle.radius = this.calculateParticleRadius(powerWatts);

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

        // Check if reached target
        if (distance < PHYSICS.ARRIVAL_DISTANCE) {
          particlesToRelease.push(particleId);
          continue;
        }

        // Release particles after lifetime exceeded
        if (particle.lifetime > PHYSICS.PARTICLE_LIFETIME) {
          particlesToRelease.push(particleId);
          continue;
        }

        // Apply attraction force towards target
        const directionX = dx / distance;
        const directionY = dy / distance;
        const attractionX = directionX * PHYSICS.ATTRACTION_STRENGTH * deltaTime;
        const attractionY = directionY * PHYSICS.ATTRACTION_STRENGTH * deltaTime;

        // Apply wander force for visible floating effect
        particle.wanderAngle += (Math.random() - 0.5) * PHYSICS.WANDER_ANGLE_CHANGE;
        const wanderForce = particle.wanderSpeed * PHYSICS.WANDER_STRENGTH;
        const wanderX = Math.cos(particle.wanderAngle) * wanderForce * deltaTime;
        const wanderY = Math.sin(particle.wanderAngle) * wanderForce * deltaTime;

        // Apply forces to velocity
        particle.vx += attractionX + wanderX;
        particle.vy += attractionY + wanderY;

        // Apply drag
        particle.vx *= PHYSICS.DRAG;
        particle.vy *= PHYSICS.DRAG;

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

      // Fade in/out opacity
      if (particle.lifetime < PARTICLE.FADE_IN_DURATION) {
        particle.opacity = particle.lifetime / PARTICLE.FADE_IN_DURATION;
      } else if (particle.lifetime > PHYSICS.PARTICLE_LIFETIME - PARTICLE.FADE_OUT_START) {
        const fadeOutStart = PHYSICS.PARTICLE_LIFETIME - PARTICLE.FADE_OUT_START;
        particle.opacity = Math.max(0, (PHYSICS.PARTICLE_LIFETIME - particle.lifetime) / PARTICLE.FADE_OUT_START);
      } else {
        particle.opacity = PARTICLE.FULL_OPACITY;
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
      ctx.shadowBlur = PARTICLE.GLOW_BLUR;
      ctx.shadowColor = particle.color;

      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();

      // Add bright center (size scales with particle size)
      ctx.shadowBlur = PARTICLE.GLOW_BLUR * 0.67;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * PARTICLE.CENTER_SIZE, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Acquire a particle from the pool using O(1) free list
   * @returns Particle object or null if pool is exhausted
   */
  private acquireParticle(): Particle | null {
    // O(1) acquisition from free list
    if (this.freeList.length > 0) {
      const particleId = this.freeList.pop()!;
      return this.particlePool[particleId];
    }

    // Pool exhausted - release oldest particle (adaptive throttling)
    if (this.activeParticles.size > 0) {
      const oldestId = this.activeParticles.values().next().value;
      if (oldestId !== undefined) {
        this.releaseParticle(oldestId);
        // Now acquire from free list
        if (this.freeList.length > 0) {
          const particleId = this.freeList.pop()!;
          return this.particlePool[particleId];
        }
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
    if (particle && particle.isActive) {
      particle.isActive = false;
      particle.sourceNode = null;
      particle.targetNode = null;
      this.activeParticles.delete(particleId);
      this.freeList.push(particleId); // Return to free list for O(1) reuse
    }
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
    // Release all active particles back to free list
    for (const particleId of Array.from(this.activeParticles)) {
      this.releaseParticle(particleId);
    }
    this.lastSpawnTime.clear();
  }

  /**
   * Reset the particle system
   */
  public reset(): void {
    this.clear();
    // Rebuild free list
    this.freeList = [];
    for (let i = 0; i < this.poolSize; i++) {
      this.freeList.push(i);
    }
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
