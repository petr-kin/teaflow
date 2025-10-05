import * as THREE from 'three';

// Different tea leaf types with unique properties
export enum TeaLeafType {
  GREEN = 'green',
  BLACK = 'black',
  WHITE = 'white',
  OOLONG = 'oolong',
  HERBAL = 'herbal'
}

// Individual tea leaf with realistic physics
export class TeaLeaf {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  rotation: THREE.Euler;
  angularVelocity: THREE.Vector3;
  
  size: THREE.Vector2; // Width x Height
  thickness: number;
  mass: number;
  buoyancy: number;
  dragCoefficient: number;
  
  type: TeaLeafType;
  color: THREE.Color;
  transparency: number;
  expansionFactor: number; // How much the leaf expands when steeping
  steepingTime: number;
  maxSteepingTime: number;
  
  isFloating: boolean;
  surfacePosition: number; // Y position of water surface
  
  constructor(
    position: THREE.Vector3,
    type: TeaLeafType = TeaLeafType.GREEN,
    surfacePosition: number = 0.5
  ) {
    this.position = position.clone();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    this.angularVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1
    );
    
    this.type = type;
    this.surfacePosition = surfacePosition;
    this.steepingTime = 0;
    this.expansionFactor = 1.0;
    
    // Set properties based on tea type
    this.setPropertiesFromType(type);
    
