// src/navigation/index.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { CategoriesScreen } from '../screens/search/CategoriesScreen';
import { ProcessingScreen } from '../screens/search/ProcessingScreen';
import { ResultScreen } from '../screens/result/ResultScreen';
import { FieldDetailScreen } from '../screens/result/FieldDetailScreen';
import { CompareScreen } from '../screens/compare/CompareScreen';
import { SessionsScreen } from '../screens/sessions/SessionsScreen';
import { SessionDetailScreen } from '../screens/sessions/SessionDetailScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { BootScreen } from '../components/BootScreen';
import { useAuth } from '../contexts';
import { theme } from '../styles/theme';

const Stack = createNativeStackNavigator();

export const RootNavigation = () => {
  const { signed, isLoading } = useAuth();

  // Mesma tela de abertura usada enquanto as fontes carregam — a transição
  // entre "carregando fontes" e "reidratando sessão" fica invisível.
  if (isLoading) return <BootScreen />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.canvas },
        animation: 'slide_from_right',
      }}
    >
      {signed ? (
        <>
          <Stack.Screen name="MainTabs" component={HomeScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Sessions" component={SessionsScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          {/* A pesquisa não deve poder ser "desfeita" com um swipe acidental. */}
          <Stack.Screen
            name="Processing"
            component={ProcessingScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen
            name="FieldDetail"
            component={FieldDetailScreen}
            options={{ animation: 'slide_from_bottom', presentation: 'transparentModal' }}
          />
          <Stack.Screen name="Compare" component={CompareScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
