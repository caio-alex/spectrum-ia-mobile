import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Sora_400Regular, Sora_700Bold } from '@expo-google-fonts/sora';
import { NavigationContainer } from '@react-navigation/native';
// Importação dos seus contextos e navegação
import { AuthProvider, SessionProvider } from './src/contexts';
import { RootNavigation } from './src/navigation';


// Instância do cliente para requisições (similar ao padrão de services do sistema-consultas)
const queryClient = new QueryClient();

export default function App() {
  // Carregamento de fontes (Design System do Spectrum IA)
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_700Bold,
  });

  // Enquanto as fontes ou recursos não carregam, exibe o Loading
  // O sistema-consultas também utiliza componentes de Loading para estados de espera


  return (
    <NavigationContainer> 
      <AuthProvider>
        <SessionProvider>
          <RootNavigation />
        </SessionProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}