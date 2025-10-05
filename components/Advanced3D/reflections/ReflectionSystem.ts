import * as THREE from 'three';

// Real-time reflection probe for environment mapping
export class ReflectionProbe {
  private cubeCamera: THREE.CubeCamera;
  private cubeRenderTarget: THREE.WebGLCubeRenderTarget;
  private position: THREE.Vector3;
  private updateFrequency: number;
  private lastUpdate: number = 0;
  
  constructor(
    position: THREE.Vector3,
    resolution: number = 256,
    updateFrequency: number = 60 // Updates per second
  ) {
    this.position = position.clone();
    this.updateFrequency = updateFrequency;
    
    // Create cube render target
    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(resolution, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter
    });
    
    // Create cube camera
    this.cubeCamera = new THREE.CubeCamera(0.1, 1000, this.cubeRenderTarget);
    this.cubeCamera.position.copy(this.position);
  }
  
  update(renderer: THREE.WebGLRenderer, scene: THREE.Scene, deltaTime: number): boolean {
    this.lastUpdate += deltaTime * 1000;
    
    if (this.lastUpdate < 1000 / this.updateFrequency) {
      return false;
    }
    
    this.lastUpdate = 0;
    
    // Update cube camera and render
    this.cubeCamera.position.copy(this.position);
    this.cubeCamera.update(renderer, scene);
    
    return true;
  }
  
  getEnvironmentMap(): THREE.CubeTexture {
    return this.cubeRenderTarget.texture;
  }
  
  setPosition(position: THREE.Vector3) {
    this.position.copy(position);
  }
  
  dispose() {
    this.cubeRenderTarget.dispose();
  }
}

// Advanced material with real-time reflections
export class ReflectiveMaterial extends THREE.MeshStandardMaterial {
  private reflectionProbe?: ReflectionProbe;
  private customUniforms: { [key: string]: THREE.IUniform } = {};
  
