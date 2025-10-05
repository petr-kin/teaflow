import * as THREE from 'three';

// Temperature-based color mapping
export class TemperatureColorMapper {
  static temperatureToColor(temperature: number): THREE.Color {
    // Map temperature (70-100°C) to realistic thermal colors
    const normalizedTemp = Math.max(0, Math.min(1, (temperature - 70) / 30));
    
    if (normalizedTemp < 0.3) {
      // Cool: Blue to white
      return new THREE.Color().lerpColors(
        new THREE.Color(0.4, 0.6, 1.0),     // Cool blue
        new THREE.Color(0.8, 0.9, 1.0),     // Cool white
        normalizedTemp / 0.3
      );
    } else if (normalizedTemp < 0.7) {
      // Warm: White to yellow
      return new THREE.Color().lerpColors(
        new THREE.Color(0.8, 0.9, 1.0),     // Cool white
        new THREE.Color(1.0, 0.9, 0.7),     // Warm white
        (normalizedTemp - 0.3) / 0.4
      );
    } else {
      // Hot: Yellow to red
      return new THREE.Color().lerpColors(
        new THREE.Color(1.0, 0.9, 0.7),     // Warm white
        new THREE.Color(1.0, 0.4, 0.2),     // Hot orange/red
        (normalizedTemp - 0.7) / 0.3
      );
    }
  }
  
  static getIntensityFromTemperature(temperature: number): number {
    // Higher temperatures emit more light
    const normalizedTemp = Math.max(0, Math.min(1, (temperature - 70) / 30));
    return 0.3 + normalizedTemp * 1.2; // Range from 0.3 to 1.5
  }
  
  static getHeatGlowIntensity(temperature: number): number {
    // Visible heat glow starts around 85°C
    return Math.max(0, (temperature - 85) / 15); // 0 to 1 for 85-100°C
  }
}

// Thermal light source that adjusts based on temperature
export class ThermalLight extends THREE.PointLight {
  private baseIntensity: number;
  private temperature: number = 85;
  private heatGlow: THREE.Mesh;
  private pulseSpeed: number = 2;
  private glowMaterial: THREE.ShaderMaterial;
  
  constructor(
    baseIntensity: number = 1,
    distance: number = 10,
    decay: number = 2
  ) {
    super(0xffffff, baseIntensity, distance, decay);
    this.baseIntensity = baseIntensity;
    
    // Create heat glow effect
    this.createHeatGlow();
    this.add(this.heatGlow);
  }
  
