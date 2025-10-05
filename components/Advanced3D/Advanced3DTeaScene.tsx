import React, { useRef, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

// Import our advanced 3D systems
import { TeaSurfaceShader } from './shaders/TeaSurfaceShader';
import { AdvancedParticleSystem } from './particles/AdvancedParticleSystem';
import { ThermalLightingSystem } from './lighting/ThermalLightingSystem';
import { ReflectionSystemManager } from './reflections/ReflectionSystem';
import { FluidDynamicsSystem } from './physics/FluidDynamics';
import { SandPhysicsSystem } from './physics/SandPhysics';
import { TeaLeafSimulation } from './simulation/TeaLeafSimulation';

interface TeaBrewingProps {
  temperature: number;
  brewingTime: number;
  teaConcentration: number;
  isPouring: boolean;
}

function TeaCup({ temperature, teaConcentration }: { temperature: number; teaConcentration: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const teaShaderRef = useRef<TeaSurfaceShader>();
  const { scene, camera, gl } = useThree();
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Create tea surface shader
    teaShaderRef.current = new TeaSurfaceShader(
      new THREE.Color(0.4, 0.2, 0.1), // Tea color
      undefined, // Will set environment map later
      createFoamTexture()
    );
    
    // Create cup geometry
    const cupGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.2, 32);
    const cupMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.8
    });
    
    // Tea surface
    const teaSurfaceGeometry = new THREE.CircleGeometry(0.14, 32);
    const teaSurface = new THREE.Mesh(teaSurfaceGeometry, teaShaderRef.current.material);
    teaSurface.rotation.x = -Math.PI / 2;
    teaSurface.position.y = 0.08;
    
    meshRef.current.add(teaSurface);
    
  }, []);
  
  useFrame((state) => {
    if (teaShaderRef.current) {
      teaShaderRef.current.updateUniforms({
        time: state.clock.elapsedTime,
        temperature,
        concentration: teaConcentration,
        cameraPosition: camera.position
      });
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.12, 0.2, 32]} />
      <meshStandardMaterial color="white" roughness={0.1} metalness={0.8} />
    </mesh>
  );
}

function Hourglass() {
  const meshRef = useRef<THREE.Group>(null);
  const sandSystemRef = useRef<SandPhysicsSystem>();
  const { scene } = useThree();
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Initialize sand physics system
    sandSystemRef.current = new SandPhysicsSystem(scene, 1, 0.3);
    
    // Create hourglass glass geometry
    const hourglassGeometry = new THREE.CylinderGeometry(0.3, 0.05, 0.5, 16);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 0.01
    });
    
    const topHalf = new THREE.Mesh(hourglassGeometry, glassMaterial);
    topHalf.position.y = 0.5;
    
    const bottomHalf = new THREE.Mesh(hourglassGeometry, glassMaterial);
    bottomHalf.rotation.x = Math.PI;
    bottomHalf.position.y = -0.5;
    
    meshRef.current.add(topHalf, bottomHalf);
    
  }, []);
  
  useFrame((state, delta) => {
    if (sandSystemRef.current) {
      sandSystemRef.current.update(delta);
    }
  });
  
  return <group ref={meshRef} position={[2, 0, 0]} />;
}

function ParticleEffects({ temperature, isPouring }: { temperature: number; isPouring: boolean }) {
  const particleSystemRef = useRef<AdvancedParticleSystem>();
  const fluidSystemRef = useRef<FluidDynamicsSystem>();
  const teaLeafSystemRef = useRef<TeaLeafSimulation>();
  const { scene } = useThree();
  
  useEffect(() => {
    if (!scene) return;
    
    // Initialize particle systems
    particleSystemRef.current = new AdvancedParticleSystem(scene);
    fluidSystemRef.current = new FluidDynamicsSystem(scene);
    teaLeafSystemRef.current = new TeaLeafSimulation(scene, new THREE.Vector3(0, 0, 0));
    
    // Add steam emitters around tea cup
    particleSystemRef.current.addSteamEmitter(new THREE.Vector3(0, 0.1, 0), temperature);
    particleSystemRef.current.addSteamEmitter(new THREE.Vector3(0.05, 0.1, 0.05), temperature);
    particleSystemRef.current.addSteamEmitter(new THREE.Vector3(-0.05, 0.1, -0.05), temperature);
    
    // Add bubble generators for boiling effect
    particleSystemRef.current.addBubbleGenerator(new THREE.Vector3(0, -0.05, 0));
    
    // Create tea pour stream
    if (fluidSystemRef.current) {
      const pourStream = fluidSystemRef.current.createTeaPourStream(
        new THREE.Vector3(0.5, 0.8, 0), // Teapot spout
        new THREE.Vector3(0, 0.1, 0),   // Cup center
        temperature
      );
      
      if (isPouring) {
        pourStream.startPouring();
      } else {
        pourStream.stopPouring();
      }
    }
    
  }, [scene, isPouring]);
  
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Update all particle systems
    if (particleSystemRef.current) {
      particleSystemRef.current.update(delta, time, temperature);
    }
    
    if (fluidSystemRef.current) {
      fluidSystemRef.current.update(delta, time);
    }
    
    if (teaLeafSystemRef.current) {
      teaLeafSystemRef.current.update(delta, time, temperature);
    }
  });
  
  return null;
}

