import { type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';

import { store, persistor } from '@/store';
import { useAppInit } from '@/hooks/use-app-init';
import { NavigationGuard } from '@/navigation/NavigationGuard';

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
            <StatusBar style="light" />
            <NavigationGuard>{children}</NavigationGuard>
            <Toast />
          </SafeAreaProvider>
        </AppInit>
      </PersistGate>
    </Provider>
  );
}
