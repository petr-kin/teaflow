import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';

interface Simple3DProps {
  temperature: number;
  brewingTime: number;
  teaConcentration: number;
}

export default function Simple3DDemo({ temperature, brewingTime, teaConcentration }: Simple3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;

    let time = 0;

    const animate = () => {
      time += 0.05;
      
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw tea cup (simple 2D representation)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Cup body
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0.3, Math.PI - 0.3, false);
      ctx.stroke();
      
      // Cup handle
      ctx.beginPath();
      ctx.arc(centerX + 70, centerY, 20, -Math.PI/2, Math.PI/2, false);
      ctx.stroke();
      
      // Tea surface with animated ripples
      const teaColor = `hsl(${30 - teaConcentration * 20}, 70%, ${60 - teaConcentration * 20}%)`;
      ctx.fillStyle = teaColor;
      ctx.beginPath();
      
      // Animated ripples
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const ripple = Math.sin(time * 2 + i * 0.5) * 2;
        const radius = 50 + ripple;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY - 10 + Math.sin(angle) * radius * 0.3;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      
      // Steam particles (if temperature is high enough)
      if (temperature > 75) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 10; i++) {
          const x = centerX + (Math.random() - 0.5) * 40;
          const y = centerY - 80 - i * 8 - Math.sin(time + i) * 10;
          const size = 3 + Math.sin(time + i) * 2;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Temperature glow effect
      const tempRatio = (temperature - 70) / 30;
      ctx.shadowColor = `hsl(${30 - tempRatio * 30}, 100%, 50%)`;
      ctx.shadowBlur = 20 * tempRatio;
      
      // Hourglass
      const hourglassX = centerX + 120;
      const hourglassY = centerY;
      
      // Hourglass outline
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hourglassX - 25, hourglassY - 40);
      ctx.lineTo(hourglassX + 25, hourglassY - 40);
      ctx.lineTo(hourglassX + 5, hourglassY);
      ctx.lineTo(hourglassX + 25, hourglassY + 40);
      ctx.lineTo(hourglassX - 25, hourglassY + 40);
      ctx.lineTo(hourglassX - 5, hourglassY);
      ctx.closePath();
      ctx.stroke();
      
      // Sand
      ctx.fillStyle = '#d4a574';
      const sandHeight = (brewingTime / 60) * 35;
      ctx.fillRect(hourglassX - 20, hourglassY + 40 - sandHeight, 40, sandHeight);
      
      // Top sand (remaining)
      const remainingSand = 35 - sandHeight;
      if (remainingSand > 0) {
        ctx.fillRect(hourglassX - 20, hourglassY - 40, 40, remainingSand);
      }
      
      // Falling sand stream
      if (brewingTime > 0 && remainingSand > 0) {
        ctx.strokeStyle = '#d4a574';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hourglassX, hourglassY - 5);
        ctx.lineTo(hourglassX, hourglassY + 5);
        ctx.stroke();
      }
      
      // Add some sparkle effects
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 5; i++) {
        const sparkleX = centerX + Math.sin(time + i) * 80;
        const sparkleY = centerY + Math.cos(time + i * 1.5) * 60;
        const sparkleSize = 1 + Math.sin(time * 3 + i) * 0.5;
        
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [temperature, brewingTime, teaConcentration]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #444',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)'
        }}
      />
      <div style={{ 
        marginTop: 15, 
        color: 'white', 
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 400
      }}>
        🎨 <strong>Enhanced 2D Visualization</strong><br/>
        ✨ Animated ripples • 💨 Steam effects • ⏳ Sand physics<br/>
        🌡️ Temperature: {temperature}°C • 🍵 Strength: {Math.round(teaConcentration * 100)}%
      </div>
    </View>
  );
}