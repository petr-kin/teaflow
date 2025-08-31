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
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#F1F3F4',
    primary: '#2F7A55',
    primaryVariant: '#1B5E20',
    secondary: '#4CAF50',
    text: '#212121',
    textSecondary: '#757575',
    textTertiary: '#9E9E9E',
    accent: '#FF9800',
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    overlay: 'rgba(0,0,0,0.5)',
    border: '#E0E0E0',
    shadow: 'rgba(0,0,0,0.12)',
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0F1412',
    surface: '#1A2F23',
    surfaceVariant: '#2D3F32',
    primary: '#2F7A55',
    primaryVariant: '#4CAF50',
    secondary: '#66BB6A',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.7)',
    textTertiary: 'rgba(255,255,255,0.5)',
    accent: '#FFB74D',
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    overlay: 'rgba(0,0,0,0.8)',
    border: 'rgba(255,255,255,0.1)',
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