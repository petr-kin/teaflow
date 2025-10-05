import React from 'react';
import { View } from 'react-native';

interface CSSTeaVisualizationProps {
  temperature: number;
  brewingTime: number;
  teaConcentration: number;
}

export default function CSSTeaVisualization({ temperature = 85, brewingTime = 0, teaConcentration = 0.3 }: CSSTeaVisualizationProps) {
  const tempRatio = Math.max(0, Math.min(1, (temperature - 70) / 30));
  const steamVisible = temperature > 75;
  const sandProgress = Math.min(1, Math.max(0, brewingTime) / 180); // 3 minutes max
  
  const teaColor = `hsl(${30 - teaConcentration * 20}, ${70}%, ${60 - teaConcentration * 20}%)`;
  const glowColor = `hsl(${30 - tempRatio * 30}, 100%, ${50 + tempRatio * 20}%)`;
  
  return (
    <View style={{ 
      width: 400, 
      height: 300, 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#1a1a2e'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
        borderRadius: '15px',
        border: '2px solid #444',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        {/* Tea Cup */}
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px'
        }}>
          
          {/* Cup Outline */}
          <div style={{
            width: '100px',
            height: '80px',
            border: '3px solid white',
            borderRadius: '0 0 50px 50px',
            borderTop: 'none',
            position: 'absolute',
            left: '10px',
            top: '20px',
            background: 'transparent'
          }} />
          
          {/* Cup Handle */}
          <div style={{
            width: '25px',
            height: '40px',
            border: '3px solid white',
            borderRadius: '0 25px 25px 0',
            borderLeft: 'none',
            position: 'absolute',
            right: '0',
            top: '35px'
          }} />
          
          {/* Tea Surface */}
          <div style={{
            width: '90px',
            height: '60px',
            background: teaColor,
            borderRadius: '0 0 45px 45px',
            position: 'absolute',
            left: '15px',
            top: '25px',
            boxShadow: steamVisible ? `0 0 20px ${glowColor}` : 'none',
            animation: 'ripple 2s ease-in-out infinite',
            overflow: 'hidden'
          }}>
            {/* Ripple Effect */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '100%',
              background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
              animation: 'wave 3s ease-in-out infinite'
            }} />
            
            {/* Foam */}
            {teaConcentration < 0.5 && (
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '10px',
                right: '10px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                animation: 'foam 2s ease-in-out infinite'
              }} />
            )}
          </div>
          
          {/* Steam Particles */}
          {steamVisible && (
            <>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '4px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '50%',
                    left: `${45 + i * 5}px`,
                    top: '15px',
                    animation: `steam${i % 3} ${2 + i * 0.2}s ease-in-out infinite`
                  }}
                />
              ))}
            </>
          )}
        </div>
        
        {/* Hourglass */}
        <div style={{
          position: 'absolute',
          right: '40px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '100px'
        }}>
          
          {/* Hourglass Shape */}
          <div style={{
            width: '50px',
            height: '90px',
            border: '2px solid #888',
            background: 'transparent',
            position: 'relative',
            clipPath: 'polygon(0 0, 100% 0, 80% 45%, 100% 100%, 0 100%, 20% 45%)'
          }}>
            
            {/* Top Sand */}
            <div style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              right: '5px',
              height: `${(1 - sandProgress) * 35}px`,
              backgroundColor: '#d4a574',
              transition: 'height 0.5s ease'
            }} />
            
            {/* Bottom Sand */}
            <div style={{
              position: 'absolute',
              bottom: '5px',
              left: '5px',
              right: '5px',
              height: `${sandProgress * 35}px`,
              backgroundColor: '#d4a574',
              transition: 'height 0.5s ease'
            }} />
            
            {/* Falling Sand Stream */}
            {sandProgress > 0 && sandProgress < 1 && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '40px',
                width: '2px',
                height: '10px',
                backgroundColor: '#d4a574',
                transform: 'translateX(-50%)',
                animation: 'sandFall 0.5s linear infinite'
              }} />
            )}
          </div>
        </div>
        
        {/* Sparkles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              left: `${20 + i * 45}px`,
              top: `${30 + (i % 3) * 80}px`,
              animation: `sparkle${i % 4} ${1 + i * 0.3}s ease-in-out infinite`
            }}
          />
        ))}
        
        {/* Info Panel */}
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '15px',
          right: '15px',
          textAlign: 'center',
          color: 'white',
          fontSize: '12px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '8px',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          <strong>🎨 Enhanced Visual Brewing</strong><br/>
          🌡️ {temperature}°C • 🍵 {Math.round(teaConcentration * 100)}% • ⏱️ {Math.max(0, brewingTime)}s
        </div>
        
        {/* Debug info - visible text */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'yellow',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1001
        }}>
          ✅ CSS VISUAL LOADED
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes ripple {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.95); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes foam {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes steam0 {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-60px) translateX(-10px) scale(0.3); opacity: 0; }
        }
        
        @keyframes steam1 {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-70px) translateX(5px) scale(0.2); opacity: 0; }
        }
        
        @keyframes steam2 {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-65px) translateX(-5px) scale(0.4); opacity: 0; }
        }
        
        @keyframes sandFall {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(15px); }
        }
        
        @keyframes sparkle0 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes sparkle1 {
          0%, 100% { opacity: 0.3; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        @keyframes sparkle2 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          25% { opacity: 1; transform: scale(1.2) rotate(90deg); }
          75% { opacity: 0.5; transform: scale(0.8) rotate(270deg); }
        }
        
        @keyframes sparkle3 {
          0%, 100% { opacity: 0.2; transform: scale(0.3); }
          33% { opacity: 0.8; transform: scale(1.1); }
          66% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </View>
  );
}