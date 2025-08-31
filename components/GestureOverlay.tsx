import React, { useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { VESSEL_STEPS, snapVessel } from '../lib/buckets';
import RadialBuckets from './RadialBuckets';
import { useTheme } from '../lib/theme';

export default function GestureOverlay({ vesselMl, tempC, onChange, onEnd }:{ vesselMl:number; tempC:number; onChange:(vessel:number,temp:number)=>void; onEnd?:(vessel:number,temp:number)=>void }){
  const theme = useTheme();
  const baseV = useRef(vesselMl); baseV.current = vesselMl;
  const baseT = useRef(tempC); baseT.current = tempC;
  const display = useSharedValue(0);
  const [liveV, setLiveV] = useState(vesselMl);
  const [liveT, setLiveT] = useState(tempC);

  const pinch = Gesture.Pinch()
    .onChange(e => {
      const v = Math.max(70, Math.min(200, Math.round(baseV.current * e.scale)));
      setLiveV(v); 
      onChange(v, liveT); 
      display.value = 1;
    })
    .onEnd(() => {
      const snapped = snapVessel(liveV);
      setLiveV(snapped); 
      onChange(snapped, liveT); 
      onEnd?.(snapped, liveT);
      display.value = withTiming(0, { duration: 800 });
    });

  const rotation = Gesture.Rotation()
    .onChange(e => {
      const d = e.rotation * (180/Math.PI);
      const t = Math.max(60, Math.min(100, Math.round(baseT.current + d*0.5)));
      setLiveT(t); 
      onChange(liveV, t); 
      display.value = 1;
    })
    .onEnd(() => { 
      onEnd?.(liveV, liveT); 
      display.value = withTiming(0, { duration: 800 }); 
    });

  const combined = Gesture.Simultaneous(pinch, rotation);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: display.value
  }));

  return (
    <GestureDetector gesture={combined}>
      <Animated.View 
        style={[
          { 
            position: 'absolute', 
            left: 0, 
            right: 0, 
            top: 0, 
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center'
          }, 
          animatedStyle
        ]} 
        pointerEvents="auto"
      >
        <RadialBuckets vesselMl={liveV} />
        
        {/* Gesture feedback overlay */}
        <View style={{ 
          position: 'absolute', 
          top: 16, 
          alignSelf: 'center', 
          backgroundColor: theme.colors.overlay, 
          paddingHorizontal: 16, 
          paddingVertical: 8, 
          borderRadius: 20,
          borderWidth: 1,
          borderColor: `${theme.colors.primary}80`
        }}>
          <Text style={{ 
            color: theme.colors.text, 
            fontSize: 14,
            fontWeight: '500'
          }}>
            Vessel: {Math.round(liveV)}ml  •  Temp: {liveT}°C
          </Text>
          <Text style={{ 
            color: theme.colors.textSecondary, 
            fontSize: 11,
            textAlign: 'center',
            marginTop: 2
          }}>
            Pinch vessel • Rotate temperature
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
