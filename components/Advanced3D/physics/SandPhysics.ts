import * as THREE from 'three';

// Individual sand grain with realistic physics
export class SandGrain {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  rotation: THREE.Euler;
  mass: number;
  radius: number;
  friction: number;
  restitution: number;
  color: THREE.Color;
  isStatic: boolean;
  age: number;
  
  constructor(position: THREE.Vector3, radius: number = 0.001) {
    this.position = position.clone();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, -9.81, 0); // Gravity
    this.angularVelocity = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    
    this.radius = radius + (Math.random() - 0.5) * radius * 0.3; // Size variation
    this.mass = (4/3) * Math.PI * Math.pow(this.radius, 3) * 2650; // Quartz density
    this.friction = 0.7 + Math.random() * 0.2;
    this.restitution = 0.1 + Math.random() * 0.1;
    
    // Realistic sand colors
    const sandColors = [
      new THREE.Color(0.96, 0.87, 0.70), // Light beige
      new THREE.Color(0.89, 0.78, 0.62), // Medium sand
      new THREE.Color(0.82, 0.71, 0.55), // Darker sand
      new THREE.Color(0.94, 0.85, 0.68), // Light yellow
      new THREE.Color(0.87, 0.76, 0.59)  // Brown sand
    ];
    this.color = sandColors[Math.floor(Math.random() * sandColors.length)];
    
    this.isStatic = false;
    this.age = 0;
  }
  
  update(deltaTime: number, neighbors: SandGrain[], containerBounds: THREE.Box3) {
    if (this.isStatic) return;
    
    this.age += deltaTime;
    
    // Reset acceleration to gravity
    this.acceleration.copy(new THREE.Vector3(0, -9.81, 0));
    
    // Apply forces from neighboring grains
    this.applyGranularForces(neighbors);
    
    // Air resistance (minimal for sand)
    const airResistance = this.velocity.clone().multiplyScalar(-0.1);
    this.acceleration.add(airResistance.divideScalar(this.mass));
    
    // Integration
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Angular motion
    this.angularVelocity.multiplyScalar(0.98); // Angular friction
    this.rotation.x += this.angularVelocity.x * deltaTime;
    this.rotation.y += this.angularVelocity.y * deltaTime;
    this.rotation.z += this.angularVelocity.z * deltaTime;
    
    // Container collisions
    this.handleContainerCollisions(containerBounds);
    
    // Static threshold - stop very slow grains
    if (this.velocity.length() < 0.001 && this.acceleration.length() < 0.1) {
      this.velocity.set(0, 0, 0);
      this.angularVelocity.set(0, 0, 0);
      
      // Become static if settled for a while
      if (this.age > 2.0) {
        this.isStatic = true;
      }
    }
  }
  
  private applyGranularForces(neighbors: SandGrain[]) {
    neighbors.forEach(neighbor => {
      if (neighbor === this) return;
      
      const distance = this.position.distanceTo(neighbor.position);
      const minDistance = this.radius + neighbor.radius;
      
      if (distance < minDistance && distance > 0) {
        // Collision normal
        const normal = this.position.clone().sub(neighbor.position).normalize();
        
        // Overlap amount
        const overlap = minDistance - distance;
        
        // Contact force (Hertzian contact model)
        const contactStiffness = 1000;
        const normalForce = contactStiffness * overlap;
        
        // Apply normal force
        const force = normal.clone().multiplyScalar(normalForce / this.mass);
        this.acceleration.add(force);
        
        // Friction force
        const relativeVelocity = this.velocity.clone().sub(neighbor.velocity);
        const tangentialVelocity = relativeVelocity.clone().sub(
          normal.clone().multiplyScalar(relativeVelocity.dot(normal))
        );
        
        if (tangentialVelocity.length() > 0) {
          const frictionForce = tangentialVelocity.normalize()
            .multiplyScalar(-this.friction * normalForce / this.mass);
          this.acceleration.add(frictionForce);
        }
        
        // Apply angular impulse from collision
        const contactPoint = normal.clone().multiplyScalar(this.radius);
        const angularImpulse = contactPoint.cross(force).multiplyScalar(deltaTime);
        this.angularVelocity.add(angularImpulse);
        
        // Separate overlapping particles
        this.position.add(normal.clone().multiplyScalar(overlap * 0.5));
      }
    });
  }
  
  private handleContainerCollisions(bounds: THREE.Box3) {
    // Bottom collision
    if (this.position.y - this.radius < bounds.min.y) {
      this.position.y = bounds.min.y + this.radius;
      this.velocity.y = -this.velocity.y * this.restitution;
      
      // Friction with ground
      this.velocity.x *= (1 - this.friction * 0.1);
      this.velocity.z *= (1 - this.friction * 0.1);
      
      // Angular effects from ground contact
      this.angularVelocity.x += this.velocity.z * 0.1;
      this.angularVelocity.z -= this.velocity.x * 0.1;
    }
    
    // Side collisions (for hourglass walls)
    const centerX = (bounds.min.x + bounds.max.x) / 2;
    const centerZ = (bounds.min.z + bounds.max.z) / 2;
    const horizontalDistance = Math.sqrt(
      Math.pow(this.position.x - centerX, 2) + 
      Math.pow(this.position.z - centerZ, 2)
    );
    
    // Hourglass shape collision (narrowing in the middle)
    const hourglassRadius = this.getHourglassRadius(this.position.y, bounds);
    
    if (horizontalDistance + this.radius > hourglassRadius) {
      // Calculate wall normal
      const wallNormal = new THREE.Vector3(
        this.position.x - centerX,
        0,
        this.position.z - centerZ
      ).normalize();
      
      // Move particle inside bounds
      this.position.x = centerX + wallNormal.x * (hourglassRadius - this.radius);
      this.position.z = centerZ + wallNormal.z * (hourglassRadius - this.radius);
      
      // Reflect velocity
      const velocityNormal = wallNormal.dot(this.velocity);
      if (velocityNormal < 0) {
        this.velocity.sub(wallNormal.clone().multiplyScalar(velocityNormal * (1 + this.restitution)));
      }
    }
  }
  
  private getHourglassRadius(y: number, bounds: THREE.Box3): number {
    const height = bounds.max.y - bounds.min.y;
    const maxRadius = (bounds.max.x - bounds.min.x) / 2;
    const minRadius = maxRadius * 0.1; // Narrow neck
    
    const normalizedY = (y - bounds.min.y) / height;
    
    // Hourglass shape: wide at top and bottom, narrow in middle
    if (normalizedY < 0.4) {
      // Bottom section
      const t = normalizedY / 0.4;
      return THREE.MathUtils.lerp(maxRadius, minRadius, 1 - t);
    } else if (normalizedY > 0.6) {
      // Top section
      const t = (normalizedY - 0.6) / 0.4;
      return THREE.MathUtils.lerp(minRadius, maxRadius, t);
    } else {
      // Neck section
      return minRadius;
    }
  }
}

