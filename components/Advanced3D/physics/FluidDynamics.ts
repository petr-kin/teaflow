import * as THREE from 'three';

// Fluid particle for pour simulation
export class FluidParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  mass: number;
  density: number;
  pressure: number;
  temperature: number;
  viscosity: number;
  life: number;
  maxLife: number;
  size: number;
  
  constructor(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    temperature: number = 85,
    mass: number = 1.0
  ) {
    this.position = position.clone();
    this.velocity = velocity.clone();
    this.acceleration = new THREE.Vector3(0, -9.81, 0); // Gravity
    this.mass = mass;
    this.density = 1000; // Water density kg/m³
    this.pressure = 0;
    this.temperature = temperature;
    this.viscosity = this.calculateViscosity(temperature);
    this.life = 5.0; // 5 seconds
    this.maxLife = 5.0;
    this.size = 0.02 + Math.random() * 0.01;
  }
  
  private calculateViscosity(temp: number): number {
    // Water viscosity decreases with temperature
    // At 20°C: 1.0 × 10⁻³ Pa·s, at 100°C: 0.28 × 10⁻³ Pa·s
    const tempC = temp;
    return 0.001 * Math.exp(-0.02 * (tempC - 20));
  }
  
  update(deltaTime: number, neighbors: FluidParticle[], forces: THREE.Vector3[]) {
    // Apply external forces
    this.acceleration.copy(new THREE.Vector3(0, -9.81, 0)); // Reset to gravity
    forces.forEach(force => this.acceleration.add(force));
    
    // Apply SPH (Smoothed Particle Hydrodynamics) forces
    this.applySPHForces(neighbors);
    
    // Viscosity damping
    const viscosityDamping = this.velocity.clone().multiplyScalar(-this.viscosity * 0.1);
    this.acceleration.add(viscosityDamping);
    
    // Integration
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Update life
    this.life -= deltaTime;
  }
  
  private applySPHForces(neighbors: FluidParticle[]) {
    if (neighbors.length === 0) return;
    
    const h = 0.1; // Smoothing radius
    let pressureForce = new THREE.Vector3(0, 0, 0);
    let viscosityForce = new THREE.Vector3(0, 0, 0);
    
    // Calculate density
    this.density = this.calculateDensity(neighbors, h);
    
    // Calculate pressure
    const restDensity = 1000;
    const gasConstant = 2000;
    this.pressure = gasConstant * (this.density - restDensity);
    
    neighbors.forEach(neighbor => {
      if (neighbor === this) return;
      
      const r = this.position.clone().sub(neighbor.position);
      const distance = r.length();
      
      if (distance < h && distance > 0) {
        const rNorm = r.normalize();
        
        // Pressure force
        const pressureGradient = this.splineGradient(distance, h);
        const pressureMagnitude = (this.pressure + neighbor.pressure) / (2 * neighbor.density);
        pressureForce.add(rNorm.clone().multiplyScalar(-pressureMagnitude * pressureGradient));
        
        // Viscosity force
        const velocityDiff = neighbor.velocity.clone().sub(this.velocity);
        const viscosityLaplacian = this.splineLaplacian(distance, h);
        viscosityForce.add(velocityDiff.multiplyScalar(this.viscosity * viscosityLaplacian / neighbor.density));
      }
    });
    
    this.acceleration.add(pressureForce);
    this.acceleration.add(viscosityForce);
  }
  
  private calculateDensity(neighbors: FluidParticle[], h: number): number {
    let density = 0;
    neighbors.forEach(neighbor => {
      const distance = this.position.distanceTo(neighbor.position);
      if (distance < h) {
        density += neighbor.mass * this.splineKernel(distance, h);
      }
    });
    return Math.max(density, 100); // Minimum density
  }
  
  private splineKernel(r: number, h: number): number {
    const q = r / h;
    if (q >= 2) return 0;
    if (q >= 1) return (315 / (64 * Math.PI * Math.pow(h, 9))) * Math.pow(2 - q, 3);
    return (315 / (64 * Math.PI * Math.pow(h, 9))) * (Math.pow(2 - q, 3) - 4 * Math.pow(1 - q, 3));
  }
  
  private splineGradient(r: number, h: number): number {
    const q = r / h;
    if (q >= 2) return 0;
    if (q >= 1) return (-945 / (32 * Math.PI * Math.pow(h, 9))) * Math.pow(2 - q, 2);
    return (-945 / (32 * Math.PI * Math.pow(h, 9))) * (Math.pow(2 - q, 2) - 2 * Math.pow(1 - q, 2));
  }
  
  private splineLaplacian(r: number, h: number): number {
    const q = r / h;
    if (q >= 2) return 0;
    if (q >= 1) return (945 / (32 * Math.PI * Math.pow(h, 9))) * (2 - q);
    return (945 / (32 * Math.PI * Math.pow(h, 9))) * (2 - q - 2 * (1 - q));
  }
  
  isDead(): boolean {
    return this.life <= 0;
  }
}

