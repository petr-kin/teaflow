import React, { useEffect, useRef, useState } from 'react';
import Svg, { Rect, Circle, Path, G } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedProps, Easing } from 'react-native-reanimated';

type Grain = { x: number; y: number; vy: number; };

export default function HourglassGrains({ progress = 0, running = false }: { progress: number; running?: boolean }) {
  const [_, setTick] = useState(0);
  const grains = useRef<Grain[]>(
    Array.from({ length: 40 }, (_, i) => ({
      x: 85 + (i % 6) * 5 - 15,
      y: 40 + Math.floor(i / 6) * 8,
      vy: 0.8 + Math.random() * 1.2
    }))
  );

  // Reanimated phase for frame-synced effects (stream flicker, micro-motion)
  const phase = useSharedValue(0);

  useEffect(() => {
    if (!running) return; 
    phase.value = withRepeat(withTiming(2 * Math.PI, { duration: 1600, easing: Easing.linear }), -1, false);
  }, [running, phase]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTick(t => t + 1);
      grains.current.forEach(g => {
        if (g.y < 160 + progress * 40) {
          g.y += g.vy;
          // Add slight horizontal movement near neck
          if (g.y > 115 && g.y < 125) {
            g.x += (100 - g.x) * 0.05;
          }
        }
      });
    }, 50);
    return () => clearInterval(id);
  }, [running, progress]);

  const p = Math.max(0, Math.min(1, progress));

  const AnimatedG = Animated.createAnimatedComponent(G);
  const AnimatedRect = Animated.createAnimatedComponent(Rect);
  const streamProps = useAnimatedProps(() => {
    const op = 0.6 + 0.35 * Math.sin(phase.value * 3.2);
    return { opacity: op } as any;
  });

  return (
    <View style={styles.container}>
      <Svg width={220} height={300} viewBox="0 0 220 300">
        {/* Hourglass outline with better proportions */}
        <Path
          d="M 70 50 L 150 50 L 150 115 L 110 135 L 70 115 Z M 70 165 L 110 145 L 150 165 L 150 230 L 70 230 Z"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Top chamber sand - animated */}
        <G opacity={0.8}>
          <Path
            d={`M 75 ${115 - p * 60} L 145 ${115 - p * 60} L ${110 + p * 15} 115 L ${110 - p * 15} 115 Z`}
            fill="rgba(255,210,140,0.7)"
          />
        </G>
        
        {/* Bottom chamber sand - accumulated */}
        <G opacity={0.8}>
          <Path
            d={`M ${110 - p * 35} 165 L ${110 + p * 35} 165 L ${145 * p + 110 * (1-p)} ${225 * p + 165 * (1-p)} L ${75 * p + 110 * (1-p)} ${225 * p + 165 * (1-p)} Z`}
            fill="rgba(255,210,140,0.8)"
          />
        </G>
        
        {/* Neck of hourglass */}
        <Path
          d="M 106 135 L 114 135 L 114 145 L 106 145 Z"
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        
        {/* Falling sand stream - animated */}
        {running && p < 0.95 && (
          <AnimatedG animatedProps={streamProps}>
            <AnimatedRect
              x="108"
              y="135"
              width="4"
              height="30"
              fill="rgba(255,210,140,0.9)"
            />
            <Circle cx="110" cy="145" r="1.5" fill="rgba(255,210,140,1)" />
            <Circle cx="110" cy="155" r="1" fill="rgba(255,210,140,0.8)" />
          </AnimatedG>
        )}
        
        {/* Sand grains - more realistic positioning */}
        {grains.current.slice(0, Math.floor(25 * (1 - p))).map((g, i) => (
          <Circle
            key={i}
            cx={Math.max(75, Math.min(145, g.x))}
            cy={Math.min(g.y, 165 + p * 55)}
            r={i % 3 === 0 ? "2.5" : "2"}
            fill="rgba(255,200,120,0.9)"
            opacity={g.y < 135 ? 0.9 : 0.7}
          />
        ))}
        
        {/* Subtle glow effect around hourglass */}
        <Path
          d="M 70 50 L 150 50 L 150 115 L 110 135 L 70 115 Z M 70 165 L 110 145 L 150 165 L 150 230 L 70 230 Z"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="none"
          opacity="0.3"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 200,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
