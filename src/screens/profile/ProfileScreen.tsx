// src/screens/profile/ProfileScreen.tsx
//
// TELA — PERFIL
//
// Existe porque a aba "Perfil" da bottom nav abria um Alert de logout: um item
// de navegação que dispara uma ação destrutiva, vizinho da aba mais usada. Aqui
// o usuário vê quem está logado, em que empresa, com que papel — e o "Sair"
// vira uma escolha consciente, no fim da página e com confirmação.

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import * as Application from 'expo-application';
import { useAuth } from '../../contexts';
import { theme } from '../../styles/theme';
import {
  Badge,
  BottomInset,
  Button,
  Card,
  ConfirmSheet,
  Divider,
  Icon,
  PressableScale,
  Screen,
  ScreenHeader,
  SectionHeader,
  SpectrumRay,
  Txt,
  type IconName,
} from '../../components/ui';
import { BottomNav, useBottomNavHandler } from '../../components/BottomNav';
import type { Role } from '../../types/api';

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  ANALYST: 'Analista',
  VIEWER: 'Leitura',
};

const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
};

export const ProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const handleNavPress = useBottomNavHandler(navigation);

  // A confirmação é um sheet do próprio app, e não `Alert.alert`: no React
  // Native Web o Alert é um no-op, então este botão simplesmente não fazia nada
  // na versão web — abria diálogo nenhum e não deslogava.
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      // Se o signOut der certo, esta tela já saiu da árvore (RootNavigation
      // troca a pilha) — mas em caso de falha o sheet precisa voltar ao normal.
      setSigningOut(false);
      setConfirmSignOut(false);
    }
  }, [signOut]);

  const name = user?.name ?? 'Usuário';
  const version = Application.nativeApplicationVersion ?? '1.0.0';

  return (
    <Screen>
      <ScreenHeader eyebrow="Sua conta" title="Perfil" />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Cartão de identidade — o avatar carrega o degradê da marca. */}
        <Card variant="elevated" padding={0} style={styles.identity}>
          <SpectrumRay height={4} />
          <View style={styles.identityInner}>
            <View style={styles.avatar}>
              <Txt variant="title2" tone="inverse">
                {initialsFromName(name)}
              </Txt>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt variant="title2" numberOfLines={1}>
                {name}
              </Txt>
              <Txt variant="caption" tone="muted" numberOfLines={1}>
                {user?.email ?? '—'}
              </Txt>
              {user?.role ? (
                <Badge
                  label={ROLE_LABEL[user.role] ?? user.role}
                  tone="brand"
                  icon="role"
                  size="sm"
                  style={{ marginTop: 2 }}
                />
              ) : null}
            </View>
          </View>
        </Card>

        <SectionHeader title="Atalhos" />
        <Card padding={0}>
          <MenuRow
            icon="sessions"
            label="Minhas sessões"
            hint="Histórico de análises competitivas"
            onPress={() => navigation?.navigate('Sessions')}
          />
          <Divider style={{ marginLeft: 62 }} />
          <MenuRow
            icon="search"
            label="Nova pesquisa"
            hint="Buscar a ficha técnica de um veículo"
            onPress={() => navigation?.navigate('Search')}
          />
          <Divider style={{ marginLeft: 62 }} />
          <MenuRow
            icon="compare"
            label="Comparar veículos"
            hint="Ficha técnica lado a lado"
            onPress={() => navigation?.navigate('Compare')}
          />
        </Card>

        <SectionHeader title="Sobre" style={{ marginTop: theme.space[6] }} />
        <Card>
          <View style={styles.aboutRow}>
            <Txt variant="caption" tone="muted">
              Versão do app
            </Txt>
            <Txt variant="captionStrong">{version}</Txt>
          </View>
          <Divider style={{ marginVertical: theme.space[3] }} />
          <View style={styles.aboutRow}>
            <Txt variant="caption" tone="muted">
              Organização
            </Txt>
            <Txt variant="captionStrong" numberOfLines={1} style={{ maxWidth: '60%' }}>
              {user?.tenantId ? `#${user.tenantId.slice(0, 8)}` : '—'}
            </Txt>
          </View>
        </Card>

        <Button
          label="Sair da conta"
          icon="logout"
          variant="danger"
          onPress={() => setConfirmSignOut(true)}
          style={{ marginTop: theme.space[6] }}
        />

        <Txt variant="micro" tone="faint" center style={{ marginTop: theme.space[5] }}>
          Spectrum AI · análise competitiva automotiva
        </Txt>

        <BottomInset extra={theme.space[4]} />
      </ScrollView>

      <BottomNav active="profile" onPress={handleNavPress} />

      <ConfirmSheet
        visible={confirmSignOut}
        icon="logout"
        title="Sair da conta?"
        description="Você precisará entrar de novo para continuar pesquisando. As sessões e pesquisas já salvas continuam no servidor."
        confirmLabel="Sair da conta"
        cancelLabel="Continuar conectado"
        loading={signingOut}
        onConfirm={() => void handleSignOut()}
        onCancel={() => setConfirmSignOut(false)}
      />
    </Screen>
  );
};

const MenuRow: React.FC<{
  icon: IconName;
  label: string;
  hint: string;
  onPress: () => void;
}> = ({ icon, label, hint, onPress }) => (
  <PressableScale onPress={onPress} scaleTo={0.99} style={styles.menuRow} accessibilityRole="button">
    <View style={styles.menuIcon}>
      <Icon name={icon} size={15} color={theme.brand[600]} />
    </View>
    <View style={{ flex: 1, gap: 1 }}>
      <Txt variant="bodyStrong">{label}</Txt>
      <Txt variant="micro" tone="faint">
        {hint}
      </Txt>
    </View>
    <Icon name="chevronRight" size={11} color={theme.ink[300]} />
  </PressableScale>
);

const styles = StyleSheet.create({
  body: {
    padding: theme.space[4],
    paddingTop: theme.space[5],
  },
  identity: {
    overflow: 'hidden',
    marginBottom: theme.space[6],
  },
  identityInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[4],
    padding: theme.space[4],
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: theme.radii.full,
    backgroundColor: theme.brand[800],
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.brand,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
