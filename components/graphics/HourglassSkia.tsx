import React, { useEffect } from 'react';
import { Canvas, Group, Circle as SkCircle, Rect as SkRect, Path as SkPathCmp, LinearGradient, vec, Skia, BlurMask, Shadow } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';

type Props = { progress: number; running?: boolean };

export default function HourglassSkia({ progress = 0, running = false }: Props) {
  const theme = useTheme();
  const p = Math.max(0, Math.min(1, progress));
  const clock = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      clock.value = Date.now();
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  // Stream flicker opacity
  const streamOpacity = useDerivedValue(() => {
    const t = clock.value / 1000;
    return 0.6 + 0.35 * Math.sin(t * 3.2);
  }, [clock]);

  // Geometry helpers matching the SVG version (220 x 300 view)
  const glassPath = Skia.Path.MakeFromSVGString(
    'M 70 50 L 150 50 L 150 115 L 110 135 L 70 115 Z M 70 165 L 110 145 L 150 165 L 150 230 L 70 230 Z'
  )!;

  // Top chamber sand shape depending on progress
  const topSandPath = useDerivedValue(() => {
    const y = 115 - p * 60;
    const xL = 110 - p * 15;
    const xR = 110 + p * 15;
    const d = `M 75 ${y} L 145 ${y} L ${xR} 115 L ${xL} 115 Z`;
    return Skia.Path.MakeFromSVGString(d)!;
  }, [p]);

  // Bottom accumulative sand
  const bottomSandPath = useDerivedValue(() => {
    const xL = 110 - p * 35;
    const xR = 110 + p * 35;
    const bR = 225 * p + 165 * (1 - p);
    const bL = 225 * p + 165 * (1 - p);
    const xR2 = 145 * p + 110 * (1 - p);
    const xL2 = 75 * p + 110 * (1 - p);
    const d = `M ${xL} 165 L ${xR} 165 L ${xR2} ${bR} L ${xL2} ${bL} Z`;
    return Skia.Path.MakeFromSVGString(d)!;
  }, [p]);

  const width = 220;
  const height = 300;

  return (
    <Canvas style={{ width, height }}>
      {/* Soft background glow */}
      <SkCircle cx={110} cy={150} r={110} color={`${theme.colors.primary}18`}>
        <BlurMask blur={22} style="outer" />
      </SkCircle>

      {/* Glass outline and subtle highlight */}
      <SkPathCmp path={glassPath} color="rgba(255,255,255,0.1)">
        <BlurMask blur={1.5} style="normal" />
      </SkPathCmp>
      <SkPathCmp path={glassPath} style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.4)" />

      {/* Top chamber sand */}
      <SkPathCmp path={topSandPath}>
        <LinearGradient start={vec(0, 55)} end={vec(0, 120)} colors={["#FFD28CCC", "#E7B06EBB"]} />
        <Shadow dx={0} dy={1} blur={2} color="#00000022" />
      </SkPathCmp>

      {/* Bottom chamber sand */}
      <SkPathCmp path={bottomSandPath}>
        <LinearGradient start={vec(0, 165)} end={vec(0, 230)} colors={["#E7B06EBB", "#C9955DAA"]} />
        <Shadow dx={0} dy={-1} blur={2} color="#00000022" />
      </SkPathCmp>

      {/* Neck */}
      <SkRect x={106} y={135} width={8} height={10} color="rgba(255,255,255,0.1)" />
      <SkPathCmp path={Skia.Path.MakeFromSVGString('M 106 135 L 114 135 L 114 145 L 106 145 Z')!} style="stroke" strokeWidth={1} color="rgba(255,255,255,0.2)" />

      {/* Sand stream */}
      {p < 0.95 && (
        <Group opacity={streamOpacity}>
          <SkRect x={108} y={135} width={4} height={30} color="rgba(255,210,140,0.95)" />
          <SkCircle cx={110} cy={145} r={1.5} color="rgba(255,210,140,1)" />
          <SkCircle cx={110} cy={155} r={1} color="rgba(255,210,140,0.85)" />
        </Group>
      )}

      {/* Outer glow accent */}
      <SkPathCmp path={glassPath} style="stroke" strokeWidth={4} color="rgba(255,255,255,0.06)" />
    </Canvas>
  );
}