// Angle of repose calculator for realistic sand piles
export class AngleOfRepose {
  static calculate(grainSize: number, friction: number): number {
    // Typical sand angle of repose is 30-35 degrees
    const baseAngle = 32; // degrees
    const sizeEffect = Math.log(grainSize * 1000) * 2; // Smaller grains = steeper angles
    const frictionEffect = friction * 10;
    
    return THREE.MathUtils.degToRad(baseAngle + sizeEffect + frictionEffect);
  }
  
  static checkStability(grain: SandGrain, surface: THREE.Vector3): boolean {
    const maxAngle = this.calculate(grain.radius, grain.friction);
    const surfaceAngle = Math.acos(surface.dot(new THREE.Vector3(0, 1, 0)));
    
    return surfaceAngle <= maxAngle;
  }
}

// Flow control for hourglass neck
export class FlowController {
  private neckPosition: THREE.Vector3;
  private neckRadius: number;
  private flowRate: number;
  private jamProbability: number;
  private isJammed: boolean = false;
  private jamTimer: number = 0;
  
  constructor(neckPosition: THREE.Vector3, neckRadius: number) {
    this.neckPosition = neckPosition.clone();
    this.neckRadius = neckRadius;
    this.flowRate = 0.8; // Flow efficiency
    this.jamProbability = 0.001; // Chance per frame
  }
  