    this.isFloating = this.buoyancy > 0.5;
  }
  
  private setPropertiesFromType(type: TeaLeafType) {
    switch (type) {
      case TeaLeafType.GREEN:
        this.size = new THREE.Vector2(0.008, 0.012);
        this.thickness = 0.0002;
        this.mass = 0.001;
        this.buoyancy = 0.3; // Tends to sink
        this.dragCoefficient = 1.2;
        this.color = new THREE.Color(0.2, 0.6, 0.2);
        this.transparency = 0.2;
        this.maxSteepingTime = 180; // 3 minutes
        break;
        
      case TeaLeafType.BLACK:
        this.size = new THREE.Vector2(0.006, 0.010);
        this.thickness = 0.0001;
        this.mass = 0.0008;
        this.buoyancy = 0.7; // More likely to float
        this.dragCoefficient = 1.0;
        this.color = new THREE.Color(0.15, 0.1, 0.05);
        this.transparency = 0.1;
        this.maxSteepingTime = 240; // 4 minutes
        break;
        
      case TeaLeafType.WHITE:
        this.size = new THREE.Vector2(0.010, 0.015);
        this.thickness = 0.0003;
        this.mass = 0.0005;
        this.buoyancy = 0.8; // Very buoyant
        this.dragCoefficient = 1.5;
        this.color = new THREE.Color(0.8, 0.85, 0.7);
        this.transparency = 0.4;
        this.maxSteepingTime = 120; // 2 minutes
        break;
        
      case TeaLeafType.OOLONG:
        this.size = new THREE.Vector2(0.007, 0.011);
        this.thickness = 0.00025;
        this.mass = 0.0007;
        this.buoyancy = 0.5;
        this.dragCoefficient = 1.1;
        this.color = new THREE.Color(0.4, 0.3, 0.1);
        this.transparency = 0.15;
        this.maxSteepingTime = 300; // 5 minutes
        break;
        
      case TeaLeafType.HERBAL:
        this.size = new THREE.Vector2(0.005, 0.008);
        this.thickness = 0.0004;
        this.mass = 0.0003;
        this.buoyancy = 0.9; // Very light
        this.dragCoefficient = 2.0;
        this.color = new THREE.Color(0.6, 0.7, 0.3);
        this.transparency = 0.3;
        this.maxSteepingTime = 360; // 6 minutes
        break;
    }
  }
  
  update(
    deltaTime: number,
    temperature: number,
    convectionForces: THREE.Vector3[],
    neighbors: TeaLeaf[]
  ) {
    // Update steeping
    this.steepingTime += deltaTime;
    const steepingProgress = Math.min(this.steepingTime / this.maxSteepingTime, 1.0);
    
    // Leaf expansion during steeping
    this.expansionFactor = 1.0 + steepingProgress * 0.3;
    
    // Color change during steeping
    this.updateColorFromSteeping(steepingProgress, temperature);
    
    // Physics update
    this.updatePhysics(deltaTime, temperature, convectionForces, neighbors);
  }
  
  private updateColorFromSteeping(progress: number, temperature: number) {
    const baseColor = this.getBaseColor();
    const steepedColor = this.getSteepedColor();
    
    // Temperature affects steeping speed
    const tempFactor = Math.max(0.5, (temperature - 60) / 40); // 60-100°C range
    const adjustedProgress = Math.min(progress * tempFactor, 1.0);
    
    this.color.lerpColors(baseColor, steepedColor, adjustedProgress);
    
    // Transparency decreases as tea steeps (becomes more opaque)
    const baseTransparency = this.getBaseTransparency();
    this.transparency = baseTransparency * (1 - adjustedProgress * 0.5);
  }
  
  private getBaseColor(): THREE.Color {
    switch (this.type) {
      case TeaLeafType.GREEN: return new THREE.Color(0.2, 0.6, 0.2);
      case TeaLeafType.BLACK: return new THREE.Color(0.15, 0.1, 0.05);
      case TeaLeafType.WHITE: return new THREE.Color(0.8, 0.85, 0.7);
      case TeaLeafType.OOLONG: return new THREE.Color(0.4, 0.3, 0.1);
      case TeaLeafType.HERBAL: return new THREE.Color(0.6, 0.7, 0.3);
      default: return new THREE.Color(0.3, 0.5, 0.2);
    }
  }
  
  private getSteepedColor(): THREE.Color {
    switch (this.type) {
      case TeaLeafType.GREEN: return new THREE.Color(0.1, 0.3, 0.1);
      case TeaLeafType.BLACK: return new THREE.Color(0.08, 0.05, 0.02);
      case TeaLeafType.WHITE: return new THREE.Color(0.6, 0.65, 0.5);
      case TeaLeafType.OOLONG: return new THREE.Color(0.2, 0.15, 0.05);
      case TeaLeafType.HERBAL: return new THREE.Color(0.4, 0.5, 0.2);
      default: return new THREE.Color(0.15, 0.25, 0.1);
    }
  }
  
  private getBaseTransparency(): number {
    switch (this.type) {
      case TeaLeafType.GREEN: return 0.2;
      case TeaLeafType.BLACK: return 0.1;
      case TeaLeafType.WHITE: return 0.4;
      case TeaLeafType.OOLONG: return 0.15;
      case TeaLeafType.HERBAL: return 0.3;
      default: return 0.2;
    }
  }
  
  private updatePhysics(
    deltaTime: number,
    temperature: number,
    convectionForces: THREE.Vector3[],
    neighbors: TeaLeaf[]
  ) {
    // Reset acceleration
    this.acceleration.set(0, 0, 0);
    
    // Gravity vs buoyancy
    const netVerticalForce = -9.81 * (1 - this.buoyancy);
    this.acceleration.y += netVerticalForce;
    
    // Drag force (proportional to velocity squared)
    const dragMagnitude = this.velocity.lengthSq() * this.dragCoefficient * 0.1;
    if (this.velocity.length() > 0) {
      const dragDirection = this.velocity.clone().normalize().multiplyScalar(-1);
      this.acceleration.add(dragDirection.multiplyScalar(dragMagnitude));
    }
    
    // Convection forces from hot water
    convectionForces.forEach(force => {
      const tempFactor = (temperature - 60) / 40; // Stronger at higher temps
      this.acceleration.add(force.clone().multiplyScalar(tempFactor));
    });
    
    // Brownian motion (random thermal movement)
    const brownianIntensity = temperature / 1000;
    this.acceleration.add(new THREE.Vector3(
      (Math.random() - 0.5) * brownianIntensity,
      (Math.random() - 0.5) * brownianIntensity * 0.5,
      (Math.random() - 0.5) * brownianIntensity
    ));
    
    // Leaf-to-leaf interactions
    this.applyLeafInteractions(neighbors);
    
    // Integration
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    
    // Terminal velocity limit
    const terminalVelocity = 0.1;
    if (this.velocity.length() > terminalVelocity) {
      this.velocity.normalize().multiplyScalar(terminalVelocity);
    }
    
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Angular motion from fluid flow
    const flowTorque = new THREE.Vector3(
      this.velocity.z * 0.1,
      (this.velocity.x + this.velocity.z) * 0.05,
      -this.velocity.x * 0.1
    );
    this.angularVelocity.add(flowTorque.multiplyScalar(deltaTime));
    
    // Angular damping
    this.angularVelocity.multiplyScalar(0.95);
    
    // Update rotation
    this.rotation.x += this.angularVelocity.x * deltaTime;
    this.rotation.y += this.angularVelocity.y * deltaTime;
    this.rotation.z += this.angularVelocity.z * deltaTime;
    
    // Surface interaction
    this.handleSurfaceInteraction();
  }
  
  private applyLeafInteractions(neighbors: TeaLeaf[]) {
    neighbors.forEach(neighbor => {
      const distance = this.position.distanceTo(neighbor.position);
      const minDistance = (this.size.x + neighbor.size.x) / 2;
      
      if (distance < minDistance && distance > 0) {
        // Soft collision - leaves can overlap but push apart gently
        const direction = this.position.clone().sub(neighbor.position).normalize();
        const overlap = minDistance - distance;
        const pushForce = direction.multiplyScalar(overlap * 0.5);
        
        this.acceleration.add(pushForce);
        
        // Tangling effect - leaves can get caught together
        if (Math.random() < 0.01 && this.velocity.length() < 0.01) {
          // Slight attraction to create clusters
          this.acceleration.add(direction.multiplyScalar(-0.001));
        }
      }
    });
  }
  
  private handleSurfaceInteraction() {
    // Surface tension effects
    if (Math.abs(this.position.y - this.surfacePosition) < 0.005) {
      this.isFloating = true;
      
      // Keep floating leaves at surface
      if (this.buoyancy > 0.6) {
        this.position.y = this.surfacePosition;
        this.velocity.y *= 0.1; // Dampen vertical motion at surface
        
        // Surface tension creates slight inward force
        const centerDistance = Math.sqrt(this.position.x ** 2 + this.position.z ** 2);
        if (centerDistance > 0.1) {
          const inwardForce = new THREE.Vector3(-this.position.x, 0, -this.position.z)
            .normalize().multiplyScalar(0.001);
          this.acceleration.add(inwardForce);
        }
      }
    } else {
      this.isFloating = false;
    }
    
    // Container boundaries (cup walls)
    const cupRadius = 0.15;
    const cupCenter = new THREE.Vector3(0, 0, 0);
    const horizontalDistance = Math.sqrt(
      (this.position.x - cupCenter.x) ** 2 + (this.position.z - cupCenter.z) ** 2
    );
    
    if (horizontalDistance > cupRadius - this.size.x / 2) {
      // Reflect off cup walls
      const wallNormal = new THREE.Vector3(
        this.position.x - cupCenter.x,
        0,
        this.position.z - cupCenter.z
      ).normalize();
      
      // Soft collision with walls
      const penetration = horizontalDistance - (cupRadius - this.size.x / 2);
      if (penetration > 0) {
        this.position.add(wallNormal.clone().multiplyScalar(-penetration));
        
        // Dampen velocity component toward wall
        const velocityTowardWall = this.velocity.dot(wallNormal);
        if (velocityTowardWall > 0) {
          this.velocity.add(wallNormal.clone().multiplyScalar(-velocityTowardWall * 0.8));
        }
      }
    }
    
    // Bottom collision
    if (this.position.y < cupCenter.y + this.size.y / 2) {
      this.position.y = cupCenter.y + this.size.y / 2;
      this.velocity.y = Math.abs(this.velocity.y) * 0.3; // Soft bounce
    }
  }
}

