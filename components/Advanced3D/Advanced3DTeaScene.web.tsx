import React, { useRef, useEffect, useState } from 'react';
import { View } from 'react-native';

interface TeaBrewingProps {
  temperature: number;
  brewingTime: number;
  teaConcentration: number;
  isPouring: boolean;
}

export default function Advanced3DTeaScene({ temperature, brewingTime, teaConcentration, isPouring }: TeaBrewingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Dynamically import Three.js only on web
    const initScene = async () => {
      const THREE = await import('three');
      
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);
      scene.fog = new THREE.FogExp2(0x1a1a2e, 0.002);
      
      // Setup camera
      const camera = new THREE.PerspectiveCamera(
        50,
        canvasRef.current!.width / canvasRef.current!.height,
        0.1,
        1000
      );
      camera.position.set(2, 2, 4);
      camera.lookAt(0, 0, 0);
      
      // Setup renderer
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current!,
        antialias: true,
        alpha: true
      });
      renderer.setSize(canvasRef.current!.width, canvasRef.current!.height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.near = 0.1;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -10;
      directionalLight.shadow.camera.right = 10;
      directionalLight.shadow.camera.top = 10;
      directionalLight.shadow.camera.bottom = -10;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);
      
      // Temperature-based point light
      const tempLight = new THREE.PointLight(0xffa500, 0.5, 5);
      tempLight.position.set(0, 0.5, 0);
      scene.add(tempLight);
      
      // Create tea cup
      const cupGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.2, 32, 1, true);
      const cupMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9,
        transmission: 0.1,
        thickness: 0.5
      });
      const cup = new THREE.Mesh(cupGeometry, cupMaterial);
      cup.castShadow = true;
      cup.receiveShadow = true;
      scene.add(cup);
      
      // Cup bottom
      const cupBottomGeometry = new THREE.CircleGeometry(0.12, 32);
      const cupBottom = new THREE.Mesh(cupBottomGeometry, cupMaterial);
      cupBottom.rotation.x = -Math.PI / 2;
      cupBottom.position.y = -0.1;
      scene.add(cupBottom);
      
      // Tea surface with animated shader
      const teaSurfaceGeometry = new THREE.CircleGeometry(0.14, 64);
      const teaSurfaceMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uTemperature: { value: temperature },
          uConcentration: { value: teaConcentration },
          uTeaColor: { value: new THREE.Color(0.4, 0.2, 0.1) }
        },
        vertexShader: `
          varying vec2 vUv;
          uniform float uTime;
          
          void main() {
            vUv = uv;
            vec3 pos = position;
            
            // Create ripples
            float ripple = sin(length(uv - 0.5) * 20.0 - uTime * 3.0) * 0.002;
            ripple += sin(length(uv - vec2(0.3, 0.7)) * 15.0 - uTime * 2.5) * 0.001;
            pos.z += ripple;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uTemperature;
          uniform float uConcentration;
          uniform vec3 uTeaColor;
          
          void main() {
            vec3 lightTea = vec3(0.95, 0.88, 0.7);
            vec3 darkTea = uTeaColor;
            vec3 color = mix(lightTea, darkTea, uConcentration);
            
            // Add steam effect
            float steam = smoothstep(80.0, 100.0, uTemperature);
            color += vec3(steam * 0.1);
            
            // Add subtle foam pattern
            float foam = sin(vUv.x * 30.0 + uTime) * sin(vUv.y * 30.0 + uTime * 0.7);
            foam = smoothstep(0.4, 0.8, foam);
            color = mix(color, vec3(1.0, 0.98, 0.9), foam * 0.1 * (1.0 - uConcentration));
            
            gl_FragColor = vec4(color, 0.95);
          }
        `,
        transparent: true
      });
      const teaSurface = new THREE.Mesh(teaSurfaceGeometry, teaSurfaceMaterial);
      teaSurface.rotation.x = -Math.PI / 2;
      teaSurface.position.y = 0.08;
      scene.add(teaSurface);
      
      // Create hourglass
      const hourglassGroup = new THREE.Group();
      hourglassGroup.position.set(0.5, 0, 0);
      
      // Hourglass glass
      const hourglassTopGeometry = new THREE.ConeGeometry(0.1, 0.15, 16, 1, true);
      const hourglassBottomGeometry = new THREE.ConeGeometry(0.1, 0.15, 16, 1, true);
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0,
        transmission: 0.95,
        thickness: 0.01,
        transparent: true,
        opacity: 0.3
      });
      
      const hourglassTop = new THREE.Mesh(hourglassTopGeometry, glassMaterial);
      hourglassTop.position.y = 0.15;
      hourglassGroup.add(hourglassTop);
      
      const hourglassBottom = new THREE.Mesh(hourglassBottomGeometry, glassMaterial);
      hourglassBottom.rotation.z = Math.PI;
      hourglassBottom.position.y = -0.15;
      hourglassGroup.add(hourglassBottom);
      
      // Sand particles
      const sandCount = 200;
      const sandGeometry = new THREE.SphereGeometry(0.002, 4, 4);
      const sandMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.96, 0.87, 0.70),
        roughness: 0.8,
        metalness: 0
      });
      
      const sandInstanced = new THREE.InstancedMesh(sandGeometry, sandMaterial, sandCount);
      const sandMatrix = new THREE.Matrix4();
      const sandPosition = new THREE.Vector3();
      
      for (let i = 0; i < sandCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.08;
        const height = 0.1 - (i / sandCount) * 0.2;
        
        sandPosition.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        
        sandMatrix.setPosition(sandPosition);
        sandInstanced.setMatrixAt(i, sandMatrix);
      }
      
      sandInstanced.instanceMatrix.needsUpdate = true;
      hourglassGroup.add(sandInstanced);
      scene.add(hourglassGroup);
      
      // Steam particles
      const steamCount = 50;
      const steamGeometry = new THREE.SphereGeometry(0.01, 8, 8);
      const steamMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
      });
      
      const steamParticles: THREE.Mesh[] = [];
      for (let i = 0; i < steamCount; i++) {
        const steam = new THREE.Mesh(steamGeometry, steamMaterial.clone());
        steam.position.set(
          (Math.random() - 0.5) * 0.1,
          0.1 + Math.random() * 0.3,
          (Math.random() - 0.5) * 0.1
        );
        steam.visible = temperature > 75;
        steamParticles.push(steam);
        scene.add(steam);
      }
      
      // Ground plane
      const groundGeometry = new THREE.PlaneGeometry(10, 10);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2d2d4a,
        roughness: 0.8,
        metalness: 0.2
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.5;
      ground.receiveShadow = true;
      scene.add(ground);
      
      // Store references
      sceneRef.current = {
        scene,
        camera,
        renderer,
        teaSurface,
        steamParticles,
        tempLight,
        sandInstanced,
        hourglassGroup
      };
      
      // Animation loop
      let time = 0;
      const animate = () => {
        time += 0.016;
        
        if (sceneRef.current) {
          // Update tea surface shader
          if (teaSurfaceMaterial.uniforms) {
            teaSurfaceMaterial.uniforms.uTime.value = time;
            teaSurfaceMaterial.uniforms.uTemperature.value = temperature;
            teaSurfaceMaterial.uniforms.uConcentration.value = teaConcentration;
          }
          
          // Animate steam particles
          steamParticles.forEach((steam, i) => {
            if (temperature > 75) {
              steam.visible = true;
              steam.position.y += 0.001 + Math.sin(time + i) * 0.0005;
              steam.material.opacity = 0.3 * (1 - (steam.position.y - 0.1) / 0.5);
              
              if (steam.position.y > 0.6) {
                steam.position.y = 0.1;
                steam.position.x = (Math.random() - 0.5) * 0.1;
                steam.position.z = (Math.random() - 0.5) * 0.1;
              }
            } else {
              steam.visible = false;
            }
          });
          
          // Update temperature light
          const tempRatio = (temperature - 70) / 30;
          tempLight.intensity = 0.3 + tempRatio * 0.5;
          tempLight.color.setRGB(1, 0.8 - tempRatio * 0.3, 0.4 - tempRatio * 0.2);
          
          // Rotate hourglass slowly
          if (hourglassGroup) {
            hourglassGroup.rotation.y = Math.sin(time * 0.5) * 0.1;
          }
          
          // Animate sand falling
          if (sandInstanced && brewingTime > 0) {
            const sandMatrix = new THREE.Matrix4();
            const sandPosition = new THREE.Vector3();
            
            for (let i = 0; i < sandCount; i++) {
              sandInstanced.getMatrixAt(i, sandMatrix);
              sandPosition.setFromMatrixPosition(sandMatrix);
              
              // Make sand fall based on brewing time
              if (i < (brewingTime / 60) * sandCount) {
                sandPosition.y -= 0.001;
                if (sandPosition.y < -0.1) {
                  sandPosition.y = -0.1 + (Math.random() - 0.5) * 0.02;
                }
              }
              
              sandMatrix.setPosition(sandPosition);
              sandInstanced.setMatrixAt(i, sandMatrix);
            }
            sandInstanced.instanceMatrix.needsUpdate = true;
          }
          
          // Camera orbit
          camera.position.x = Math.cos(time * 0.1) * 4;
          camera.position.z = Math.sin(time * 0.1) * 4;
          camera.lookAt(0, 0, 0);
          
          renderer.render(scene, camera);
        }
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    };
    
    initScene();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sceneRef.current) {
        sceneRef.current.renderer?.dispose();
      }
    };
  }, []);
  
  // Update temperature and concentration
  useEffect(() => {
    if (sceneRef.current && sceneRef.current.teaSurface) {
      sceneRef.current.teaSurface.material.uniforms.uTemperature.value = temperature;
      sceneRef.current.teaSurface.material.uniforms.uConcentration.value = teaConcentration;
    }
  }, [temperature, teaConcentration]);
  
  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      
      {/* Controls Overlay */}
      <View style={{
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 15,
        borderRadius: 10
      }}>
        <div style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          🍵 Advanced 3D Tea Brewing
        </div>
        <div style={{ color: 'white', fontSize: 14 }}>
          🌡️ Temperature: {temperature}°C
        </div>
        <div style={{ color: 'white', fontSize: 14 }}>
          ⏱️ Brewing: {brewingTime}s
        </div>
        <div style={{ color: 'white', fontSize: 14 }}>
          💪 Strength: {Math.round(teaConcentration * 100)}%
        </div>
        <div style={{ color: '#888', fontSize: 12, marginTop: 10 }}>
          🎮 Camera auto-rotates for 360° view
        </div>
      </View>
    </View>
  );
}