  update(deltaTime: number, nearbyGrains: SandGrain[]) {
    if (this.isJammed) {
      this.jamTimer += deltaTime;
      
      // Unjam after some time or if disturbed
      if (this.jamTimer > 2.0 || Math.random() < 0.01) {
        this.isJammed = false;
        this.jamTimer = 0;
      }
      
      return; // Stop flow while jammed
    }
    
    // Check for jamming
    if (Math.random() < this.jamProbability) {
      const grainsInNeck = nearbyGrains.filter(grain => 
        grain.position.distanceTo(this.neckPosition) < this.neckRadius * 2
      );
      
      if (grainsInNeck.length > 3) {
        this.isJammed = true;
        // Stop grains in neck
        grainsInNeck.forEach(grain => {
          grain.velocity.multiplyScalar(0.1);
          grain.isStatic = true;
        });
      }
    }
    
    // Apply flow forces to grains near neck
    nearbyGrains.forEach(grain => {
      const distanceToNeck = grain.position.distanceTo(this.neckPosition);
      
      if (distanceToNeck < this.neckRadius * 3) {
        // Create flow field toward neck
        const flowDirection = this.neckPosition.clone().sub(grain.position).normalize();
        const flowStrength = (1 - distanceToNeck / (this.neckRadius * 3)) * this.flowRate;
        
        const flowForce = flowDirection.multiplyScalar(flowStrength * 2);
        grain.acceleration.add(flowForce);
        
        // Reduce static state near flow
        if (grain.isStatic && flowStrength > 0.3) {
          grain.isStatic = false;
          grain.age = 0; // Reset aging
        }
      }
    });
  }
  
  getFlowRate(): number {
    return this.isJammed ? 0 : this.flowRate;
  }
  
  forceUnjam() {
    this.isJammed = false;
    this.jamTimer = 0;
  }
}

// Main sand physics system
export class SandPhysicsSystem {
  private grains: SandGrain[] = [];
  private flowController: FlowController;
  private containerBounds: THREE.Box3;
  private geometry: THREE.InstancedBufferGeometry;
  private material: THREE.ShaderMaterial;
  private sandMesh: THREE.InstancedMesh;
  private maxGrains: number = 5000;
  
  constructor(scene: THREE.Scene, hourglassHeight: number = 1, hourglassRadius: number = 0.3) {
    this.containerBounds = new THREE.Box3(
      new THREE.Vector3(-hourglassRadius, 0, -hourglassRadius),
      new THREE.Vector3(hourglassRadius, hourglassHeight, hourglassRadius)
    );
    
    const neckPosition = new THREE.Vector3(0, hourglassHeight / 2, 0);
    this.flowController = new FlowController(neckPosition, hourglassRadius * 0.1);
    
    this.setupSandRendering();
    scene.add(this.sandMesh);
    
    // Initialize with sand grains
    this.initializeSand();
  }
  
