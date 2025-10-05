import React, { useEffect, useState, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '../../lib/theme';
import LayeredTeaAnimation from './LayeredTeaAnimation';

interface VideoTeaVisualizationProps {
  width?: number;
  height?: number;
  temperature: number;
  brewingTime: number;
  teaType: string;
  isRunning: boolean;
  onGesture?: (gestureType: 'tap' | 'leftEdge' | 'rightEdge' | 'longPress' | 'doubleTap', value?: any) => void;
  showFeedback?: boolean;
}

export default function VideoTeaVisualization({
  width = 220,
  height = 200,
  temperature = 85,
  brewingTime = 0,
  teaType = 'green',
  isRunning = false,
  onGesture,
  showFeedback = true
}: VideoTeaVisualizationProps) {
  const theme = useTheme();
  
  // Fallback to LayeredTeaAnimation for web to prevent crashes
  if (typeof window !== 'undefined') {
    return (
      <LayeredTeaAnimation
        width={width}
        height={height}
        temperature={temperature}
        brewingTime={brewingTime}
        teaType={teaType}
        isRunning={isRunning}
        onGesture={onGesture}
        showFeedback={showFeedback}
      />
    );
  }
  
  const videoRef = useRef<Video>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const steamOpacity = useRef(new Animated.Value(0)).current;
  const [currentVideo, setCurrentVideo] = useState<any>(null);

  // Video sources for different tea types
  const getVideoSource = (type: string) => {
    // Video files are optional - fallback to LayeredTeaAnimation if not available
    // For production, add actual video files to assets/videos/
    try {
      const videoMap: { [key: string]: any } = {
        // Commented out until video assets are available
        // green: require('../../assets/videos/green-tea-brewing.mp4'),
        // black: require('../../assets/videos/black-tea-brewing.mp4'),
        // oolong: require('../../assets/videos/oolong-tea-brewing.mp4'),
        // white: require('../../assets/videos/white-tea-brewing.mp4'),
        // puerh: require('../../assets/videos/puerh-tea-brewing.mp4'),
        // herbal: require('../../assets/videos/herbal-tea-brewing.mp4'),
      };
      
      return videoMap[type.toLowerCase()] || null;
    } catch (error) {
      console.log('Video assets not available, using fallback animation');
      return null;
    }
  };

  // Calculate video playback rate based on brewing time
  const getPlaybackRate = () => {
    // Slow down video as brewing progresses for zen effect
    const baseRate = 0.8;
    const progressRate = Math.max(0.3, baseRate - (brewingTime / 300) * 0.3);
    return isRunning ? progressRate : 0.1;
  };

  useEffect(() => {
    const videoSource = getVideoSource(teaType);
    if (videoSource !== currentVideo) {
      setCurrentVideo(videoSource);
    }
  }, [teaType]);

  useEffect(() => {
    if (isRunning) {
      // Fade in the video
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Steam effect based on temperature
      if (temperature > 75) {
        Animated.timing(steamOpacity, {
          toValue: Math.min(1, (temperature - 70) / 30),
          duration: 2000,
          useNativeDriver: true,
        }).start();
      }

      // Start video playback
      if (videoRef.current) {
        videoRef.current.playAsync();
      }
    } else {
      // Fade out when stopped
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: true,
      }).start();

      Animated.timing(steamOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Pause video
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    }
  }, [isRunning, temperature]);

  // Color overlay based on tea type and brewing progress
  const getColorOverlay = () => {
    const intensity = Math.min(0.4, brewingTime / 120);
    const colors: { [key: string]: string } = {
      green: `rgba(74, 124, 89, ${intensity})`,
      black: `rgba(93, 58, 43, ${intensity})`,
      oolong: `rgba(122, 92, 63, ${intensity})`,
      white: `rgba(156, 168, 156, ${intensity * 0.5})`,
      puerh: `rgba(61, 40, 23, ${intensity})`,
      herbal: `rgba(196, 155, 107, ${intensity})`,
    };
    return colors[teaType.toLowerCase()] || colors.green;
  };

  // If no video available, use LayeredTeaAnimation fallback
  if (!currentVideo) {
    return (
      <LayeredTeaAnimation
        width={width}
        height={height}
        temperature={temperature}
        brewingTime={brewingTime}
        teaType={teaType}
        isRunning={isRunning}
        onGesture={onGesture}
        showFeedback={showFeedback}
      />
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Main tea brewing video */}
      <Animated.View style={[styles.videoContainer, { opacity: fadeAnim }]}>
        <Video
          ref={videoRef}
          source={currentVideo}
          rate={getPlaybackRate()}
          volume={0} // Silent
          isLooping={true}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isRunning}
          style={[styles.video, { width, height }]}
          onError={(error) => {
            console.log('Video error:', error);
            // Set currentVideo to null to trigger LayeredTeaAnimation fallback
            setCurrentVideo(null);
          }}
        />
        
        {/* Color intensity overlay */}
        <Animated.View
          style={[
            styles.colorOverlay,
            {
              backgroundColor: getColorOverlay(),
              width,
              height,
            },
          ]}
        />
        
        {/* Steam effect overlay */}
        <Animated.View
          style={[
            styles.steamOverlay,
            {
              opacity: steamOpacity,
              width,
              height: height * 0.6,
            },
          ]}
        />
      </Animated.View>

      {/* Fallback animated background if video fails */}
      <Animated.View style={[styles.fallbackBackground, { opacity: fadeAnim }]}>
        <View
          style={[
            styles.gradientBackground,
            {
              backgroundColor: theme.colors.surface,
              width,
              height,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  video: {
    borderRadius: 12,
  },
  colorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 12,
    zIndex: 2,
  },
  steamOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    background: 'linear-gradient(to top, transparent 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 100%)',
    borderRadius: 12,
    zIndex: 3,
  },
  fallbackBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  gradientBackground: {
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
  },
});