// Swirling convection system
export class ConvectionSystem {
  private center: THREE.Vector3;
  private intensity: number;
  private temperature: number;
  private swirls: Array<{
    center: THREE.Vector3;
    radius: number;
    strength: number;
    rotationSpeed: number;
    phase: number;
  }> = [];
  
  constructor(center: THREE.Vector3) {
    this.center = center.clone();
    this.intensity = 1.0;
    this.temperature = 85;
    
    // Create multiple swirl centers for realistic convection
    this.initializeSwirls();
  }
  
  private initializeSwirls() {
    const swirlCount = 3;
    for (let i = 0; i < swirlCount; i++) {
      const angle = (i / swirlCount) * Math.PI * 2;
      const radius = 0.08 + Math.random() * 0.04;
      
      this.swirls.push({
        center: new THREE.Vector3(
          this.center.x + Math.cos(angle) * radius,
          this.center.y + (Math.random() - 0.5) * 0.02,
          this.center.z + Math.sin(angle) * radius
        ),
        radius: 0.05 + Math.random() * 0.03,
        strength: 0.5 + Math.random() * 0.3,
        rotationSpeed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
      });
    }
  }
  
  update(deltaTime: number, temperature: number) {
    this.temperature = temperature;
    this.intensity = Math.max(0, (temperature - 70) / 30); // Stronger at higher temps
    
    // Update swirl positions
    this.swirls.forEach((swirl, index) => {
      swirl.phase += swirl.rotationSpeed * deltaTime;
      
      // Slowly move swirls around
      const moveSpeed = 0.1;
      swirl.center.x += Math.sin(swirl.phase + index) * moveSpeed * deltaTime;
      swirl.center.z += Math.cos(swirl.phase + index * 1.5) * moveSpeed * deltaTime;
      
      // Keep swirls within bounds
      const distanceFromCenter = swirl.center.distanceTo(this.center);
      if (distanceFromCenter > 0.1) {
        const direction = this.center.clone().sub(swirl.center).normalize();
        swirl.center.add(direction.multiplyScalar(0.01));
      }
    });
  }
  
