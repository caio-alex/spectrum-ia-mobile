import React, { useMemo, useState } from 'react';
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
import { styles } from '../../styles/login.styles';
import { useAuth } from '../../contexts';
import { extractApiErrorMessage } from '../../services/errorHandler';
import {
  LIMITS,
  evaluatePasswordChecks,
  validateEmail,
  validateNonEmpty,
  validatePasswordStrength,
} from '../../services/validation';

export const RegisterScreen = ({ navigation }: any) => {
  const { signUp } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordContext = useMemo(
    () => ({ email, fullName, companyName }),
    [email, fullName, companyName],
  );

  const checks = useMemo(
    () => evaluatePasswordChecks(password, passwordContext),
    [password, passwordContext],
  );

  const handleSubmit = async () => {
    const trimmedCompany = companyName.trim();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    const companyErr = validateNonEmpty(trimmedCompany, 'a empresa', LIMITS.COMPANY_MAX);
    if (companyErr) return setError(companyErr);

    const nameErr = validateNonEmpty(trimmedName, 'o nome completo', LIMITS.FULLNAME_MAX);
    if (nameErr) return setError(nameErr);

    const emailErr = validateEmail(trimmedEmail);
    if (emailErr) return setError(emailErr);

    const pwErr = validatePasswordStrength(password, {
      email: trimmedEmail,
      fullName: trimmedName,
      companyName: trimmedCompany,
    });
    if (pwErr) return setError(pwErr);

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
      setError(
        extractApiErrorMessage(err, {
          fallback: 'Não foi possível concluir o cadastro.',
          byStatus: {
            409: 'E-mail já cadastrado.',
            429: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
          },
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showChecklist = passwordFocused || (password.length > 0 && !checks.allPassed);

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
              maxLength={LIMITS.COMPANY_MAX}
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
              maxLength={LIMITS.FULLNAME_MAX}
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
              maxLength={LIMITS.EMAIL_MAX}
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
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="••••••••••"
              autoCapitalize="none"
              autoComplete="password-new"
              maxLength={LIMITS.PASSWORD_MAX}
              editable={!isSubmitting}
            />
          </View>

          {showChecklist ? <PasswordChecklist checks={checks} /> : null}

          {error ? (
            <Text style={{ color: '#c0392b', marginBottom: 12, marginTop: 4 }}>{error}</Text>
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

interface PasswordChecklistProps {
  checks: ReturnType<typeof evaluatePasswordChecks>;
}

const PasswordChecklist: React.FC<PasswordChecklistProps> = ({ checks }) => {
  const items: Array<{ key: keyof typeof checks; label: string }> = [
    { key: 'length', label: `Pelo menos ${LIMITS.PASSWORD_MIN} caracteres` },
    { key: 'lower', label: 'Letra minúscula' },
    { key: 'upper', label: 'Letra maiúscula' },
    { key: 'digit', label: 'Número' },
    { key: 'special', label: 'Caractere especial (!@#$ etc.)' },
    { key: 'noRepeat', label: 'Sem 3 caracteres iguais seguidos' },
    { key: 'noTrivial', label: 'Sem sequências (1234, abcd, qwerty)' },
    { key: 'notCommon', label: 'Não é uma senha comum' },
    { key: 'notUserData', label: 'Não contém seu nome ou e-mail' },
  ];
  return (
    <View
      style={{
        marginTop: 4,
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#f5f5f7',
        borderRadius: 8,
      }}
    >
      {items.map((item) => {
        const ok = checks[item.key];
        return (
          <Text
            key={item.key}
            style={{
              fontSize: 12,
              color: ok ? '#1f7a3d' : '#7a7a86',
              marginVertical: 2,
            }}
          >
            {ok ? '✓' : '○'}  {item.label}
          </Text>
        );
      })}
    </View>
  );
};
