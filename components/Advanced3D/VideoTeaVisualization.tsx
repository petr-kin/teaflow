import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';

interface VideoTeaVisualizationProps {
  temperature: number;
  brewingTime: number;
  teaConcentration: number;
  teaType?: 'green' | 'black' | 'white' | 'oolong';
  isTimerPaused?: boolean;
}

export default function VideoTeaVisualization({ 
  temperature = 85, 
  brewingTime = 0, 
  teaConcentration = 0.3,
  teaType = 'black',
  isTimerPaused = false
}: VideoTeaVisualizationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hourglassVideoRef = useRef<HTMLVideoElement>(null);
  
  // Calculate video speed based on brewing parameters
  const calculateVideoSpeed = (temp: number, type: string, concentration: number) => {
    const baseSpeed = 1.0;
    
    // Temperature affects steeping speed
    const tempMultiplier = temp > 90 ? 1.5 :   // Hot = faster
                          temp > 80 ? 1.0 :   // Normal  
                          0.7;                // Cooler = slower
    
    // Tea type affects extraction rate
    const teaMultiplier = type === 'green' ? 0.8 :  // Green = delicate, slower
                         type === 'black' ? 1.2 :  // Black = robust, faster
                         type === 'white' ? 0.6 :  // White = very slow
                         type === 'oolong' ? 1.0 : // Oolong = balanced
                         1.0;                       // Default
    
    // Target strength affects speed
    const strengthMultiplier = concentration > 0.8 ? 1.3 : // Strong = faster
                              concentration < 0.3 ? 0.7 : // Light = slower
                              1.0;                         // Normal
    
    return Math.max(0.3, Math.min(2.0, baseSpeed * tempMultiplier * teaMultiplier * strengthMultiplier));
  };
  
  // Choose video based on calculated speed
  const getVideoSource = (speed: number) => {
    if (speed > 1.3) return './videos/fast-steeping.mp4';
    if (speed < 0.8) return './videos/slow-steeping.mp4';
    return './videos/normal-steeping.mp4';
  };
  
  // Update video speed when parameters change
  useEffect(() => {
    if (videoRef.current) {
      const speed = calculateVideoSpeed(temperature, teaType, teaConcentration);
      videoRef.current.playbackRate = speed;
      
      // Switch video source if speed is very different
      const newSource = getVideoSource(speed);
      if (videoRef.current.src !== newSource) {
        videoRef.current.src = newSource;
      }
    }
  }, [temperature, teaType, teaConcentration]);
  
  // Handle timer pause/play
  useEffect(() => {
    if (videoRef.current && hourglassVideoRef.current) {
      if (isTimerPaused) {
        videoRef.current.pause();
        hourglassVideoRef.current.pause();
      } else {
        videoRef.current.play();
        hourglassVideoRef.current.play();
      }
    }
  }, [isTimerPaused]);
  
  // Calculate current speed for display
  const currentSpeed = calculateVideoSpeed(temperature, teaType, teaConcentration);
  const speedText = currentSpeed > 1.2 ? 'Fast Brewing' :
                   currentSpeed < 0.8 ? 'Gentle Steeping' :
                   'Normal Brewing';
  
  return (
    <View style={{ 
      width: 400, 
      height: 300, 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#1a1a2e',
      borderRadius: 15,
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* Main Tea Steeping Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '70%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '10px'
        }}
        src="./videos/normal-steeping.mp4"
        onError={() => console.log('Video failed to load')}
      />
      
      {/* Hourglass Timer Video */}
      <video
        ref={hourglassVideoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          width: '80px',
          height: '120px',
          objectFit: 'cover',
          borderRadius: '5px',
          opacity: 0.9
        }}
        src="./videos/hourglass-timer.mp4"
      />
      
      {/* Info Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '15px',
        right: '15px',
        textAlign: 'center',
        color: 'white',
        fontSize: '12px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '8px',
        borderRadius: '8px',
        backdropFilter: 'blur(5px)'
      }}>
        <strong>🎬 {speedText}</strong><br/>
        🌡️ {temperature}°C • 🍵 {teaType} • 💪 {Math.round(teaConcentration * 100)}% • ⚡ {currentSpeed.toFixed(1)}x
      </div>
      
      {/* Speed Indicator */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        color: currentSpeed > 1.2 ? '#ff6b6b' : 
              currentSpeed < 0.8 ? '#4ecdc4' : 
              '#95e1d3',
        fontSize: '14px',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(0,0,0,0.8)'
      }}>
        {currentSpeed > 1.2 ? '🔥 FAST' :
         currentSpeed < 0.8 ? '🧘 GENTLE' :
         '⚖️ NORMAL'}
      </div>
      
      {/* Pause Indicator */}
      {isTimerPaused && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '48px',
          color: 'rgba(255, 255, 255, 0.8)',
          textShadow: '0 0 20px rgba(0,0,0,0.8)',
          pointerEvents: 'none'
        }}>
          ⏸️
        </div>
      )}
    </View>
  );
}