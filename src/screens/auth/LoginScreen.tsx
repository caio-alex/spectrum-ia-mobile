// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../contexts';
import { extractApiErrorMessage } from '../../services/errorHandler';
import { LIMITS, validateEmail } from '../../services/validation';
import { theme } from '../../styles/theme';
import { Button, FormError, PressableScale, TextField, Txt } from '../../components/ui';
import { AuthLayout } from './AuthLayout';

export const LoginScreen = ({ navigation }: any) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Erros por campo aparecem embaixo do próprio campo; o erro do servidor
  // (credencial inválida, rate limit) fica no bloco geral acima do botão.
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    const emailError = validateEmail(email);
    const passwordError = !password
      ? 'Informe a senha.'
      : password.length > LIMITS.PASSWORD_MAX
        ? 'Senha muito longa.'
        : undefined;

    if (emailError || passwordError) {
      setFieldErrors({ email: emailError ?? undefined, password: passwordError });
      setError(null);
      return;
    }

    setFieldErrors({});
    setError(null);
    setIsSubmitting(true);
    try {
      // Sem navegação manual: RootNavigation troca a pilha de auth pela pilha
      // do app assim que `signed` vira true (renderização condicional).
      await signIn({ email: email.trim(), password });
    } catch (err) {
      setError(
        extractApiErrorMessage(err, {
          fallback: 'Não foi possível entrar. Tente novamente.',
          byStatus: {
            401: 'E-mail ou senha inválidos.',
            429: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
          },
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Entrar na plataforma">
      <TextField
        label="E-mail corporativo"
        icon="email"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
        }}
        error={fieldErrors.email}
        placeholder="exemplo@empresa.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        maxLength={LIMITS.EMAIL_MAX}
        editable={!isSubmitting}
        returnKeyType="next"
      />

      <TextField
        label="Senha"
        icon="lock"
        revealable
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
        }}
        error={fieldErrors.password}
        placeholder="••••••••"
        autoCapitalize="none"
        autoComplete="password"
        maxLength={LIMITS.PASSWORD_MAX}
        editable={!isSubmitting}
        returnKeyType="go"
        onSubmitEditing={() => void handleLogin()}
      />

      <FormError message={error} />

      <Button
        label="Entrar"
        size="lg"
        onPress={() => void handleLogin()}
        loading={isSubmitting}
        icon="forward"
        iconPosition="trailing"
      />

      <View style={{ height: theme.space[5] }} />

      <PressableScale
        onPress={() => navigation.navigate('Register')}
        disabled={isSubmitting}
        scaleTo={0.97}
        style={{ alignItems: 'center', paddingVertical: theme.space[2] }}
      >
        <Txt variant="caption" tone="muted">
          Ainda não tem acesso?{' '}
          <Txt variant="captionStrong" tone="accent">
            Criar conta corporativa
          </Txt>
        </Txt>
      </PressableScale>
    </AuthLayout>
  );
};
