import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Sora_400Regular, Sora_700Bold } from '@expo-google-fonts/sora';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, SessionProvider } from './src/contexts';
import { RootNavigation } from './src/navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessionProvider>
            <NavigationContainer>
              <RootNavigation />
            </NavigationContainer>
          </SessionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
