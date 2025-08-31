import React, { useState, useEffect } from 'react';
import { View, ViewStyle, Text } from 'react-native';
import ResponsiveManager, { ResponsiveConfig } from '../lib/responsive';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number | string;
  centered?: boolean;
  padding?: boolean;
}

export default function ResponsiveView({ 
  children, 
  style, 
  maxWidth,
  centered = false,
  padding = true
}: Props) {
  const [config, setConfig] = useState<ResponsiveConfig>(ResponsiveManager.getInstance().getConfig());

  useEffect(() => {
    const responsiveManager = ResponsiveManager.getInstance();
    const unsubscribe = responsiveManager.subscribe(setConfig);
    return unsubscribe;
  }, []);

  const containerStyle: ViewStyle = {
    width: '100%',
    ...(maxWidth && { maxWidth: maxWidth as any }),
    ...(centered && {
      alignSelf: 'center',
    }),
    ...(padding && {
      paddingHorizontal: config.current.isPhone ? 16 : 24,
      paddingVertical: config.current.isPhone ? 12 : 16,
    }),
    ...style,
  };

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}

// Responsive grid component
interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  style?: ViewStyle;
}

export function ResponsiveGrid({ children, columns, gap, style }: GridProps) {
  const [config, setConfig] = useState<ResponsiveConfig>(ResponsiveManager.getInstance().getConfig());

  useEffect(() => {
    const responsiveManager = ResponsiveManager.getInstance();
    const unsubscribe = responsiveManager.subscribe(setConfig);
    return unsubscribe;
  }, []);

  const responsiveManager = ResponsiveManager.getInstance();
  const finalColumns = columns || responsiveManager.columns();
  const finalGap = gap || (config.current.isPhone ? 12 : 16);

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: finalGap,
    ...style,
  };

  return (
    <View style={gridStyle}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const itemWidth = `${(100 - ((finalColumns - 1) * 2)) / finalColumns}%`;
        
        return React.cloneElement(child as React.ReactElement<any>, {
          ...(child.props as any),
          style: [
            (child.props as any)?.style,
            { width: itemWidth }
          ]
        });
      })}
    </View>
  );
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  style?: any;
  [key: string]: any;
}

export function ResponsiveText({ 
  children, 
  variant = 'body', 
  style, 
  ...props 
}: ResponsiveTextProps) {
  const [config, setConfig] = useState<ResponsiveConfig>(ResponsiveManager.getInstance().getConfig());

  useEffect(() => {
    const responsiveManager = ResponsiveManager.getInstance();
    const unsubscribe = responsiveManager.subscribe(setConfig);
    return unsubscribe;
  }, []);

  const responsiveManager = ResponsiveManager.getInstance();
  const fontSize = {
    h1: responsiveManager.fontSize(28),
    h2: responsiveManager.fontSize(24),
    h3: responsiveManager.fontSize(20),
    h4: responsiveManager.fontSize(18),
    body: responsiveManager.fontSize(16),
    caption: responsiveManager.fontSize(14),
  }[variant];

  return (
    <Text style={[{ fontSize }, style]} {...props}>
      {children}
    </Text>
  );
}

// Hook for responsive values in components
export function useResponsive() {
  const [config, setConfig] = useState<ResponsiveConfig>(ResponsiveManager.getInstance().getConfig());

  useEffect(() => {
    const responsiveManager = ResponsiveManager.getInstance();
    const unsubscribe = responsiveManager.subscribe(setConfig);
    return unsubscribe;
  }, []);

  return {
    config,
    isPhone: config.current.isPhone,
    isTablet: config.current.isTablet,
    isDesktop: config.current.isDesktop,
    isLandscape: config.current.isLandscape,
    isPortrait: config.current.isPortrait,
    scale: config.current.scale,
    select: ResponsiveManager.getInstance().select.bind(ResponsiveManager.getInstance()),
    spacing: ResponsiveManager.getInstance().spacing.bind(ResponsiveManager.getInstance()),
    fontSize: ResponsiveManager.getInstance().fontSize.bind(ResponsiveManager.getInstance()),
  };
}