  private setupSandRendering() {
    // Base sphere geometry for sand grains
    const baseGeometry = new THREE.SphereGeometry(0.001, 8, 6);
    
    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.copy(baseGeometry);
    
    // Instance attributes
    const positions = new Float32Array(this.maxGrains * 3);
    const rotations = new Float32Array(this.maxGrains * 4); // Quaternions
    const scales = new Float32Array(this.maxGrains * 3);
    const colors = new Float32Array(this.maxGrains * 3);
    
    this.geometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(positions, 3));
    this.geometry.setAttribute('instanceRotation', new THREE.InstancedBufferAttribute(rotations, 4));
    this.geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 3));
    this.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
    
    // Sand grain shader
    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute vec3 instancePosition;
        attribute vec4 instanceRotation;
        attribute vec3 instanceScale;
        attribute vec3 instanceColor;
        
        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        vec3 applyQuaternionToVector(vec4 q, vec3 v) {
          return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
        }
        
        void main() {
          vColor = instanceColor;
          
          // Apply instance transformations
          vec3 scaledPosition = position * instanceScale;
          vec3 rotatedPosition = applyQuaternionToVector(instanceRotation, scaledPosition);
          vec3 worldPosition = rotatedPosition + instancePosition;
          
          // Transform normal
          vNormal = normalize(applyQuaternionToVector(instanceRotation, normal));
          vPosition = worldPosition;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPosition, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Basic lighting
          vec3 lightDir = normalize(vec3(5.0, 10.0, 5.0) - vPosition);
          float lighting = max(dot(vNormal, lightDir), 0.2);
          
          // Subtle ambient occlusion based on position
          float ao = 1.0 - clamp(vPosition.y * 0.1, 0.0, 0.3);
          
          // Final color with realistic sand shading
          vec3 finalColor = vColor * lighting * ao;
          
          // Add subtle grain texture
          float noise = fract(sin(dot(vPosition.xz, vec2(12.9898, 78.233))) * 43758.5453);
          finalColor += (noise - 0.5) * 0.05;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
    
    this.sandMesh = new THREE.InstancedMesh(this.geometry, this.material, this.maxGrains);
  }
  
  private initializeSand() {
    // Fill top half of hourglass with sand
    const topY = this.containerBounds.max.y * 0.8;
    const bottomY = this.containerBounds.max.y * 0.5;
    const maxRadius = (this.containerBounds.max.x - this.containerBounds.min.x) / 2;
    
    for (let i = 0; i < this.maxGrains && this.grains.length < this.maxGrains * 0.7; i++) {
      const y = bottomY + Math.random() * (topY - bottomY);
      const radius = this.getHourglassRadius(y) * 0.9; // Stay within bounds
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      
      const position = new THREE.Vector3(
        Math.cos(angle) * distance,
        y,
        Math.sin(angle) * distance
      );
      
      const grainRadius = 0.0008 + Math.random() * 0.0004;
      const grain = new SandGrain(position, grainRadius);
      
      // Slight initial velocity for natural settling
      grain.velocity.set(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      );
      
      this.grains.push(grain);
    }
  }
  
  private getHourglassRadius(y: number): number {
    const height = this.containerBounds.max.y - this.containerBounds.min.y;
    const maxRadius = (this.containerBounds.max.x - this.containerBounds.min.x) / 2;
    const minRadius = maxRadius * 0.1;
    
    const normalizedY = (y - this.containerBounds.min.y) / height;
    
    if (normalizedY < 0.4) {
      const t = normalizedY / 0.4;
      return THREE.MathUtils.lerp(maxRadius, minRadius, 1 - t);
    } else if (normalizedY > 0.6) {
      const t = (normalizedY - 0.6) / 0.4;
      return THREE.MathUtils.lerp(minRadius, maxRadius, t);
    } else {
      return minRadius;
    }
  }
  
  update(deltaTime: number) {
    // Update flow controller
    this.flowController.update(deltaTime, this.grains);
    
    // Update all sand grains
    for (let i = 0; i < this.grains.length; i++) {
      const grain = this.grains[i];
      const neighbors = this.findNeighbors(grain, grain.radius * 4);
      grain.update(deltaTime, neighbors, this.containerBounds);
    }
    
    // Update rendering
    this.updateInstancedMesh();
  }
  
  private findNeighbors(grain: SandGrain, radius: number): SandGrain[] {
    return this.grains.filter(other => 
      other !== grain && 
      grain.position.distanceTo(other.position) < radius
    );
  }
  
  private updateInstancedMesh() {
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    
    for (let i = 0; i < this.maxGrains; i++) {
      if (i < this.grains.length) {
        const grain = this.grains[i];
        
        // Set position
        matrix.setPosition(grain.position);
        
        // Set rotation
        quaternion.setFromEuler(grain.rotation);
        
        // Set scale
        const scaleValue = grain.radius / 0.001; // Base radius is 0.001
        scale.set(scaleValue, scaleValue, scaleValue);
        
        // Compose matrix
        matrix.compose(grain.position, quaternion, scale);
        
        this.sandMesh.setMatrixAt(i, matrix);
        this.sandMesh.setColorAt(i, grain.color);
      } else {
        // Hide unused instances
        matrix.makeScale(0, 0, 0);
        this.sandMesh.setMatrixAt(i, matrix);
      }
    }
    
    this.sandMesh.instanceMatrix.needsUpdate = true;
    if (this.sandMesh.instanceColor) {
      this.sandMesh.instanceColor.needsUpdate = true;
    }
  }
  
  // Shake the hourglass to unjam flow
  shake(intensity: number = 1) {
    this.flowController.forceUnjam();
    
    this.grains.forEach(grain => {
      if (grain.isStatic) {
        grain.isStatic = false;
        grain.age = 0;
      }
      
      // Add random impulse
      grain.velocity.add(new THREE.Vector3(
        (Math.random() - 0.5) * intensity * 0.1,
        Math.random() * intensity * 0.05,
        (Math.random() - 0.5) * intensity * 0.1
      ));
    });
  }
  
  // Get flow statistics
  getFlowStats() {
    const movingGrains = this.grains.filter(grain => !grain.isStatic).length;
    const staticGrains = this.grains.length - movingGrains;
    const flowRate = this.flowController.getFlowRate();
    
    return {
      totalGrains: this.grains.length,
      movingGrains,
      staticGrains,
      flowRate,
      isJammed: flowRate === 0
    };
  }
  
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}