import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Mesh, BufferGeometry, Points } from 'three';

interface SandTimer3DProps {
  progress: number; // 0-1
  duration: number; // seconds
  isRunning: boolean;
}

// Sand Particle System
function SandParticles({ progress, isRunning }: { progress: number; isRunning: boolean }) {
  const particlesRef = useRef<Points>(null);
  const particleCount = 3000;
  
  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Initialize top chamber particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random position in top chamber (conical shape)
      const radius = Math.random() * 0.4;
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 0.8 + 0.2;
      
      positions[i3] = Math.cos(angle) * radius * (1.2 - height);
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius * (1.2 - height);
      
      // Initial velocities
      velocities[i3] = (Math.random() - 0.5) * 0.001;
      velocities[i3 + 1] = -Math.random() * 0.005;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;
      
      // Sand color variations
      const brown = 0.7 + Math.random() * 0.3;
      colors[i3] = brown;
      colors[i3 + 1] = brown * 0.8;
      colors[i3 + 2] = brown * 0.6;
    }
    
    return { positions, velocities, colors };
  }, [particleCount]);

  useFrame((state) => {
    if (!particlesRef.current || !isRunning) return;
    
    const positionAttribute = particlesRef.current.geometry.attributes.position;
    const positions = positionAttribute.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Apply gravity and movement
      velocities[i3 + 1] -= 0.00008; // gravity
      
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      // Hourglass neck constraint
      if (positions[i3 + 1] < 0.1 && positions[i3 + 1] > -0.1) {
        const distanceFromCenter = Math.sqrt(positions[i3] ** 2 + positions[i3 + 2] ** 2);
        if (distanceFromCenter > 0.05) {
          // Bounce off neck walls
          const normalize = 0.05 / distanceFromCenter;
          positions[i3] *= normalize;
          positions[i3 + 2] *= normalize;
          velocities[i3] *= -0.3;
          velocities[i3 + 2] *= -0.3;
        }
      }
      
      // Bottom chamber collection
      if (positions[i3 + 1] < -0.8) {
        positions[i3 + 1] = -0.8 + Math.random() * 0.1;
        velocities[i3 + 1] = 0;
        velocities[i3] *= 0.7;
        velocities[i3 + 2] *= 0.7;
      }
      
      // Reset particles that fall too low
      if (positions[i3 + 1] < -1.2) {
        if (progress < 0.95) { // Still sand in top
          positions[i3] = (Math.random() - 0.5) * 0.6;
          positions[i3 + 1] = 0.8 + Math.random() * 0.4;
          positions[i3 + 2] = (Math.random() - 0.5) * 0.6;
          velocities[i3] = (Math.random() - 0.5) * 0.001;
          velocities[i3 + 1] = -Math.random() * 0.005;
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;
        }
      }
    }
    
    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.003}
        vertexColors
        transparent={true}
        opacity={0.9}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Glass Hourglass Structure
function HourglassGlass() {
  const glassRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (glassRef.current) {
      // Subtle rotation animation
      glassRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={glassRef}>
      {/* Top chamber */}
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[0.5, 0.8, 8, 1, true]} />
        <meshPhysicalMaterial
          color="#f8f8f8"
          transparent={true}
          opacity={0.15}
          roughness={0.0}
          metalness={0.0}
          transmission={0.9}
          thickness={0.1}
        />
      </mesh>
      
      {/* Bottom chamber */}
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.5, 0.8, 8, 1, true]} />
        <meshPhysicalMaterial
          color="#f8f8f8"
          transparent={true}
          opacity={0.15}
          roughness={0.0}
          metalness={0.0}
          transmission={0.9}
          thickness={0.1}
        />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
        <meshPhysicalMaterial
          color="#f8f8f8"
          transparent={true}
          opacity={0.2}
          roughness={0.0}
          metalness={0.0}
          transmission={0.8}
        />
      </mesh>
      
      {/* Wooden base */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Wooden top */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

// Main Sand Timer 3D Component
export default function SandTimer3D({ progress, duration, isRunning }: SandTimer3DProps) {
  return (
    <div style={{ width: '100%', height: '300px', borderRadius: '15px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 1, 3], fov: 45 }}
        dpr={[1, 2]}
        shadows
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <pointLight position={[-2, 2, 2]} intensity={0.4} color="#ffd700" />
        
        {/* Environment */}
        <Environment preset="apartment" intensity={0.3} />
        <ContactShadows
          position={[0, -1.3, 0]}
          opacity={0.2}
          scale={2}
          blur={1.5}
          far={1}
        />

        {/* Hourglass Components */}
        <HourglassGlass />
        <SandParticles progress={progress} isRunning={isRunning} />
      </Canvas>
    </div>
  );
}