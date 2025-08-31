import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Line, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { VESSEL_STEPS, snapVessel } from '../lib/buckets';
import { useTheme } from '../lib/theme';

export default function RadialBuckets({ vesselMl, progress }: { vesselMl: number; progress?: number }) {
  const theme = useTheme();
  const active = snapVessel(vesselMl);
  const cx = 110;
  const cy = 150;
  const r = 95;
  const steps = VESSEL_STEPS;
  const p = Math.max(0, Math.min(1, progress ?? 0));

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={220} height={280} viewBox="0 0 220 280">
        <Defs>
          <LinearGradient id="tickGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgba(47,122,85,0.8)" />
            <Stop offset="1" stopColor="rgba(47,122,85,0.4)" />
          </LinearGradient>
        </Defs>
        
        {/* Main circle with dashed stroke */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          strokeDasharray="4,6"
          fill="none"
        />

        {/* Progress ring */}
        <G>
          {(() => {
            const circumference = 2 * Math.PI * (r - 6);
            const offset = circumference * (1 - p);
            return (
              <Circle
                cx={cx}
                cy={cy}
                r={r - 6}
                stroke={theme.colors.primary}
                strokeOpacity={0.7}
                strokeWidth="4"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${offset}`}
                fill="none"
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
          })()}
        </G>
        
        {/* Inner guide circle */}
        <Circle
          cx={cx}
          cy={cy}
          r={r - 30}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          fill="none"
        />
        
        {/* Vessel size indicators */}
        <G>
          {steps.map((s, idx) => {
            const angle = -90 + (idx / (steps.length - 1)) * 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = cx + (r - 15) * Math.cos(rad);
            const y1 = cy + (r - 15) * Math.sin(rad);
            const x2 = cx + (r - 2) * Math.cos(rad);
            const y2 = cy + (r - 2) * Math.sin(rad);
            const labelX = cx + (r - 30) * Math.cos(rad);
            const labelY = cy + (r - 30) * Math.sin(rad);
            const isActive = s === active;
            
            return (
              <G key={`vessel-${idx}`}>
                {/* Tick mark */}
                <Line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? 'url(#tickGradient)' : 'rgba(255,255,255,0.4)'}
                  strokeWidth={isActive ? 3 : 2}
                  strokeLinecap="round"
                />
                
                {/* Active indicator dot */}
                {isActive && (
                  <Circle
                    cx={x2}
                    cy={y2}
                    r="4"
                    fill="rgba(47,122,85,0.9)"
                    stroke="rgba(47,122,85,0.3)"
                    strokeWidth="2"
                  />
                )}
                
                {/* Label */}
                <SvgText
                  x={labelX}
                  y={labelY + 3}
                  fill={isActive ? 'rgba(47,122,85,0.95)' : 'rgba(255,255,255,0.6)'}
                  fontSize={isActive ? "13" : "11"}
                  fontWeight={isActive ? "600" : "400"}
                  textAnchor="middle"
                >
                  {s}
                </SvgText>
              </G>
            );
          })}
        </G>
        
        {/* Center highlight for active vessel */}
        {active && (
          <G>
            <Circle
              cx={cx}
              cy={cy}
              r="8"
              fill="rgba(47,122,85,0.1)"
              stroke="rgba(47,122,85,0.3)"
              strokeWidth="1"
            />
            <SvgText
              x={cx}
              y={cy + 4}
              fill="rgba(47,122,85,0.8)"
              fontSize="12"
              fontWeight="600"
              textAnchor="middle"
            >
              {active}
            </SvgText>
          </G>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 220,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
