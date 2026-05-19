import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { styles } from '../../styles/login.styles';
import { useAuth } from '../../contexts';

export const RegisterScreen = ({ navigation }: any) => {
  const { signUp } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedCompany = companyName.trim();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedCompany || !trimmedName || !trimmedEmail || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter ao menos 8 caracteres.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await signUp({
        companyName: trimmedCompany,
        fullName: trimmedName,
        email: trimmedEmail,
        password,
      });
      navigation.replace('MainTabs');
    } catch (err) {
      setError(extractRegisterError(err));
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
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>Criar conta corporativa</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMPRESA</Text>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Nome da empresa"
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOME COMPLETO</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Seu nome completo"
              editable={!isSubmitting}
            />
          </View>

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
            <Text style={styles.label}>SENHA (MÍN. 8 CARACTERES)</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              autoCapitalize="none"
              autoComplete="password-new"
              editable={!isSubmitting}
            />
          </View>

          {error ? (
            <Text style={{ color: '#c0392b', marginBottom: 12 }}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, isSubmitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace('Login')} disabled={isSubmitting}>
            <Text style={styles.forgotPassword}>Já tenho conta — entrar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

function extractRegisterError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (err.response?.status === 409) return 'E-mail já cadastrado.';
    if (data?.message) return data.message;
    if (err.code === 'ECONNABORTED') return 'Tempo esgotado. Verifique sua conexão.';
    return 'Não foi possível concluir o cadastro.';
  }
  return 'Erro inesperado. Tente novamente.';
}