function LightingSystem({ temperature }: { temperature: number }) {
  const lightingRef = useRef<ThermalLightingSystem>();
  const reflectionRef = useRef<ReflectionSystemManager>();
  const { scene, gl } = useThree();
  
  useEffect(() => {
    if (!scene) return;
    
    // Initialize advanced lighting
    lightingRef.current = new ThermalLightingSystem(scene);
    reflectionRef.current = new ReflectionSystemManager(true, 1024, 1024);
    
    // Create thermal lights
    const mainLight = lightingRef.current.createThermalLight(
      new THREE.Vector3(0, 0.2, 0), // Above tea cup
      1.5,
      0.5
    );
    
    // Add reflection probe
    const probe = reflectionRef.current.createReflectionProbe(
      new THREE.Vector3(0, 0.1, 0),
      256
    );
    
    scene.add(mainLight);
    
  }, [scene]);
  
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Update lighting based on temperature
    if (lightingRef.current) {
      lightingRef.current.updateTemperature(temperature, time);
      lightingRef.current.updateFog(scene, temperature);
      lightingRef.current.updateShadows(temperature);
    }
    
    // Update reflections
    if (reflectionRef.current) {
      reflectionRef.current.update(gl, scene, delta, time);
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 0.3, 0]} intensity={0.5} color={getTemperatureColor(temperature)} />
    </>
  );
}

function Advanced3DScene({ temperature, brewingTime, teaConcentration, isPouring }: TeaBrewingProps) {
  return (
    <Canvas shadows camera={{ position: [1, 1, 2], fov: 50 }}>
      <color attach="background" args={['#1a1a2e']} />
      
      {/* Advanced Lighting System */}
      <LightingSystem temperature={temperature} />
      
      {/* Tea Cup with Advanced Shaders */}
      <TeaCup temperature={temperature} teaConcentration={teaConcentration} />
      
      {/* Hourglass with Sand Physics */}
      <Hourglass />
      
      {/* Advanced Particle Effects */}
      <ParticleEffects temperature={temperature} isPouring={isPouring} />
      
      {/* Environment */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#2d2d4a" />
      </mesh>
      
      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={5}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}

export default function Advanced3DTeaScene() {
  const [temperature, setTemperature] = useState(85);
  const [brewingTime, setBrewingTime] = useState(0);
  const [teaConcentration, setTeaConcentration] = useState(0.3);
  const [isPouring, setIsPouring] = useState(false);
  
  // Simulate brewing process
  useEffect(() => {
    const interval = setInterval(() => {
      setBrewingTime(prev => prev + 0.1);
      setTeaConcentration(prev => Math.min(1, prev + 0.002));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* 3D Scene */}
      <View style={{ flex: 1 }}>
        <Advanced3DScene 
          temperature={temperature}
          brewingTime={brewingTime}
          teaConcentration={teaConcentration}
          isPouring={isPouring}
        />
      </View>
      
      {/* Controls */}
      <View style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        backgroundColor: 'rgba(0,0,0,0.8)', 
        padding: 15, 
        borderRadius: 10,
        minWidth: 200
      }}>
        <text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          🌡️ Temperature: {temperature}°C
        </text>
        <text style={{ color: 'white', fontSize: 14 }}>
          ⏱️ Brewing: {brewingTime.toFixed(1)}s
        </text>
        <text style={{ color: 'white', fontSize: 14 }}>
          🍵 Strength: {Math.round(teaConcentration * 100)}%
        </text>
        
        <button 
          style={{ 
            marginTop: 10, 
            padding: 10, 
            backgroundColor: isPouring ? '#ff4444' : '#4444ff',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer'
          }}
          onClick={() => setIsPouring(!isPouring)}
        >
          {isPouring ? '⏹️ Stop Pouring' : '🫖 Start Pouring'}
        </button>
        
        <input
          type="range"
          min="70"
          max="100"
          value={temperature}
          onChange={(e) => setTemperature(parseInt(e.target.value))}
          style={{ width: '100%', marginTop: 10 }}
        />
        <text style={{ color: 'white', fontSize: 12 }}>Temperature Control</text>
      </View>
    </View>
  );
}

// Helper functions
function createFoamTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d')!;
  
  // Create foam noise pattern
  context.fillStyle = 'white';
  context.fillRect(0, 0, 256, 256);
  
  // Add foam bubbles
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const radius = Math.random() * 10 + 5;
    
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
    context.fill();
  }
  
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function getTemperatureColor(temp: number): string {
  const normalizedTemp = Math.max(0, Math.min(1, (temp - 70) / 30));
  
  if (normalizedTemp < 0.5) {
    // Cool to warm
    const factor = normalizedTemp * 2;
    return `rgb(${Math.round(100 + factor * 155)}, ${Math.round(150 + factor * 105)}, 255)`;
  } else {
    // Warm to hot
    const factor = (normalizedTemp - 0.5) * 2;
    return `rgb(255, ${Math.round(255 - factor * 100)}, ${Math.round(255 - factor * 155)})`;
  }
}