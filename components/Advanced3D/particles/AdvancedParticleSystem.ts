import * as THREE from 'three';

// Particle types
export enum ParticleType {
  STEAM = 'steam',
  BUBBLE = 'bubble',
  TEA_LEAF = 'tea_leaf'
}

// Temperature-based steam behavior system
export class ThermalSteamBehavior {
  private temperature: number;
  private vaporPressure: number;
  private density: number;
  private viscosity: number;
  private condensationThreshold: number;
  
  constructor(temperature: number) {
    this.temperature = temperature;
    this.updateProperties();
  }
  
  private updateProperties() {
    // Calculate water vapor properties based on temperature
    // Using Antoine equation approximation for vapor pressure
    const A = 8.07131, B = 1730.63, C = 233.426;
    this.vaporPressure = Math.pow(10, A - B / (this.temperature + C)); // kPa
    
    // Steam density (kg/m³) - decreases with temperature
    this.density = 1000 * Math.exp(-0.01 * (this.temperature - 100));
    
    // Dynamic viscosity (Pa·s) - decreases with temperature  
    this.viscosity = 0.001 * Math.exp(-0.02 * (this.temperature - 20));
    
    // Condensation occurs when temperature drops below threshold
    this.condensationThreshold = this.temperature - 10; // 10°C below steam temp
  }
  
  updateTemperature(newTemperature: number) {
    this.temperature = newTemperature;
    this.updateProperties();
  }
  
  getEmissionVelocity(): THREE.Vector3 {
    // Higher temperature = faster initial velocity
    const baseVelocity = 0.05;
    const tempFactor = Math.max(0, (this.temperature - 70) / 30); // 0-1 range
    const velocityMagnitude = baseVelocity * (0.5 + tempFactor * 1.5);
    
    // Add thermal convection effects
    return new THREE.Vector3(
      (Math.random() - 0.5) * 0.02 * tempFactor,
      velocityMagnitude + Math.random() * 0.03,
      (Math.random() - 0.5) * 0.02 * tempFactor
    );
  }
  
  getParticleSize(): number {
    // Hotter steam creates larger, more visible droplets
    const baseSize = 0.01;
    const tempFactor = Math.max(0, (this.temperature - 70) / 30);
    return baseSize + tempFactor * 0.01 + Math.random() * 0.02;
  }
  
  getParticleLifetime(): number {
    // Higher temperature steam lasts longer before condensing
    const baseLifetime = 2.0;
    const tempFactor = Math.max(0, (this.temperature - 70) / 30);
    return baseLifetime + tempFactor * 3.0 + Math.random() * 2.0;
  }
  
  applyThermalForces(particle: Particle, ambientTemp: number, deltaTime: number) {
    // Buoyancy based on temperature difference
    const temperatureDiff = this.temperature - ambientTemp;
    const buoyancyForce = new THREE.Vector3(0, temperatureDiff * 0.0001, 0);
    
    // Convection currents - warmer air rises in spirals
    const time = Date.now() * 0.001;
    const convectionForce = new THREE.Vector3(
      Math.sin(time + particle.position.y * 10) * 0.00005 * temperatureDiff,
      buoyancyForce.y,
      Math.cos(time + particle.position.y * 10) * 0.00005 * temperatureDiff
    );
    
    // Air resistance proportional to velocity and viscosity
    const dragForce = particle.velocity.clone()
      .multiplyScalar(-this.viscosity * 0.1);
    
    // Apply forces
    particle.acceleration.add(convectionForce);
    particle.acceleration.add(dragForce);
    
    // Temperature cooling over time
    particle.temperature = this.temperature - (particle.maxLife - particle.life) * 2;
    
    // Condensation effects
    if (particle.temperature < this.condensationThreshold) {
      // Particle becomes water droplet - heavier and smaller
      particle.velocity.y -= 0.02 * deltaTime; // Gravity effect
      particle.size *= 0.99; // Shrinking
      particle.opacity *= 0.95; // Fading
    }
    
    // Steam expansion as it rises and cools
    const heightFactor = Math.max(0, particle.position.y);
    const expansionFactor = 1 + heightFactor * 0.5;
    particle.size *= (1 + deltaTime * 0.1 * expansionFactor);
  }
  
  getVaporPressure(): number {
    return this.vaporPressure;
  }
  
  getDensity(): number {
    return this.density;
  }
  
  shouldCondense(ambientTemp: number, humidity: number): boolean {
    return ambientTemp < this.condensationThreshold || humidity > 0.9;
  }
}

