// src/screens/auth/RegisterScreen.tsx
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '../../contexts';
import { extractApiErrorMessage } from '../../services/errorHandler';
import {
  LIMITS,
  evaluatePasswordChecks,
  validateEmail,
  validateNonEmpty,
  validatePasswordStrength,
  type PasswordChecks,
} from '../../services/validation';
import { theme } from '../../styles/theme';
import {
  Button,
  FormError,
  Icon,
  PressableScale,
  ProgressBar,
  TextField,
  Txt,
} from '../../components/ui';
import { AuthLayout } from './AuthLayout';

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
      // Sem navegação manual: RootNavigation troca a pilha de auth pela pilha
      // do app assim que `signed` vira true (renderização condicional).
      await signUp({
        companyName: trimmedCompany,
        fullName: trimmedName,
        email: trimmedEmail,
        password,
      });
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
    <AuthLayout title="Criar conta corporativa" compact>
      <TextField
        label="Empresa"
        icon="company"
        value={companyName}
        onChangeText={setCompanyName}
        placeholder="Nome da empresa"
        maxLength={LIMITS.COMPANY_MAX}
        editable={!isSubmitting}
      />

      <TextField
        label="Nome completo"
        icon="profile"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Seu nome completo"
        maxLength={LIMITS.FULLNAME_MAX}
        editable={!isSubmitting}
      />

      <TextField
        label="E-mail corporativo"
        icon="email"
        value={email}
        onChangeText={setEmail}
        placeholder="exemplo@empresa.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        maxLength={LIMITS.EMAIL_MAX}
        editable={!isSubmitting}
      />

      <TextField
        label="Senha"
        icon="lock"
        revealable
        value={password}
        onChangeText={setPassword}
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
        placeholder="••••••••••"
        autoCapitalize="none"
        autoComplete="password-new"
        maxLength={LIMITS.PASSWORD_MAX}
        editable={!isSubmitting}
        containerStyle={{ marginBottom: showChecklist ? theme.space[2] : theme.space[4] }}
      />

      {showChecklist ? <PasswordStrength checks={checks} /> : null}

      <FormError message={error} />

      <Button
        label="Criar conta"
        size="lg"
        onPress={() => void handleSubmit()}
        loading={isSubmitting}
        icon="forward"
        iconPosition="trailing"
      />

      <View style={{ height: theme.space[5] }} />

      <PressableScale
        onPress={() => navigation.replace('Login')}
        disabled={isSubmitting}
        scaleTo={0.97}
        style={{ alignItems: 'center', paddingVertical: theme.space[2] }}
      >
        <Txt variant="caption" tone="muted">
          Já tem conta?{' '}
          <Txt variant="captionStrong" tone="accent">
            Entrar
          </Txt>
        </Txt>
      </PressableScale>
    </AuthLayout>
  );
};

/* ── Medidor de força ────────────────────────────────────────────────────── */

type CheckKey = Exclude<keyof PasswordChecks, 'allPassed'>;

const CHECK_ITEMS: Array<{ key: CheckKey; label: string }> = [
  { key: 'length', label: `${LIMITS.PASSWORD_MIN}+ caracteres` },
  { key: 'lower', label: 'Minúscula' },
  { key: 'upper', label: 'Maiúscula' },
  { key: 'digit', label: 'Número' },
  { key: 'special', label: 'Símbolo' },
  { key: 'noRepeat', label: 'Sem repetições' },
  { key: 'noTrivial', label: 'Sem sequências' },
  { key: 'notCommon', label: 'Não é senha comum' },
  { key: 'notUserData', label: 'Sem seus dados' },
];

/**
 * Barra de força + os requisitos ainda pendentes.
 *
 * A lista anterior mostrava as nove regras o tempo todo, sempre. Aqui a barra
 * responde ao que já foi conquistado e a lista some conforme cada item é
 * atendido — o usuário vê o caminho encurtar em vez de encarar um paredão.
 */
const PasswordStrength: React.FC<{ checks: PasswordChecks }> = ({ checks }) => {
  const passed = CHECK_ITEMS.filter((item) => checks[item.key]).length;
  const ratio = passed / CHECK_ITEMS.length;
  const pending = CHECK_ITEMS.filter((item) => !checks[item.key]);

  const verdict =
    ratio >= 1 ? 'Senha forte' : ratio >= 0.7 ? 'Quase lá' : ratio >= 0.4 ? 'Fraca' : 'Muito fraca';

  return (
    <View style={styles.strength}>
      <View style={styles.strengthHead}>
        <Txt variant="micro" style={{ fontFamily: theme.fonts.semibold }}>
          {verdict}
        </Txt>
        <Txt variant="micro" tone="faint">
          {passed}/{CHECK_ITEMS.length}
        </Txt>
      </View>
      <ProgressBar progress={ratio} height={5} trackColor={theme.ink[100]} />

      {pending.length > 0 ? (
        <View style={styles.pendingWrap}>
          {pending.map((item) => (
            <View key={item.key} style={styles.pendingChip}>
              <Icon name="close" size={8} color={theme.ink[400]} />
              <Txt variant="micro" tone="faint" style={{ fontSize: 10 }}>
                {item.label}
              </Txt>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.pendingWrap, { marginTop: theme.space[2] }]}>
          <View style={[styles.pendingChip, styles.pendingChipOk]}>
            <Icon name="check" size={8} color={theme.colors.success} />
            <Txt variant="micro" tone="success" style={{ fontSize: 10 }}>
              Todos os requisitos atendidos
            </Txt>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  strength: {
    backgroundColor: theme.ink[50],
    borderRadius: theme.radii.sm,
    padding: theme.space[3],
    marginBottom: theme.space[4],
    gap: theme.space[2],
  },
  strengthHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 2,
  },
  pendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.ink[100],
    borderRadius: theme.radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingChipOk: {
    backgroundColor: theme.colors.successBg,
    borderColor: '#B9E8D8',
  },
});
