// src/screens/home/HomeScreen.tsx
import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { theme } from '../../styles/theme';

export const HomeScreen = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <View style={{ padding: 20 }}>
      <Text style={{ color: theme.colors.textLight }}>Olá, Ana 👋</Text>
      <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>
        Spectrum<Text style={{ color: theme.colors.secondary }}> AI</Text>
      </Text>
      
      {/* Card de Pesquisa Recente (Visual) */}
      <View style={{ marginTop: 20, padding: 16, backgroundColor: theme.colors.surface, borderRadius: 12 }}>
        <Text style={{ fontWeight: '700' }}>Toyota Corolla Cross XRE</Text>
        <Text style={{ fontSize: 10, color: theme.colors.textLight }}>Motor • Segurança</Text>
      </View>
    </View>
  </SafeAreaView>
);