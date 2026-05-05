// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../../styles/theme';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('ana.silva@ford.com.br');

  const handleLogin = () => {
    // Aqui entrará a lógica do AuthContext futuramente
    // Por enquanto, apenas navegamos para o fluxo principal
    navigation.replace('MainTabs'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Azul */}
      <View style={styles.header}>
        <View style={styles.logoIcon}>
          <Text style={{ fontSize: 24 }}>⚡</Text>
        </View>
        <Text style={styles.logoText}>Spectrum<Text style={{ color: theme.colors.secondary }}> AI</Text></Text>
        <Text style={styles.subTitle}>Análise competitiva automotiva</Text>
      </View>

      {/* Card de Formulário */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Entrar na plataforma</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-MAIL CORPORATIVO</Text>
          <TextInput 
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="exemplo@empresa.com"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SENHA</Text>
          <TextInput 
            style={styles.input}
            secureTextEntry
            value="********"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primary },
  header: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logoIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(131,192,255,0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  subTitle: { color: theme.colors.secondary, opacity: 0.8, fontSize: 12 },
  formCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '700', color: theme.colors.textLight, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  forgotPassword: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
    fontSize: 12,
  }
});