  constructor(
    parameters: THREE.MeshStandardMaterialParameters = {},
    reflectionProbe?: ReflectionProbe
  ) {
    super(parameters);
    
    this.reflectionProbe = reflectionProbe;
    
    // Custom uniforms for advanced reflection
    this.customUniforms = {
      uReflectionStrength: { value: 0.8 },
      uFresnelPower: { value: 2.0 },
      uRoughnessFactor: { value: 0.1 },
      uMetallicFactor: { value: 0.9 },
      uEnvironmentIntensity: { value: 1.0 },
      uReflectionBlur: { value: 0.0 },
      uTime: { value: 0.0 }
    };
    
    // Override shader to include custom reflection
    this.onBeforeCompile = (shader) => {
      // Add custom uniforms
      Object.keys(this.customUniforms).forEach(key => {
        shader.uniforms[key] = this.customUniforms[key];
      });
      
      // Modify vertex shader
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        `
      );
      
      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        vWorldPosition = worldPosition.xyz;
        vWorldNormal = normalize(transformedNormal);
        vViewDirection = normalize(cameraPosition - worldPosition.xyz);
        `
      );
      
      // Modify fragment shader
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
        #include <common>
        
        uniform float uReflectionStrength;
        uniform float uFresnelPower;
        uniform float uRoughnessFactor;
        uniform float uMetallicFactor;
        uniform float uEnvironmentIntensity;
        uniform float uReflectionBlur;
        uniform float uTime;
        
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        
        // Advanced Fresnel calculation
        float calculateFresnel(vec3 normal, vec3 viewDir, float power, float bias) {
          float facing = dot(normal, viewDir);
          return bias + (1.0 - bias) * pow(1.0 - facing, power);
        }
        
        // Roughness-based environment sampling
        vec3 sampleEnvironmentLOD(samplerCube envMap, vec3 reflectDir, float roughness) {
          float lod = roughness * 8.0; // Assuming 8 mip levels
          return textureCubeLodEXT(envMap, reflectDir, lod).rgb;
        }
        
        // Parallax-corrected reflection
        vec3 parallaxCorrectReflection(vec3 reflectDir, vec3 worldPos, vec3 probePos, vec3 boxMin, vec3 boxMax) {
          vec3 firstPlaneIntersect = (boxMax - worldPos) / reflectDir;
          vec3 secondPlaneIntersect = (boxMin - worldPos) / reflectDir;
          
          vec3 furthestPlane = max(firstPlaneIntersect, secondPlaneIntersect);
          float distance = min(min(furthestPlane.x, furthestPlane.y), furthestPlane.z);
          
          vec3 intersectPositionWS = worldPos + reflectDir * distance;
          return normalize(intersectPositionWS - probePos);
        }
        `
      );
      
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <envmap_fragment>',
        `
        #ifdef USE_ENVMAP
          vec3 worldNormal = normalize(vWorldNormal);
          vec3 viewDirection = normalize(vViewDirection);
          
          // Calculate reflection direction
          vec3 reflectDir = reflect(-viewDirection, worldNormal);
          
          // Add surface distortion for liquid materials
          vec2 distortion = vec2(
            sin(vWorldPosition.x * 10.0 + uTime * 2.0),
            cos(vWorldPosition.z * 10.0 + uTime * 1.5)
          ) * 0.05 * (1.0 - uRoughnessFactor);
          
          reflectDir.xz += distortion;
          reflectDir = normalize(reflectDir);
          
          // Sample environment map with roughness-based blur
          vec3 envColor = sampleEnvironmentLOD(envMap, reflectDir, roughnessFactor * uRoughnessFactor);
          
          // Calculate Fresnel effect
          float fresnel = calculateFresnel(worldNormal, viewDirection, uFresnelPower, 0.04);
          
          // Apply metallic workflow
          vec3 baseReflection = mix(vec3(0.04), diffuseColor.rgb, metallicFactor * uMetallicFactor);
          
          // Combine with environment
          vec3 reflectionColor = envColor * baseReflection * uEnvironmentIntensity;
          
          // Apply reflection strength and Fresnel
          reflectionColor *= uReflectionStrength * fresnel;
          
          // Add to final color
          outgoingLight = mix(outgoingLight, reflectionColor, fresnel * uReflectionStrength);
        #endif
        `
      );
    };
  }
  
  updateReflection(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    deltaTime: number
  ) {
    if (this.reflectionProbe) {
      const updated = this.reflectionProbe.update(renderer, scene, deltaTime);
      if (updated) {
        this.envMap = this.reflectionProbe.getEnvironmentMap();
        this.envMapIntensity = this.customUniforms.uEnvironmentIntensity.value;
        this.needsUpdate = true;
      }
    }
  }
  
  setReflectionStrength(strength: number) {
    this.customUniforms.uReflectionStrength.value = strength;
  }
  
  setRoughnessFactor(roughness: number) {
    this.customUniforms.uRoughnessFactor.value = roughness;
  }
  
  setFresnelPower(power: number) {
    this.customUniforms.uFresnelPower.value = power;
  }
  
  updateTime(time: number) {
    this.customUniforms.uTime.value = time;
  }
}

// Screen-space reflections for additional detail
export class ScreenSpaceReflections {
  private renderTarget: THREE.WebGLRenderTarget;
  private reflectionMaterial: THREE.ShaderMaterial;
  private quad: THREE.Mesh;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  
  constructor(width: number, height: number) {
    // Create render target
    this.renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType
    });
    
    // Create SSR shader material
    this.reflectionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        tNormal: { value: null },
        uCameraNear: { value: 0.1 },
        uCameraFar: { value: 1000 },
        uProjectionMatrix: { value: new THREE.Matrix4() },
        uInverseProjectionMatrix: { value: new THREE.Matrix4() },
        uMaxRayLength: { value: 100 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uThickness: { value: 0.1 },
        uIntensity: { value: 0.5 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform sampler2D tNormal;
        uniform float uCameraNear;
        uniform float uCameraFar;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uInverseProjectionMatrix;
        uniform float uMaxRayLength;
        uniform vec2 uResolution;
        uniform float uThickness;
        uniform float uIntensity;
        
        varying vec2 vUv;
        
        float readDepth(vec2 coord) {
          float fragCoordZ = texture2D(tDepth, coord).x;
          float viewZ = perspectiveDepthToViewZ(fragCoordZ, uCameraNear, uCameraFar);
          return viewZToOrthographicDepth(viewZ, uCameraNear, uCameraFar);
        }
        
        vec3 getViewPosition(vec2 screenPosition, float depth) {
          vec4 clipSpacePosition = vec4(screenPosition * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
          vec4 viewSpacePosition = uInverseProjectionMatrix * clipSpacePosition;
          return viewSpacePosition.xyz / viewSpacePosition.w;
        }
        
        void main() {
          vec2 texelSize = 1.0 / uResolution;
          
          float depth = readDepth(vUv);
          vec3 viewPos = getViewPosition(vUv, depth);
          vec3 worldNormal = normalize(texture2D(tNormal, vUv).xyz * 2.0 - 1.0);
          
          vec3 viewDir = normalize(viewPos);
          vec3 reflectDir = reflect(viewDir, worldNormal);
          
          // Ray marching
          vec3 rayStart = viewPos;
          vec3 rayDir = reflectDir;
          
          vec4 reflectionColor = vec4(0.0);
          float rayLength = 0.0;
          
          for (int i = 0; i < 32; i++) {
            vec3 currentPos = rayStart + rayDir * rayLength;
            
            vec4 projectedPos = uProjectionMatrix * vec4(currentPos, 1.0);
            projectedPos /= projectedPos.w;
            vec2 screenPos = projectedPos.xy * 0.5 + 0.5;
            
            if (screenPos.x < 0.0 || screenPos.x > 1.0 || screenPos.y < 0.0 || screenPos.y > 1.0) {
              break;
            }
            
            float sampledDepth = readDepth(screenPos);
            vec3 sampledViewPos = getViewPosition(screenPos, sampledDepth);
            
            if (abs(currentPos.z - sampledViewPos.z) < uThickness) {
              reflectionColor = texture2D(tDiffuse, screenPos);
              break;
            }
            
            rayLength += 0.5;
            if (rayLength > uMaxRayLength) break;
          }
          
          vec3 originalColor = texture2D(tDiffuse, vUv).rgb;
          vec3 finalColor = mix(originalColor, reflectionColor.rgb, reflectionColor.a * uIntensity);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
    
    // Create full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry, this.reflectionMaterial);
    
    // Setup orthographic scene
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  
  render(
    renderer: THREE.WebGLRenderer,
    inputTexture: THREE.Texture,
    depthTexture: THREE.Texture,
    normalTexture: THREE.Texture,
    camera: THREE.Camera
  ): THREE.Texture {
    // Update uniforms
    this.reflectionMaterial.uniforms.tDiffuse.value = inputTexture;
    this.reflectionMaterial.uniforms.tDepth.value = depthTexture;
    this.reflectionMaterial.uniforms.tNormal.value = normalTexture;
    this.reflectionMaterial.uniforms.uProjectionMatrix.value.copy(camera.projectionMatrix);
    this.reflectionMaterial.uniforms.uInverseProjectionMatrix.value
      .copy(camera.projectionMatrix).invert();
    
    // Render to target
    const currentRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(currentRenderTarget);
    
    return this.renderTarget.texture;
  }
  
  dispose() {
    this.renderTarget.dispose();
    this.reflectionMaterial.dispose();
  }
}

// Complete reflection system manager
export class ReflectionSystemManager {
  private reflectionProbes: ReflectionProbe[] = [];
  private screenSpaceReflections?: ScreenSpaceReflections;
  private reflectiveMaterials: ReflectiveMaterial[] = [];
  
  constructor(enableSSR: boolean = true, width: number = 1024, height: number = 1024) {
    if (enableSSR) {
      this.screenSpaceReflections = new ScreenSpaceReflections(width, height);
    }
  }
  
  createReflectionProbe(position: THREE.Vector3, resolution: number = 256): ReflectionProbe {
    const probe = new ReflectionProbe(position, resolution);
    this.reflectionProbes.push(probe);
    return probe;
  }
  
  createReflectiveMaterial(
    parameters: THREE.MeshStandardMaterialParameters = {},
    probe?: ReflectionProbe
  ): ReflectiveMaterial {
    const material = new ReflectiveMaterial(parameters, probe);
    this.reflectiveMaterials.push(material);
    return material;
  }
  
  update(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    deltaTime: number,
    time: number
  ) {
    // Update reflection probes
    this.reflectionProbes.forEach(probe => {
      probe.update(renderer, scene, deltaTime);
    });
    
    // Update reflective materials
    this.reflectiveMaterials.forEach(material => {
      material.updateReflection(renderer, scene, deltaTime);
      material.updateTime(time);
    });
  }
  
  dispose() {
    this.reflectionProbes.forEach(probe => probe.dispose());
    this.screenSpaceReflections?.dispose();
  }
}