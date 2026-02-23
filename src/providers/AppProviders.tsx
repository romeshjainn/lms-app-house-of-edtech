import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { BiometricLockOverlay } from '@/components/common/BiometricLockOverlay';
import { useAppInit } from '@/hooks/use-app-init';
import { NavigationGuard } from '@/navigation/NavigationGuard';
import { persistor, store } from '@/store';
import { ThemeProvider } from '@/theme/ThemeContext';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

function AppInit({ children }: { children: ReactNode }) {
  useAppInit();
  return <>{children}</>;
}

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppInit>
          <SafeAreaProvider>
            <ThemeProvider>
              <StatusBar style="light" />
              <NavigationGuard>{children}</NavigationGuard>
              <BiometricLockOverlay />
              <Toast />
            </ThemeProvider>
          </SafeAreaProvider>
        </AppInit>
      </PersistGate>
    </Provider>
  );
}
