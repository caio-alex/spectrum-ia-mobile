import React from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Sora_300Light,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, SessionProvider } from './src/contexts';
import { RootNavigation } from './src/navigation';
import { theme } from './src/styles/theme';
import { BootScreen } from './src/components/BootScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// O fundo do navigator precisa ser o azul da marca: durante as transições de
// tela é ele que aparece atrás. Com o branco padrão dava um flash claro entre
// telas escuras.
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.brand[900],
    card: theme.brand[900],
    primary: theme.brand[500],
    text: theme.colors.text,
    border: theme.colors.border,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Sora_300Light,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessionProvider>
            {fontsLoaded ? (
              <NavigationContainer theme={navTheme}>
                <RootNavigation />
              </NavigationContainer>
            ) : (
              // Sem as fontes o app renderizaria com a fonte do sistema e depois
              // "pularia" para a Sora. Melhor segurar na tela de marca.
              <View style={{ flex: 1 }}>
                <BootScreen />
              </View>
            )}
          </SessionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
