// src/navigation/index.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/home/HomeScreen'; // Assumindo que a Home já foi criada

const Stack = createNativeStackNavigator();

export const RootNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tela inicial do fluxo de autenticação */}
      <Stack.Screen name="Login" component={LoginScreen} />
      
      {/* Fluxo principal (MainTabs ou Home) */}
      <Stack.Screen name="MainTabs" component={HomeScreen} />
    </Stack.Navigator>
  );
};