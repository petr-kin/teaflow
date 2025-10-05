import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceVariant: string;
    primary: string;
    primaryVariant: string;
    secondary: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    accent: string;
    error: string;
    warning: string;
    success: string;
    overlay: string;
    border: string;
    shadow: string;
  };
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    // Tea-inspired primary colors
    background: '#F5F5F0', // porcelain
    surface: '#FAFAFA',    // steamWhite
    surfaceVariant: '#F5F5F0', // porcelain variant
    primary: '#4A6741',    // teaGreen
    primaryVariant: '#3A5431', // darker teaGreen
    secondary: '#B8860B',  // goldenOolong
    text: '#2D2D2D',       // softBlack
    textSecondary: '#6B6B6B', // clayGray
    textTertiary: '#A8A8A8',  // mistGray
    accent: '#D2691E',     // steepingAmber
    error: '#D32F2F',      // errorRed
    warning: '#D2691E',    // steepingAmber
    success: '#4A6741',    // teaGreen
    overlay: 'rgba(45,45,45,0.5)', // softBlack overlay
    border: '#E0E0E0',
    shadow: 'rgba(45,45,45,0.12)', // softBlack shadow
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    // Dark tea-inspired colors for evening brewing sessions
    background: '#1A1A1A',    // Deep tea background
    surface: '#2D2D2D',       // Darker surface (softBlack variant)
    surfaceVariant: '#3A3A3A', // Elevated surface
    primary: '#4A6741',       // teaGreen (same as light for consistency)
    primaryVariant: '#5A7751', // lighter teaGreen for dark mode
    secondary: '#B8860B',     // goldenOolong (same as light)
    text: '#FAFAFA',         // steamWhite
    textSecondary: '#A8A8A8', // mistGray
    textTertiary: '#6B6B6B',  // clayGray
    accent: '#D2691E',       // steepingAmber
    error: '#F56565',        // lighter errorRed for dark backgrounds
    warning: '#D2691E',      // steepingAmber
    success: '#4A6741',      // teaGreen
    overlay: 'rgba(0,0,0,0.8)',
    border: 'rgba(168,168,168,0.2)', // mistGray transparent
    shadow: 'rgba(0,0,0,0.5)',
  },
};

const THEME_KEY = 'gongfu:theme';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme = darkTheme;
  private listeners: ((theme: Theme) => void)[] = [];

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_KEY);
      const mode = (savedMode as ThemeMode) || 'dark';
      await this.setTheme(mode);
    } catch (error) {
      console.error('Error initializing theme:', error);
    }
  }

  async setTheme(mode: ThemeMode): Promise<void> {
    let theme: Theme;
    
    if (mode === 'auto') {
      // For web/desktop, we could check system preference
      // For now, default to dark for 'auto'
      theme = darkTheme;
    } else {
      theme = mode === 'light' ? lightTheme : darkTheme;
    }
    
    theme.mode = mode; // Preserve the selected mode
    this.currentTheme = theme;
    
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(theme));
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// React Context
export const ThemeContext = createContext<Theme>(darkTheme);

export const useTheme = (): Theme => {
  return useContext(ThemeContext);
};

// Theme-aware style helpers
export const createThemedStyles = <T extends Record<string, any>>(
  styleFactory: (theme: Theme) => T
) => {
  return (theme: Theme): T => styleFactory(theme);
};

// Common themed components styles
export const getThemedStyles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.colors.background,
  },
  surface: {
    backgroundColor: theme.colors.surface,
  },
  surfaceVariant: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  text: {
    color: theme.colors.text,
  },
  textSecondary: {
    color: theme.colors.textSecondary,
  },
  textTertiary: {
    color: theme.colors.textTertiary,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: theme.colors.primary,
  },
  border: {
    borderColor: theme.colors.border,
  },
  shadow: {
    shadowColor: theme.colors.shadow,
  },
});

export default ThemeManager;