// Tea pour stream generator
export class TeaPourStream {
  private spoutPosition: THREE.Vector3;
  private targetPosition: THREE.Vector3;
  private flowRate: number; // particles per second
  private temperature: number;
  private particles: FluidParticle[] = [];
  private isPouring: boolean = false;
  private pourHeight: number;
  
  constructor(
    spoutPosition: THREE.Vector3,
    targetPosition: THREE.Vector3,
    temperature: number = 85
  ) {
    this.spoutPosition = spoutPosition.clone();
    this.targetPosition = targetPosition.clone();
    this.temperature = temperature;
    this.flowRate = 50; // particles per second
    this.pourHeight = Math.abs(spoutPosition.y - targetPosition.y);
  }
  
  startPouring() {
    this.isPouring = true;
  }
  
  stopPouring() {
    this.isPouring = false;
  }
  
  update(deltaTime: number): FluidParticle[] {
    if (this.isPouring) {
      this.generatePourParticles(deltaTime);
    }
    
    // Update existing particles
    const externalForces = [
      new THREE.Vector3(0, -9.81, 0), // Gravity
      new THREE.Vector3(Math.sin(Date.now() * 0.001) * 0.5, 0, 0) // Air resistance
    ];
    
    // Update particles with SPH
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const neighbors = this.findNeighbors(particle, 0.1);
      particle.update(deltaTime, neighbors, externalForces);
      
      // Surface tension and collision
      this.handleSurfaceCollision(particle);
    }
    
    // Remove dead particles
    this.particles = this.particles.filter(p => !p.isDead());
    
    return this.particles;
  }
  
  private generatePourParticles(deltaTime: number) {
    const particlesToGenerate = Math.floor(this.flowRate * deltaTime);
    
    for (let i = 0; i < particlesToGenerate; i++) {
      // Calculate initial velocity based on pour height and trajectory
      const direction = this.targetPosition.clone().sub(this.spoutPosition).normalize();
      const fallTime = Math.sqrt(2 * this.pourHeight / 9.81);
      const horizontalVelocity = direction.clone().multiplyScalar(
        this.spoutPosition.distanceTo(this.targetPosition) / fallTime
      );
      
      // Add some randomness to create natural stream spread
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.02
      );
      
      const velocity = new THREE.Vector3(
        horizontalVelocity.x + randomOffset.x,
        0.1 + Math.random() * 0.1, // Initial upward velocity
        horizontalVelocity.z + randomOffset.z
      );
      
      const particle = new FluidParticle(
        this.spoutPosition.clone().add(randomOffset),
        velocity,
        this.temperature
      );
      
      this.particles.push(particle);
    }
  }
  
  private findNeighbors(particle: FluidParticle, radius: number): FluidParticle[] {
    return this.particles.filter(p => 
      p !== particle && 
      particle.position.distanceTo(p.position) < radius
    );
  }
  
  private handleSurfaceCollision(particle: FluidParticle) {
    // Check collision with cup surface (assuming cup at target position)
    const cupRadius = 0.15;
    const cupHeight = 0.1;
    const cupCenter = this.targetPosition.clone();
    
    // Collision with cup bottom
    if (particle.position.y <= cupCenter.y && 
        particle.position.distanceTo(new THREE.Vector3(cupCenter.x, cupCenter.y, cupCenter.z)) < cupRadius) {
      
      // Splash effect
      if (particle.velocity.length() > 2) {
        this.createSplash(particle.position, particle.velocity);
      }
      
      // Bounce with energy loss
      particle.velocity.y = Math.abs(particle.velocity.y) * 0.3;
      particle.velocity.x *= 0.8;
      particle.velocity.z *= 0.8;
      particle.position.y = cupCenter.y + 0.001;
    }
    
    // Collision with cup walls
    const horizontalDistance = Math.sqrt(
      Math.pow(particle.position.x - cupCenter.x, 2) + 
      Math.pow(particle.position.z - cupCenter.z, 2)
    );
    
    if (horizontalDistance > cupRadius && 
        particle.position.y > cupCenter.y && 
        particle.position.y < cupCenter.y + cupHeight) {
      
      // Reflect off walls
      const normal = new THREE.Vector3(
        particle.position.x - cupCenter.x,
        0,
        particle.position.z - cupCenter.z
      ).normalize();
      
      particle.velocity.reflect(normal);
      particle.velocity.multiplyScalar(0.6); // Energy loss
      
      // Move particle outside wall
      particle.position.copy(cupCenter);
      particle.position.x += normal.x * cupRadius;
      particle.position.z += normal.z * cupRadius;
    }
  }
  
  private createSplash(position: THREE.Vector3, velocity: THREE.Vector3) {
    // Generate splash particles
    const splashParticles = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < splashParticles; i++) {
      const splashVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 3
      );
      
      const splashParticle = new FluidParticle(
        position.clone(),
        splashVelocity,
        this.temperature,
        0.5 // Smaller mass for splash droplets
      );
      
      splashParticle.life = 1.0; // Shorter life
      this.particles.push(splashParticle);
    }
  }
  
  getParticles(): FluidParticle[] {
    return this.particles;
  }
  
  setTemperature(temperature: number) {
    this.temperature = temperature;
    // Update viscosity for all existing particles
    this.particles.forEach(particle => {
      particle.temperature = temperature;
      particle.viscosity = particle['calculateViscosity'](temperature);
    });
  }
}

