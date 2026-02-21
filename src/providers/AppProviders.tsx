import { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { COLORS } from '@/constants';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={COLORS.BACKGROUND} />
      {children}
    </SafeAreaProvider>
  );
}
