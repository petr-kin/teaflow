import * as THREE from 'three';

// Vertex shader for tea surface
export const teaSurfaceVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  uniform float uTime;
  uniform float uRippleStrength;
  uniform vec2 uRippleCenter;
  
  // Generate surface ripples
  float generateRipples(vec2 position, float time) {
    vec2 center = uRippleCenter;
    float distance = length(position - center);
    
    // Multiple ripple waves
    float ripple1 = sin(distance * 15.0 - time * 3.0) * exp(-distance * 2.0);
    float ripple2 = sin(distance * 25.0 - time * 5.0) * exp(-distance * 3.0) * 0.5;
    float ripple3 = sin(distance * 35.0 - time * 7.0) * exp(-distance * 4.0) * 0.3;
    
    return (ripple1 + ripple2 + ripple3) * uRippleStrength;
  }
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Calculate ripple displacement
    float rippleHeight = generateRipples(uv, uTime);
    
    // Apply ripple to vertex position
    vec3 newPosition = position + normal * rippleHeight;
    vPosition = newPosition;
    
    vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// Fragment shader for tea surface
export const teaSurfaceFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  uniform float uTime;
  uniform float uTemperature;
  uniform float uConcentration;
  uniform vec3 uTeaColor;
  uniform vec3 uLightPosition;
  uniform vec3 uCameraPosition;
  uniform samplerCube uEnvironmentMap;
  uniform sampler2D uFoamTexture;
  
  // Calculate fresnel effect
  float calculateFresnel(vec3 normal, vec3 viewDir, float power) {
    float facing = dot(normal, viewDir);
    return pow(1.0 - facing, power);
  }
  
  // Generate procedural foam
  float generateFoam(vec2 uv, float time) {
    vec2 foamUv = uv * 8.0 + vec2(time * 0.1, time * 0.05);
    float foam1 = texture2D(uFoamTexture, foamUv).r;
    float foam2 = texture2D(uFoamTexture, foamUv * 2.0 + time * 0.1).r;
    return smoothstep(0.4, 0.8, foam1 * foam2);
  }
  
  // Temperature-based steam distortion
  vec2 steamDistortion(vec2 uv, float temperature, float time) {
    if (temperature < 80.0) return vec2(0.0);
    
    float steamIntensity = (temperature - 80.0) / 20.0;
    vec2 distortion = vec2(
      sin(uv.y * 20.0 + time * 2.0) * steamIntensity * 0.01,
      cos(uv.x * 15.0 + time * 1.5) * steamIntensity * 0.005
    );
    return distortion;
  }
  
  // Calculate tea color based on concentration and depth
  vec3 calculateTeaColor(float concentration, vec3 baseColor) {
    vec3 lightTea = vec3(0.95, 0.88, 0.7);  // Light tea color
    vec3 darkTea = baseColor;                // Full strength tea color
    
    return mix(lightTea, darkTea, concentration);
  }
  
  // Surface lighting calculation
  vec3 calculateLighting(vec3 normal, vec3 lightDir, vec3 viewDir) {
    float NdotL = max(dot(normal, lightDir), 0.0);
    
    // Diffuse lighting
    vec3 diffuse = vec3(NdotL);
    
    // Specular reflection (Blinn-Phong)
    vec3 halfDir = normalize(lightDir + viewDir);
    float NdotH = max(dot(normal, halfDir), 0.0);
    vec3 specular = pow(NdotH, 64.0) * vec3(0.8, 0.9, 1.0);
    
    return diffuse + specular * 0.5;
  }
  
  void main() {
    vec2 distortedUv = vUv + steamDistortion(vUv, uTemperature, uTime);
    
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    vec3 lightDir = normalize(uLightPosition - vWorldPosition);
    
    // Calculate surface normal (with ripples)
    float normalStrength = 0.1;
    vec3 surfaceNormal = normalize(vNormal + 
      vec3(sin(vUv.x * 30.0 + uTime), cos(vUv.y * 25.0 + uTime), 1.0) * normalStrength);
    
    // Base tea color
    vec3 teaColor = calculateTeaColor(uConcentration, uTeaColor);
    
    // Fresnel reflection
    float fresnelFactor = calculateFresnel(surfaceNormal, viewDir, 2.0);
    
    // Environment reflection
    vec3 reflectDir = reflect(-viewDir, surfaceNormal);
    vec3 reflection = textureCube(uEnvironmentMap, reflectDir).rgb;
    
    // Lighting
    vec3 lighting = calculateLighting(surfaceNormal, lightDir, viewDir);
    
    // Foam generation
    float foam = generateFoam(distortedUv, uTime);
    vec3 foamColor = vec3(1.0, 0.98, 0.9);
    
    // Temperature glow
    float temperatureGlow = smoothstep(85.0, 100.0, uTemperature);
    vec3 heatGlow = vec3(1.0, 0.6, 0.2) * temperatureGlow * 0.3;
    
    // Combine all effects
    vec3 finalColor = teaColor * lighting;
    finalColor = mix(finalColor, reflection, fresnelFactor * 0.3);
    finalColor = mix(finalColor, foamColor, foam * 0.8);
    finalColor += heatGlow;
    
    // Add subtle subsurface scattering
    float subsurface = pow(max(0.0, dot(-lightDir, viewDir)), 4.0);
    finalColor += teaColor * subsurface * 0.2;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Shader material class
export class TeaSurfaceShader {
  public material: THREE.ShaderMaterial;
  
  constructor(
    teaColor: THREE.Color = new THREE.Color(0.4, 0.2, 0.1),
    environmentMap?: THREE.CubeTexture,
    foamTexture?: THREE.Texture
  ) {
    this.material = new THREE.ShaderMaterial({
      vertexShader: teaSurfaceVertexShader,
      fragmentShader: teaSurfaceFragmentShader,
      uniforms: {
        uTime: { value: 0.0 },
        uTemperature: { value: 85.0 },
        uConcentration: { value: 0.5 },
        uTeaColor: { value: teaColor },
        uRippleStrength: { value: 0.02 },
        uRippleCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uLightPosition: { value: new THREE.Vector3(5, 10, 5) },
        uCameraPosition: { value: new THREE.Vector3(0, 0, 5) },
        uEnvironmentMap: { value: environmentMap },
        uFoamTexture: { value: foamTexture }
      },
      transparent: true,
      side: THREE.DoubleSide
    });
  }
  
  // Update shader uniforms
  updateUniforms(params: {
    time?: number;
    temperature?: number;
    concentration?: number;
    cameraPosition?: THREE.Vector3;
    rippleCenter?: THREE.Vector2;
  }) {
    if (params.time !== undefined) {
      this.material.uniforms.uTime.value = params.time;
    }
    if (params.temperature !== undefined) {
      this.material.uniforms.uTemperature.value = params.temperature;
    }
    if (params.concentration !== undefined) {
      this.material.uniforms.uConcentration.value = params.concentration;
    }
    if (params.cameraPosition) {
      this.material.uniforms.uCameraPosition.value.copy(params.cameraPosition);
    }
    if (params.rippleCenter) {
      this.material.uniforms.uRippleCenter.value.copy(params.rippleCenter);
    }
  }
  
  // Create ripple effect at specific position
  createRipple(position: THREE.Vector2, strength: number = 0.05) {
    this.material.uniforms.uRippleCenter.value.copy(position);
    this.material.uniforms.uRippleStrength.value = strength;
  }
  
  // Animate brewing process
  animateBrewingProcess(progress: number) {
    // Increase concentration over time
    this.material.uniforms.uConcentration.value = progress;
    
    // Add color variation based on brewing progress
    const brewingColor = new THREE.Color().lerpColors(
      new THREE.Color(0.9, 0.85, 0.7), // Light tea
      new THREE.Color(0.4, 0.2, 0.1),  // Dark tea
      progress
    );
    this.material.uniforms.uTeaColor.value.copy(brewingColor);
  }
}