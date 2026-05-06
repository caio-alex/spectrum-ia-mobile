// src/navigation/index.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/home/HomeScreen'; // Assumindo que a Home já foi criada
import { SearchScreen } from '../screens/search/SearchScreen';
import { CategoriesScreen } from '../screens/search/CategoriesScreen';
import { ProcessingScreen } from '../screens/search/ProcessingScreen';
import { ResultScreen } from '../screens/result/ResultScreen';
const Stack = createNativeStackNavigator();

export const RootNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tela inicial do fluxo de autenticação */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      
      {/* Adiciona as novas rotas do fluxo de pesquisa */}
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Processing" component={ProcessingScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      {/* Fluxo principal (MainTabs ou Home) */}
      <Stack.Screen name="MainTabs" component={HomeScreen} />
    </Stack.Navigator>
  );
};