import { Dimensions, Platform } from 'react-native';

export interface ScreenDimensions {
  width: number;
  height: number;
}

export interface ResponsiveConfig {
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  current: {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    isPhone: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isLandscape: boolean;
    isPortrait: boolean;
    scale: number;
  };
  dimensions: ScreenDimensions;
}

class ResponsiveManager {
  private static instance: ResponsiveManager;
  private config: ResponsiveConfig;
  private listeners: ((config: ResponsiveConfig) => void)[] = [];

  private constructor() {
    this.config = this.calculateConfig();
    this.setupListener();
  }

  static getInstance(): ResponsiveManager {
    if (!ResponsiveManager.instance) {
      ResponsiveManager.instance = new ResponsiveManager();
    }
    return ResponsiveManager.instance;
  }

  private calculateConfig(): ResponsiveConfig {
    const { width, height } = Dimensions.get('window');
    const isLandscape = width > height;
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);

    // Breakpoints based on smallest dimension
    const breakpoints = {
      xs: 320,  // Small phones
      sm: 480,  // Large phones / small tablets
      md: 768,  // Tablets
      lg: 1024, // Large tablets / small desktop
      xl: 1200  // Desktop
    };

    let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'xs';
    if (minDimension >= breakpoints.xl) size = 'xl';
    else if (minDimension >= breakpoints.lg) size = 'lg';
    else if (minDimension >= breakpoints.md) size = 'md';
    else if (minDimension >= breakpoints.sm) size = 'sm';

    // Device type classification
    const isPhone = minDimension < 600;
    const isTablet = minDimension >= 600 && minDimension < 900;
    const isDesktop = minDimension >= 900;

    // Scale factor for responsive sizing
    const baseWidth = 375; // iPhone X width
    const scale = Math.min(width / baseWidth, 1.5); // Cap scale at 1.5x

    return {
      breakpoints,
      current: {
        size,
        isPhone,
        isTablet,
        isDesktop,
        isLandscape,
        isPortrait: !isLandscape,
        scale,
      },
      dimensions: { width, height }
    };
  }

  private setupListener(): void {
    const subscription = Dimensions.addEventListener('change', () => {
      const newConfig = this.calculateConfig();
      this.config = newConfig;
      this.notifyListeners();
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }

  getConfig(): ResponsiveConfig {
    return this.config;
  }

  subscribe(listener: (config: ResponsiveConfig) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Utility methods for responsive values
  select<T>(values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    default: T;
  }): T {
    const { size } = this.config.current;
    return values[size] ?? values.default;
  }

  scale(value: number): number {
    return value * this.config.current.scale;
  }

  spacing(base: number): number {
    return this.select({
      xs: base,
      sm: base * 1.1,
      md: base * 1.2,
      lg: base * 1.3,
      xl: base * 1.4,
      default: base
    });
  }

  fontSize(base: number): number {
    return this.select({
      xs: base,
      sm: base * 1.05,
      md: base * 1.1,
      lg: base * 1.15,
      xl: base * 1.2,
      default: base
    });
  }

  columns(): number {
    return this.select({
      xs: 1,
      sm: 2,
      md: 2,
      lg: 3,
      xl: 4,
      default: 1
    });
  }

  maxWidth(): number {
    return this.select({
      xs: '100%' as any,
      sm: '100%' as any,
      md: 600,
      lg: 800,
      xl: 1000,
      default: '100%' as any
    });
  }
}

// Hook-like function for React components
export const useResponsive = () => {
  return ResponsiveManager.getInstance().getConfig();
};

// Utility functions
export const responsive = ResponsiveManager.getInstance();

// Common responsive patterns
export const ResponsiveStyles = {
  container: (config: ResponsiveConfig) => ({
    paddingHorizontal: config.current.isPhone ? 16 : 24,
    paddingVertical: config.current.isPhone ? 12 : 16,
  }),

  grid: (config: ResponsiveConfig, itemsPerRow?: number) => {
    const columns = itemsPerRow || responsive.columns();
    const gap = config.current.isPhone ? 12 : 16;
    const itemWidth = `${(100 - (columns - 1) * 2) / columns}%`;
    
    return {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap,
      itemWidth,
    };
  },

  typography: (config: ResponsiveConfig) => ({
    h1: { fontSize: responsive.fontSize(28) },
    h2: { fontSize: responsive.fontSize(24) },
    h3: { fontSize: responsive.fontSize(20) },
    h4: { fontSize: responsive.fontSize(18) },
    body: { fontSize: responsive.fontSize(16) },
    caption: { fontSize: responsive.fontSize(14) },
  }),

  spacing: (config: ResponsiveConfig) => ({
    xs: responsive.spacing(4),
    sm: responsive.spacing(8),
    md: responsive.spacing(16),
    lg: responsive.spacing(24),
    xl: responsive.spacing(32),
  }),

  modal: (config: ResponsiveConfig) => ({
    maxWidth: config.current.isPhone ? '95%' : '90%',
    maxHeight: config.current.isPhone ? '90%' : '80%',
    marginHorizontal: config.current.isPhone ? 10 : 20,
  }),

  timer: (config: ResponsiveConfig) => ({
    size: config.current.isPhone ? 200 : 250,
    fontSize: config.current.isPhone ? 32 : 40,
  }),

  teaCard: (config: ResponsiveConfig) => {
    const columns = responsive.columns();
    const gap = responsive.spacing(12);
    const containerWidth = config.dimensions.width - (responsive.spacing(16) * 2);
    const itemWidth = (containerWidth - (gap * (columns - 1))) / columns;
    
    return {
      width: itemWidth,
      minHeight: config.current.isPhone ? 100 : 120,
      padding: responsive.spacing(12),
    };
  },
};

export default ResponsiveManager;