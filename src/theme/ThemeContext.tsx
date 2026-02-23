import { COLORS } from '@/constants';
import { useAppSelector } from '@/store';
import { selectDarkMode } from '@/store/slices/preferences.slice';
import { createContext, useContext, type ReactNode } from 'react';

type ColorKey = keyof typeof COLORS;
export type AppColors = Readonly<Record<ColorKey, string>>;

const DARK: AppColors = {
  PRIMARY: '#3B82F6',
  PRIMARY_DARK: '#2563EB',
  PRIMARY_LIGHT: '#1E3A5F',
  SECONDARY: '#A78BFA',
  SECONDARY_DARK: '#8B5CF6',
  SECONDARY_LIGHT: '#2D1B69',
  ACCENT: '#F59E0B',
  SUCCESS: '#22C55E',
  SUCCESS_LIGHT: '#14532D',
  ERROR: '#EF4444',
  ERROR_LIGHT: '#450A0A',
  WARNING: '#F59E0B',
  WARNING_LIGHT: '#431407',
  INFO: '#38BDF8',
  INFO_LIGHT: '#0C4A6E',
  WHITE: '#1E293B',
  BLACK: '#000000',
  GRAY_50: '#0F172A',
  GRAY_100: '#1E293B',
  GRAY_200: '#334155',
  GRAY_300: '#475569',
  GRAY_400: '#64748B',
  GRAY_500: '#94A3B8',
  GRAY_600: '#CBD5E1',
  GRAY_700: '#E2E8F0',
  GRAY_800: '#F1F5F9',
  GRAY_900: '#F8FAFC',
  BACKGROUND: '#0F172A',
  SURFACE: '#1E293B',
  TEXT_PRIMARY: '#F1F5F9',
  TEXT_SECONDARY: '#94A3B8',
  TEXT_DISABLED: '#475569',
  TEXT_INVERSE: '#111827',
  BORDER: '#334155',
  BORDER_FOCUS: '#3B82F6',
  TRANSPARENT: 'transparent',
};

interface ThemeContextValue {
  colors: AppColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: COLORS as AppColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDark = useAppSelector(selectDarkMode);
  return (
    <ThemeContext.Provider value={{ colors: isDark ? DARK : (COLORS as AppColors), isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