  private createHeatGlow() {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    
    this.glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTemperature: { value: 85 },
        uColor: { value: new THREE.Color(1, 0.5, 0.2) },
        uIntensity: { value: 1 },
        uGlowSize: { value: 1 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uTemperature;
        uniform float uGlowSize;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vIntensity;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          // Pulsing effect based on temperature
          float pulse = 0.9 + 0.1 * sin(uTime * 3.0);
          float tempEffect = (uTemperature - 70.0) / 30.0;
          
          vec3 newPosition = position * uGlowSize * pulse * (0.5 + tempEffect);
          vIntensity = tempEffect * pulse;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uTemperature;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vIntensity;
        
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float rim = 1.0 - dot(vNormal, viewDirection);
          rim = pow(rim, 2.0);
          
          float tempGlow = max(0.0, (uTemperature - 80.0) / 20.0);
          float alpha = rim * vIntensity * tempGlow * uIntensity;
          
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    
    this.heatGlow = new THREE.Mesh(geometry, this.glowMaterial);
  }
  
  updateTemperature(temperature: number, time: number) {
    this.temperature = temperature;
    
    // Update light color and intensity
    this.color.copy(TemperatureColorMapper.temperatureToColor(temperature));
    this.intensity = this.baseIntensity * TemperatureColorMapper.getIntensityFromTemperature(temperature);
    
    // Update heat glow
    const glowIntensity = TemperatureColorMapper.getHeatGlowIntensity(temperature);
    this.glowMaterial.uniforms.uTime.value = time;
    this.glowMaterial.uniforms.uTemperature.value = temperature;
    this.glowMaterial.uniforms.uIntensity.value = glowIntensity;
    this.glowMaterial.uniforms.uColor.value.copy(this.color);
    
    this.heatGlow.visible = glowIntensity > 0;
  }
  
  dispose() {
    this.glowMaterial.dispose();
    this.heatGlow.geometry.dispose();
  }
}

// Steam heat distortion effect
export class HeatDistortionEffect {
  private distortionMaterial: THREE.ShaderMaterial;
  private renderTarget: THREE.WebGLRenderTarget;
  private quad: THREE.Mesh;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  
  constructor(width: number, height: number) {
    // Create render target
    this.renderTarget = new THREE.WebGLRenderTarget(width, height);
    
    // Create distortion shader
    this.distortionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uTemperature: { value: 85 },
        uDistortionStrength: { value: 0.02 },
        uHeatSources: { value: [] }, // Array of heat source positions
        uResolution: { value: new THREE.Vector2(width, height) }
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
        uniform float uTime;
        uniform float uTemperature;
        uniform float uDistortionStrength;
        uniform vec3 uHeatSources[10];
        uniform vec2 uResolution;
        
        varying vec2 vUv;
        
        // Generate heat shimmer noise
        float noise(vec2 p) {
          return sin(p.x * 10.0 + uTime) * cos(p.y * 8.0 + uTime * 1.5);
        }
        
        vec2 calculateHeatDistortion(vec2 uv, vec3 heatSource) {
          vec2 heatPos = heatSource.xy;
          float heatIntensity = heatSource.z;
          
          float distance = length(uv - heatPos);
          float influence = exp(-distance * 5.0) * heatIntensity;
          
          vec2 distortion = vec2(
            noise(uv * 20.0 + vec2(uTime * 2.0)),
            noise(uv * 15.0 + vec2(uTime * 1.5, uTime * 2.5))
          ) * influence * uDistortionStrength;
          
          return distortion;
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Apply heat distortion from all sources
          vec2 totalDistortion = vec2(0.0);
          for (int i = 0; i < 10; i++) {
            if (uHeatSources[i].z > 0.0) {
              totalDistortion += calculateHeatDistortion(uv, uHeatSources[i]);
            }
          }
          
          // Sample distorted texture
          vec2 distortedUv = uv + totalDistortion;
          vec4 color = texture2D(tDiffuse, distortedUv);
          
          gl_FragColor = color;
        }
      `
    });
    
    // Setup full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry, this.distortionMaterial);
    
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  
  render(
    renderer: THREE.WebGLRenderer,
    inputTexture: THREE.Texture,
    heatSources: Array<{ position: THREE.Vector3; intensity: number }>,
    time: number,
    temperature: number
  ): THREE.Texture {
    // Update uniforms
    this.distortionMaterial.uniforms.tDiffuse.value = inputTexture;
    this.distortionMaterial.uniforms.uTime.value = time;
    this.distortionMaterial.uniforms.uTemperature.value = temperature;
    
    // Update heat sources
    const heatSourceArray = new Array(30).fill(0); // 10 sources * 3 components
    heatSources.slice(0, 10).forEach((source, index) => {
      heatSourceArray[index * 3] = source.position.x;
      heatSourceArray[index * 3 + 1] = source.position.y;
      heatSourceArray[index * 3 + 2] = source.intensity;
    });
    this.distortionMaterial.uniforms.uHeatSources.value = heatSourceArray;
    
    // Render to target
    const currentTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(currentTarget);
    
    return this.renderTarget.texture;
  }
  
  dispose() {
    this.renderTarget.dispose();
    this.distortionMaterial.dispose();
  }
}

// Main thermal lighting system
export class ThermalLightingSystem {
  private thermalLights: ThermalLight[] = [];
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private heatDistortion?: HeatDistortionEffect;
  private heatSources: Array<{ position: THREE.Vector3; intensity: number }> = [];
  
  constructor(scene: THREE.Scene, enableHeatDistortion: boolean = true) {
    // Setup base lighting
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, 10, 5);
    this.directionalLight.castShadow = true;
    
    scene.add(this.ambientLight);
    scene.add(this.directionalLight);
    
    if (enableHeatDistortion) {
      this.heatDistortion = new HeatDistortionEffect(1024, 1024);
    }
  }
  
  createThermalLight(
    position: THREE.Vector3,
    baseIntensity: number = 1,
    distance: number = 10
  ): ThermalLight {
    const light = new ThermalLight(baseIntensity, distance);
    light.position.copy(position);
    this.thermalLights.push(light);
    return light;
  }
  
  addHeatSource(position: THREE.Vector3, intensity: number) {
    this.heatSources.push({ position: position.clone(), intensity });
  }
  
  updateTemperature(temperature: number, time: number) {
    // Update all thermal lights
    this.thermalLights.forEach(light => {
      light.updateTemperature(temperature, time);
    });
    
    // Update ambient lighting based on overall temperature
    const ambientIntensity = 0.2 + (temperature - 70) / 30 * 0.3;
    const ambientColor = TemperatureColorMapper.temperatureToColor(temperature);
    ambientColor.multiplyScalar(0.3); // Reduce intensity for ambient
    
    this.ambientLight.intensity = ambientIntensity;
    this.ambientLight.color.copy(ambientColor);
    
    // Update directional light color temperature
    const directionalColor = TemperatureColorMapper.temperatureToColor(temperature * 0.8 + 20);
    this.directionalLight.color.copy(directionalColor);
    
    // Update heat sources intensity
    this.heatSources.forEach(source => {
      source.intensity = Math.max(0, (temperature - 80) / 20);
    });
  }
  
  renderHeatDistortion(
    renderer: THREE.WebGLRenderer,
    inputTexture: THREE.Texture,
    time: number,
    temperature: number
  ): THREE.Texture | null {
    if (!this.heatDistortion) return null;
    
    return this.heatDistortion.render(
      renderer,
      inputTexture,
      this.heatSources,
      time,
      temperature
    );
  }
  
  // Create atmospheric fog based on temperature
  updateFog(scene: THREE.Scene, temperature: number) {
    const fogDensity = Math.max(0, (temperature - 85) / 15 * 0.01);
    const fogColor = TemperatureColorMapper.temperatureToColor(temperature);
    fogColor.multiplyScalar(0.1);
    
    if (fogDensity > 0) {
      scene.fog = new THREE.FogExp2(fogColor.getHex(), fogDensity);
    } else {
      scene.fog = null;
    }
  }
  
  // Add realistic shadows based on temperature
  updateShadows(temperature: number) {
    // Higher temperature = softer shadows
    const shadowMapSize = Math.max(512, Math.min(2048, 1024 + (temperature - 85) * 20));
    
    this.directionalLight.shadow.mapSize.width = shadowMapSize;
    this.directionalLight.shadow.mapSize.height = shadowMapSize;
    
    // Shadow bias adjustment for temperature
    this.directionalLight.shadow.bias = -0.0005 + (temperature - 85) / 15 * -0.0001;
  }
  
  dispose() {
    this.thermalLights.forEach(light => light.dispose());
    this.heatDistortion?.dispose();
  }
}