  getConvectionForces(position: THREE.Vector3): THREE.Vector3[] {
    const forces: THREE.Vector3[] = [];
    
    // Global upward convection
    const globalUpward = new THREE.Vector3(0, this.intensity * 0.001, 0);
    forces.push(globalUpward);
    
    // Local swirl forces
    this.swirls.forEach(swirl => {
      const distance = position.distanceTo(swirl.center);
      
      if (distance < swirl.radius) {
        // Circular flow around swirl center
        const direction = position.clone().sub(swirl.center);
        direction.y = 0; // Only horizontal circulation
        
        if (direction.length() > 0) {
          direction.normalize();
          
          // Rotate 90 degrees for circulation
          const circulation = new THREE.Vector3(-direction.z, 0, direction.x);
          
          // Strength falls off with distance
          const strengthFactor = 1 - (distance / swirl.radius);
          const forceStrength = swirl.strength * strengthFactor * this.intensity;
          
          circulation.multiplyScalar(forceStrength * 0.005);
          forces.push(circulation);
          
          // Add slight upward force in center of swirls
          if (distance < swirl.radius * 0.3) {
            const upwardForce = new THREE.Vector3(0, forceStrength * 0.002, 0);
            forces.push(upwardForce);
          }
        }
      }
    });
    
    return forces;
  }
}

// Main tea leaf simulation system
export class TeaLeafSimulation {
  private leaves: TeaLeaf[] = [];
  private convectionSystem: ConvectionSystem;
  private geometry: THREE.InstancedBufferGeometry;
  private material: THREE.ShaderMaterial;
  private leafMesh: THREE.InstancedMesh;
  private maxLeaves: number = 200;
  
  constructor(scene: THREE.Scene, cupCenter: THREE.Vector3) {
    this.convectionSystem = new ConvectionSystem(cupCenter);
    
    this.setupLeafRendering();
    scene.add(this.leafMesh);
    
    // Initialize with some tea leaves
    this.initializeTeaLeaves(cupCenter);
  }
  