// Individual particle class
export class Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
  color: THREE.Color;
  type: ParticleType;
  temperature: number;
  
  constructor(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    life: number,
    size: number,
    type: ParticleType,
    temperature: number = 85
  ) {
    this.position = position.clone();
    this.velocity = velocity.clone();
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.opacity = 1.0;
    this.color = new THREE.Color(1, 1, 1);
    this.type = type;
    this.temperature = temperature;
  }
  
  update(deltaTime: number, forces: THREE.Vector3[]) {
    // Apply forces
    this.acceleration.set(0, 0, 0);
    forces.forEach(force => {
      this.acceleration.add(force);
    });
    
    // Update physics
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Update life
    this.life -= deltaTime;
    
    // Update visual properties based on life
    const lifeRatio = this.life / this.maxLife;
    this.opacity = Math.max(0, lifeRatio);
    
    if (this.type === ParticleType.STEAM) {
      // Steam particles grow and fade as they rise
      this.size *= 1.01;
      this.velocity.y *= 0.99; // Gradual slowdown
    }
  }
  
  isDead(): boolean {
    return this.life <= 0 || this.opacity <= 0;
  }
}

// Steam particle emitter with temperature-based behavior
export class SteamEmitter {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  emissionRate: number; // particles per second
  temperature: number;
  private timeSinceLastEmission: number = 0;
  private thermalBehavior: ThermalSteamBehavior;
  
  constructor(position: THREE.Vector3, temperature: number = 85) {
    this.position = position.clone();
    this.direction = new THREE.Vector3(0, 1, 0);
    this.temperature = temperature;
    this.emissionRate = Math.max(0, (temperature - 70) * 2); // More steam at higher temps
    this.thermalBehavior = new ThermalSteamBehavior(temperature);
  }
  
  emit(deltaTime: number): Particle[] {
    if (this.temperature < 75) return [];
    
    this.timeSinceLastEmission += deltaTime;
    const particlesToEmit = Math.floor(this.timeSinceLastEmission * this.emissionRate);
    
    if (particlesToEmit === 0) return [];
    
    this.timeSinceLastEmission = 0;
    const particles: Particle[] = [];
    
    for (let i = 0; i < particlesToEmit; i++) {
      // Random position around emitter
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        0,
        (Math.random() - 0.5) * 0.1
      );
      const particlePosition = this.position.clone().add(randomOffset);
      
      // Use thermal behavior for realistic properties
      const velocity = this.thermalBehavior.getEmissionVelocity();
      const life = this.thermalBehavior.getParticleLifetime();
      const size = this.thermalBehavior.getParticleSize();
      
      particles.push(new Particle(
        particlePosition,
        velocity,
        life,
        size,
        ParticleType.STEAM,
        this.temperature
      ));
    }
    
    return particles;
  }
  
  updateTemperature(temperature: number) {
    this.temperature = temperature;
    this.emissionRate = Math.max(0, (temperature - 70) * 2);
    this.thermalBehavior.updateTemperature(temperature);
  }
}

// Bubble generator for boiling effects
export class BubbleGenerator {
  position: THREE.Vector3;
  temperature: number;
  private bubbleTimer: number = 0;
  
  constructor(position: THREE.Vector3) {
    this.position = position.clone();
    this.temperature = 85;
  }
  
  generate(deltaTime: number): Particle[] {
    if (this.temperature < 90) return [];
    
    this.bubbleTimer += deltaTime;
    const bubbleInterval = 1.0 / Math.max(1, (this.temperature - 85) * 0.5);
    
    if (this.bubbleTimer < bubbleInterval) return [];
    
    this.bubbleTimer = 0;
    
    // Create bubble at random position near bottom
    const bubblePosition = this.position.clone().add(new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      -0.3 + Math.random() * 0.1,
      (Math.random() - 0.5) * 0.3
    ));
    
    const velocity = new THREE.Vector3(0, 0.08 + Math.random() * 0.02, 0);
    const life = 3 + Math.random() * 2;
    const size = 0.005 + Math.random() * 0.01;
    
    return [new Particle(bubblePosition, velocity, life, size, ParticleType.BUBBLE)];
  }
}

// Main particle system manager
export class AdvancedParticleSystem {
  private particles: Particle[] = [];
  private steamEmitters: SteamEmitter[] = [];
  private bubbleGenerators: BubbleGenerator[] = [];
  private particleGeometry: THREE.BufferGeometry;
  private particleMaterial: THREE.ShaderMaterial;
  private particleSystem: THREE.Points;
  private maxParticles: number = 5000;
  
  constructor(scene: THREE.Scene) {
    this.setupParticleSystem();
    scene.add(this.particleSystem);
  }
  
