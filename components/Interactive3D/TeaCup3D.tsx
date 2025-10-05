import React, { useRef, useState } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { animated, useSpring } from 'react-spring';
import { Mesh } from 'three';

// extend({ OrbitControls });

interface TeaCup3DProps {
  size: number; // 110, 150, 200ml
  brewingStrength: number; // 0-1
  temperature: number; // 70-100°C
  isRunning: boolean;
  onInteraction?: (type: string) => void;
}

// 3D Gaiwan Tea Cup Component
function GaiwanCup({ size, brewingStrength, temperature, isRunning }: TeaCup3DProps) {
  const cupRef = useRef<Mesh>(null);
  const lidRef = useRef<Mesh>(null);
  const teaRef = useRef<Mesh>(null);
  const steamRef = useRef<THREE.Points>(null);
  
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Animated properties
  const { scale, teaColor, steamIntensity } = useSpring({
    scale: clicked ? 1.1 : hovered ? 1.05 : 1,
    teaColor: brewingStrength,
    steamIntensity: (temperature - 70) / 30 * 0.8,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  // Animation loop
  useFrame((state) => {
    if (cupRef.current) {
      // Gentle rotation when brewing
      if (isRunning) {
        cupRef.current.rotation.y += 0.003;
      }
      
      // Subtle floating animation
      cupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }

    // Steam particle animation
    if (steamRef.current && temperature > 80) {
      const positions = steamRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.01; // Rise upward
        if (positions[i] > 2) positions[i] = 0.1; // Reset to bottom
      }
      steamRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Generate steam particles
  const steamParticles = React.useMemo(() => {
    const particles = [];
    const particleCount = Math.floor(temperature / 10) * 5;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(
        (Math.random() - 0.5) * 0.3, // x
        Math.random() * 0.5, // y
        (Math.random() - 0.5) * 0.3  // z
      );
    }
    return new Float32Array(particles);
  }, [temperature]);

  // Calculate tea cup scale based on size
  const cupScale = size === 110 ? 0.8 : size === 150 ? 1.0 : 1.2;

  return (
    <animated.group scale={scale} position={[0, 0, 0]}>
      {/* Main Gaiwan Body */}
      <mesh
        ref={cupRef}
        scale={[cupScale, cupScale, cupScale]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
      >
        {/* Cup bowl */}
        <sphereGeometry args={[0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial
          color="#f5f5dc"
          roughness={0.1}
          metalness={0.05}
          transparent={true}
          opacity={0.95}
        />
      </mesh>

      {/* Gaiwan Lid */}
      <mesh ref={lidRef} position={[0, 0.5, 0]} scale={[cupScale, cupScale, cupScale]}>
        <sphereGeometry args={[0.85, 32, 8, 0, Math.PI * 2, 0, Math.PI * 0.3]} />
        <meshStandardMaterial
          color="#f0f0e8"
          roughness={0.15}
          metalness={0.08}
        />
      </mesh>

      {/* Tea Liquid */}
      <animated.mesh
        ref={teaRef}
        position={[0, -0.2, 0]}
        scale={[cupScale * 0.75, cupScale * 0.75, cupScale * 0.75]}
      >
        <cylinderGeometry args={[0.6, 0.7, 0.3, 32]} />
        <animated.meshStandardMaterial
          color={teaColor.to(t => `hsl(${25 + t * 15}, ${60 + t * 20}%, ${80 - t * 30}%)`)}
          transparent={true}
          opacity={0.8 + brewingStrength * 0.2}
          roughness={0.0}
          metalness={0.1}
        />
      </animated.mesh>

      {/* Steam Particles */}
      {temperature > 80 && (
        <points ref={steamRef} position={[0, 0.6, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={steamParticles.length / 3}
              array={steamParticles}
              itemSize={3}
              args={[steamParticles, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#ffffff"
            size={0.02}
            transparent={true}
            opacity={0.6}
            sizeAttenuation={true}
          />
        </points>
      )}

      {/* Size indicator ring */}
      <mesh position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[cupScale * 0.9, cupScale * 0.95, 32]} />
        <meshBasicMaterial
          color={size === 110 ? "#4a7c59" : size === 150 ? "#d4af37" : "#c5a572"}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
    </animated.group>
  );
}

// Main 3D Tea Cup Component
export default function TeaCup3D(props: TeaCup3DProps) {
  return (
    <div style={{ width: '100%', height: '400px', borderRadius: '20px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 2, 4], fov: 50 }}
        dpr={[1, 2]}
        shadows
        style={{ background: 'radial-gradient(circle, #2a2a2a 0%, #1a1a1a 100%)' }}
      >
        {/* Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.6} color="#d4af37" />
        
        {/* Environment and Effects */}
        <Environment preset="studio" />
        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.4}
          scale={3}
          blur={2.5}
          far={2}
        />

        {/* 3D Tea Cup */}
        <GaiwanCup {...props} />
      </Canvas>
    </div>
  );
}