  private setupLeafRendering() {
    // Create leaf geometry (elliptical flat shape)
    const baseGeometry = new THREE.PlaneGeometry(0.008, 0.012);
    
    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.copy(baseGeometry);
    
    // Instance attributes
    const positions = new Float32Array(this.maxLeaves * 3);
    const rotations = new Float32Array(this.maxLeaves * 4);
    const scales = new Float32Array(this.maxLeaves * 3);
    const colors = new Float32Array(this.maxLeaves * 3);
    const transparencies = new Float32Array(this.maxLeaves);
    
    this.geometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(positions, 3));
    this.geometry.setAttribute('instanceRotation', new THREE.InstancedBufferAttribute(rotations, 4));
    this.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 3));
    this.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
    this.geometry.setAttribute('instanceTransparency', new THREE.InstancedBufferAttribute(transparencies, 1));
    
    // Tea leaf shader
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLeafTexture: { value: this.createLeafTexture() }
      },
      vertexShader: `
        attribute vec3 instancePosition;
        attribute vec4 instanceRotation;
        attribute vec3 instanceScale;
        attribute vec3 instanceColor;
        attribute float instanceTransparency;
        
        varying vec3 vColor;
        varying float vTransparency;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        vec3 applyQuaternionToVector(vec4 q, vec3 v) {
          return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
        }
        
        void main() {
          vColor = instanceColor;
          vTransparency = instanceTransparency;
          vUv = uv;
          
          // Apply instance transformations
          vec3 scaledPosition = position * instanceScale;
          vec3 rotatedPosition = applyQuaternionToVector(instanceRotation, scaledPosition);
          vec3 worldPosition = rotatedPosition + instancePosition;
          
          // Transform normal
          vNormal = normalize(applyQuaternionToVector(instanceRotation, normal));
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform sampler2D uLeafTexture;
        
        varying vec3 vColor;
        varying float vTransparency;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          // Sample leaf texture
          vec4 leafTexture = texture2D(uLeafTexture, vUv);
          
          // Basic lighting
          vec3 lightDir = normalize(vec3(5.0, 10.0, 5.0));
          float lighting = max(dot(vNormal, lightDir), 0.3);
          
          // Apply color and lighting
          vec3 finalColor = vColor * lighting;
          
          // Add subtle translucency effect
          float backLighting = max(dot(vNormal, -lightDir), 0.0);
          finalColor += vColor * backLighting * 0.3;
          
          // Combine with texture
          finalColor *= leafTexture.rgb;
          
          float alpha = leafTexture.a * (1.0 - vTransparency);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.1
    });
    
    this.leafMesh = new THREE.InstancedMesh(this.geometry, this.material, this.maxLeaves);
  }
  
  private createLeafTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d')!;
    
    // Create leaf shape
    context.fillStyle = 'white';
    context.fillRect(0, 0, 64, 64);
    
    // Leaf outline
    context.fillStyle = 'rgba(255, 255, 255, 0)';
    context.globalCompositeOperation = 'destination-out';
    
    // Create leaf-like shape
    context.beginPath();
    context.ellipse(32, 32, 28, 20, 0, 0, Math.PI * 2);
    context.fill();
    
    // Add leaf veins
    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    context.lineWidth = 1;
    
    // Central vein
    context.beginPath();
    context.moveTo(32, 12);
    context.lineTo(32, 52);
    context.stroke();
    
    // Side veins
    for (let i = 0; i < 6; i++) {
      const y = 16 + i * 6;
      context.beginPath();
      context.moveTo(32, y);
      context.lineTo(16 + i * 2, y + 8);
      context.moveTo(32, y);
      context.lineTo(48 - i * 2, y + 8);
      context.stroke();
    }
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
  
  private initializeTeaLeaves(cupCenter: THREE.Vector3) {
    const leafTypes = [TeaLeafType.GREEN, TeaLeafType.BLACK, TeaLeafType.OOLONG];
    const leafCount = 50;
    
    for (let i = 0; i < leafCount; i++) {
      const leafType = leafTypes[Math.floor(Math.random() * leafTypes.length)];
      
      // Random position in cup
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.12; // Within cup radius
      const height = cupCenter.y + Math.random() * 0.15;
      
      const position = new THREE.Vector3(
        cupCenter.x + Math.cos(angle) * radius,
        height,
        cupCenter.z + Math.sin(angle) * radius
      );
      
      const leaf = new TeaLeaf(position, leafType, cupCenter.y + 0.1);
      this.leaves.push(leaf);
    }
  }
  
  update(deltaTime: number, time: number, temperature: number) {
    // Update convection system
    this.convectionSystem.update(deltaTime, temperature);
    
    // Update all tea leaves
    this.leaves.forEach(leaf => {
      const convectionForces = this.convectionSystem.getConvectionForces(leaf.position);
      const neighbors = this.findNearbyLeaves(leaf, 0.02);
      
      leaf.update(deltaTime, temperature, convectionForces, neighbors);
    });
    
    // Update rendering
    this.updateInstancedMesh();
    
    // Update shader uniforms
    this.material.uniforms.uTime.value = time;
  }
  
  private findNearbyLeaves(leaf: TeaLeaf, radius: number): TeaLeaf[] {
    return this.leaves.filter(other => 
      other !== leaf && 
      leaf.position.distanceTo(other.position) < radius
    );
  }
  
  private updateInstancedMesh() {
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    
    for (let i = 0; i < this.maxLeaves; i++) {
      if (i < this.leaves.length) {
        const leaf = this.leaves[i];
        
        // Set rotation
        quaternion.setFromEuler(leaf.rotation);
        
        // Set scale (with expansion factor)
        const scaleX = (leaf.size.x / 0.008) * leaf.expansionFactor;
        const scaleY = (leaf.size.y / 0.012) * leaf.expansionFactor;
        scale.set(scaleX, scaleY, 1);
        
        // Compose matrix
        matrix.compose(leaf.position, quaternion, scale);
        
        this.leafMesh.setMatrixAt(i, matrix);
        this.leafMesh.setColorAt(i, leaf.color);
      } else {
        // Hide unused instances
        matrix.makeScale(0, 0, 0);
        this.leafMesh.setMatrixAt(i, matrix);
      }
    }
    
    this.leafMesh.instanceMatrix.needsUpdate = true;
    if (this.leafMesh.instanceColor) {
      this.leafMesh.instanceColor.needsUpdate = true;
    }
  }
  
  // Add new tea leaves during brewing
  addTeaLeaves(count: number, type: TeaLeafType, cupCenter: THREE.Vector3) {
    for (let i = 0; i < count && this.leaves.length < this.maxLeaves; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.12;
      const height = cupCenter.y + Math.random() * 0.15;
      
      const position = new THREE.Vector3(
        cupCenter.x + Math.cos(angle) * radius,
        height,
        cupCenter.z + Math.sin(angle) * radius
      );
      
      const leaf = new TeaLeaf(position, type, cupCenter.y + 0.1);
      this.leaves.push(leaf);
    }
  }
  
  // Get brewing statistics
  getBrewingStats() {
    const totalLeaves = this.leaves.length;
    const floatingLeaves = this.leaves.filter(leaf => leaf.isFloating).length;
    const sunkLeaves = totalLeaves - floatingLeaves;
    
    const avgSteepingTime = this.leaves.reduce((sum, leaf) => sum + leaf.steepingTime, 0) / totalLeaves;
    const avgExpansion = this.leaves.reduce((sum, leaf) => sum + leaf.expansionFactor, 0) / totalLeaves;
    
    return {
      totalLeaves,
      floatingLeaves,
      sunkLeaves,
      avgSteepingTime,
      avgExpansion,
      brewingProgress: Math.min(avgSteepingTime / 180, 1) // Assume 3 min average
    };
  }
  
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}