  private setupParticleSystem() {
    // Create geometry for particles
    this.particleGeometry = new THREE.BufferGeometry();
    
    // Initialize empty arrays
    const positions = new Float32Array(this.maxParticles * 3);
    const sizes = new Float32Array(this.maxParticles);
    const opacities = new Float32Array(this.maxParticles);
    const colors = new Float32Array(this.maxParticles * 3);
    
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create shader material for particles
    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.createParticleTexture() }
      }
    });
    
    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
  }
  
  private createParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d')!;
    
    // Create soft circular gradient
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
  
  private getVertexShader(): string {
    return `
      attribute float size;
      attribute float opacity;
      attribute vec3 color;
      
      varying float vOpacity;
      varying vec3 vColor;
      
      void main() {
        vOpacity = opacity;
        vColor = color;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
  }
  
  private getFragmentShader(): string {
    return `
      uniform sampler2D uTexture;
      
      varying float vOpacity;
      varying vec3 vColor;
      
      void main() {
        vec4 textureColor = texture2D(uTexture, gl_PointCoord);
        gl_FragColor = vec4(vColor, vOpacity) * textureColor;
      }
    `;
  }
  
  // Add steam emitter
  addSteamEmitter(position: THREE.Vector3, temperature: number) {
    this.steamEmitters.push(new SteamEmitter(position, temperature));
  }
  
  // Add bubble generator
  addBubbleGenerator(position: THREE.Vector3) {
    this.bubbleGenerators.push(new BubbleGenerator(position));
  }
  
  // Update particle system with advanced thermal behavior
  update(deltaTime: number, time: number, temperature: number, ambientTemp: number = 20, humidity: number = 0.5) {
    // Update emitters temperature
    this.steamEmitters.forEach(emitter => emitter.updateTemperature(temperature));
    this.bubbleGenerators.forEach(generator => generator.temperature = temperature);
    
    // Generate new particles
    this.steamEmitters.forEach(emitter => {
      const newParticles = emitter.emit(deltaTime);
      this.particles.push(...newParticles);
    });
    
    this.bubbleGenerators.forEach(generator => {
      const newBubbles = generator.generate(deltaTime);
      this.particles.push(...newBubbles);
    });
    
    // Update existing particles with thermal behavior
    const globalForces = [
      new THREE.Vector3(0, 0.01, 0), // Base buoyancy
      new THREE.Vector3(Math.sin(time) * 0.002, 0, Math.cos(time) * 0.002) // Air currents
    ];
    
    this.particles = this.particles.filter(particle => {
      // Apply basic forces
      particle.update(deltaTime, globalForces);
      
      // Apply thermal behavior for steam particles
      if (particle.type === ParticleType.STEAM) {
        // Find corresponding emitter to get thermal behavior
        const nearestEmitter = this.steamEmitters.reduce((closest, emitter) => {
          const distToCurrent = particle.position.distanceTo(emitter.position);
          const distToClosest = particle.position.distanceTo(closest.position);
          return distToCurrent < distToClosest ? emitter : closest;
        });
        
        if (nearestEmitter) {
          nearestEmitter.thermalBehavior.applyThermalForces(particle, ambientTemp, deltaTime);
        }
        
        // Temperature-based color changes
        const tempRatio = Math.max(0, Math.min(1, (particle.temperature - 70) / 30));
        particle.color.setRGB(
          0.9 + tempRatio * 0.1,  // Slightly more white when hot
          0.9 + tempRatio * 0.1,
          1.0 - tempRatio * 0.2   // Less blue when hot
        );
      }
      
      return !particle.isDead();
    });
    
    // Limit particle count
    if (this.particles.length > this.maxParticles) {
      this.particles = this.particles.slice(-this.maxParticles);
    }
    
    // Update geometry attributes
    this.updateGeometry();
    
    // Update shader uniforms
    this.particleMaterial.uniforms.uTime.value = time;
  }
  
  private updateGeometry() {
    const positions = this.particleGeometry.attributes.position.array as Float32Array;
    const sizes = this.particleGeometry.attributes.size.array as Float32Array;
    const opacities = this.particleGeometry.attributes.opacity.array as Float32Array;
    const colors = this.particleGeometry.attributes.color.array as Float32Array;
    
    // Clear arrays
    positions.fill(0);
    sizes.fill(0);
    opacities.fill(0);
    colors.fill(1);
    
    // Update with current particles
    for (let i = 0; i < Math.min(this.particles.length, this.maxParticles); i++) {
      const particle = this.particles[i];
      
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
      
      sizes[i] = particle.size * 100; // Scale for rendering
      opacities[i] = particle.opacity;
      
      colors[i * 3] = particle.color.r;
      colors[i * 3 + 1] = particle.color.g;
      colors[i * 3 + 2] = particle.color.b;
    }
    
    // Mark attributes as needing update
    this.particleGeometry.attributes.position.needsUpdate = true;
    this.particleGeometry.attributes.size.needsUpdate = true;
    this.particleGeometry.attributes.opacity.needsUpdate = true;
    this.particleGeometry.attributes.color.needsUpdate = true;
    
    // Update draw range
    this.particleGeometry.setDrawRange(0, Math.min(this.particles.length, this.maxParticles));
  }
  
  // Clean up resources
  dispose() {
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
  }
}