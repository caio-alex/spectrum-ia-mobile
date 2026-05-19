// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../styles/login.styles';
import { useAuth } from '../../contexts';
import axios from 'axios';

export const LoginScreen = ({ navigation }: any) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      navigation.replace('MainTabs');
    } catch (err) {
      setError(extractAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoIcon}>
          <Image
            source={require('../../../assets/spectrum-logo-icone.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.logoTextContainer}>
          <Image
            source={require('../../../assets/spectrum-logo-texto.png')}
            style={styles.logoTextImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subTitle}>Análise competitiva automotiva</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Entrar na plataforma</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-MAIL CORPORATIVO</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="exemplo@empresa.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            autoCapitalize="none"
            autoComplete="password"
            editable={!isSubmitting}
          />
        </View>

        {error ? (
          <Text style={{ color: '#c0392b', marginBottom: 12 }}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, isSubmitting && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isSubmitting}>
          <Text style={styles.forgotPassword}>Criar conta corporativa</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

function extractAuthError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) return 'E-mail ou senha inválidos.';
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.code === 'ECONNABORTED') return 'Tempo esgotado. Verifique sua conexão.';
    return 'Não foi possível entrar. Tente novamente.';
  }
  return 'Erro inesperado. Tente novamente.';
}
