// src/navigation/index.tsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
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
import { useAuth } from '../contexts';
import { theme } from '../styles/theme';

const Stack = createNativeStackNavigator();

export const RootNavigation = () => {
  const { signed, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
        }}
      >
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {signed ? (
        <>
          <Stack.Screen name="MainTabs" component={HomeScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Sessions" component={SessionsScreen} />
          <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Processing" component={ProcessingScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="FieldDetail" component={FieldDetailScreen} />
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