// Main fluid dynamics system
export class FluidDynamicsSystem {
  private teaPourStreams: TeaPourStream[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private fluidSystem: THREE.Points;
  private maxParticles: number = 2000;
  
  constructor(scene: THREE.Scene) {
    this.setupFluidRendering();
    scene.add(this.fluidSystem);
  }
  
  private setupFluidRendering() {
    this.geometry = new THREE.BufferGeometry();
    
    // Initialize buffer attributes
    const positions = new Float32Array(this.maxParticles * 3);
    const sizes = new Float32Array(this.maxParticles);
    const temperatures = new Float32Array(this.maxParticles);
    const velocities = new Float32Array(this.maxParticles * 3);
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('temperature', new THREE.BufferAttribute(temperatures, 1));
    this.geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    // Fluid particle shader
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.createFluidTexture() }
      },
      vertexShader: `
        attribute float size;
        attribute float temperature;
        attribute vec3 velocity;
        
        uniform float uTime;
        
        varying float vTemperature;
        varying vec3 vVelocity;
        varying float vLife;
        
        void main() {
          vTemperature = temperature;
          vVelocity = velocity;
          
          // Calculate life based on position and velocity
          vLife = 1.0 - (length(velocity) * 0.1);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Size based on temperature and velocity
          float dynamicSize = size * (0.5 + temperature / 200.0) * (0.8 + length(velocity) * 0.2);
          gl_PointSize = dynamicSize * (300.0 / -mvPosition.z);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        
        varying float vTemperature;
        varying vec3 vVelocity;
        varying float vLife;
        
        vec3 temperatureToColor(float temp) {
          // Hot tea colors
          vec3 coldColor = vec3(0.6, 0.8, 1.0);  // Cool blue
          vec3 warmColor = vec3(1.0, 0.9, 0.7);  // Warm white  
          vec3 hotColor = vec3(1.0, 0.6, 0.3);   // Hot orange
          
          float normalizedTemp = clamp((temp - 70.0) / 30.0, 0.0, 1.0);
          
          if (normalizedTemp < 0.5) {
            return mix(coldColor, warmColor, normalizedTemp * 2.0);
          } else {
            return mix(warmColor, hotColor, (normalizedTemp - 0.5) * 2.0);
          }
        }
        
        void main() {
          vec4 textureColor = texture2D(uTexture, gl_PointCoord);
          vec3 fluidColor = temperatureToColor(vTemperature);
          
          // Add motion blur effect based on velocity
          float motionIntensity = length(vVelocity) * 0.1;
          vec3 finalColor = mix(fluidColor, fluidColor * 1.5, motionIntensity);
          
          // Fade based on life
          float alpha = textureColor.a * vLife;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.fluidSystem = new THREE.Points(this.geometry, this.material);
  }
  
  private createFluidTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d')!;
    
    // Create liquid droplet texture
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
  
  createTeaPourStream(
    spoutPosition: THREE.Vector3,
    targetPosition: THREE.Vector3,
    temperature: number = 85
  ): TeaPourStream {
    const stream = new TeaPourStream(spoutPosition, targetPosition, temperature);
    this.teaPourStreams.push(stream);
    return stream;
  }
  
  update(deltaTime: number, time: number) {
    // Collect all particles from all streams
    const allParticles: FluidParticle[] = [];
    
    this.teaPourStreams.forEach(stream => {
      const streamParticles = stream.update(deltaTime);
      allParticles.push(...streamParticles);
    });
    
    // Update rendering buffers
    this.updateFluidGeometry(allParticles);
    
    // Update shader uniforms
    this.material.uniforms.uTime.value = time;
  }
  
  private updateFluidGeometry(particles: FluidParticle[]) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const sizes = this.geometry.attributes.size.array as Float32Array;
    const temperatures = this.geometry.attributes.temperature.array as Float32Array;
    const velocities = this.geometry.attributes.velocity.array as Float32Array;
    
    // Clear arrays
    positions.fill(0);
    sizes.fill(0);
    temperatures.fill(85);
    velocities.fill(0);
    
    // Update with current particles
    const particleCount = Math.min(particles.length, this.maxParticles);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = particles[i];
      
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
      
      sizes[i] = particle.size * 100;
      temperatures[i] = particle.temperature;
      
      velocities[i * 3] = particle.velocity.x;
      velocities[i * 3 + 1] = particle.velocity.y;
      velocities[i * 3 + 2] = particle.velocity.z;
    }
    
    // Mark attributes for update
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.temperature.needsUpdate = true;
    this.geometry.attributes.velocity.needsUpdate = true;
    
    // Set draw range
    this.geometry.setDrawRange(0, particleCount);
  }
  
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}