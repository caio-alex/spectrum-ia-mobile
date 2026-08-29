// src/screens/result/FieldDetailScreen.tsx
//
// DETALHE DO CAMPO — folha modal aberta ao tocar numa linha da ficha técnica.
//
// Serve a dois propósitos: ler um valor longo por inteiro (na tabela ele é
// truncado) e entender o que a procedência daquele campo significa na prática.
//
// O que NÃO está aqui, de propósito: a citação da fonte, a URL do trecho e o
// botão "marcar como validado". A API não devolve rastreabilidade por campo, e
// o botão só exibia um alerta de sucesso sem gravar nada — uma confirmação
// falsa num produto cujo valor é justamente a confiança no dado.

import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, type ConfidenceKey } from '../../styles/theme';
import {
  Button,
  Callout,
  ConfidenceBadge,
  Divider,
  Icon,
  SpectrumRay,
  Txt,
  categoryIdentity,
} from '../../components/ui';

interface RouteParams {
  vehicleName?: string;
  fieldCategory?: string;
  fieldName?: string;
  fieldValue?: string;
  level?: ConfidenceKey;
}

/** O que cada procedência significa para quem vai usar o dado. */
const EXPLANATION: Record<ConfidenceKey, { title: string; text: string }> = {
  official: {
    title: 'Dado de fonte oficial',
    text: 'Extraído de material publicado pela própria montadora (site oficial, catálogo ou press kit). É o nível mais alto de confiança e pode ser usado em material comercial.',
  },
  review: {
    title: 'Dado de review especializado',
    text: 'Veio de imprensa automotiva ou testes independentes. Costuma ser confiável, mas pode divergir do catálogo oficial em detalhes de versão. Confira antes de publicar.',
  },
  estimated: {
    title: 'Dado inferido pela IA',
    text: 'Não foi encontrado explicitamente nas fontes consultadas — a IA deduziu a partir de versões semelhantes. Trate como referência e valide com um especialista antes de usar.',
  },
};

export const FieldDetailScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const params: RouteParams = route?.params ?? {};

  const level: ConfidenceKey = params.level ?? 'estimated';
  const explanation = EXPLANATION[level];
  const category = params.fieldCategory ?? 'Especificação';
  const categoryStyle = categoryIdentity(category);

  return (
    <View style={styles.root}>
      {/* O véu fecha a folha — gesto esperado num modal desse formato. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Fechar"
      />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + theme.space[5] }]}>
        <SpectrumRay height={4} />

        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
          <View style={styles.content}>
            <View style={styles.breadcrumb}>
              <Icon name={categoryStyle.icon} size={11} color={categoryStyle.color} />
              <Txt variant="micro" tone="muted" numberOfLines={1}>
                {params.vehicleName ? `${params.vehicleName} · ` : ''}
                {category}
              </Txt>
            </View>

            <Txt variant="title3" tone="muted" style={{ marginTop: theme.space[4] }}>
              {params.fieldName ?? 'Campo'}
            </Txt>
            <Txt variant="display" style={{ marginTop: 2 }}>
              {params.fieldValue ?? '—'}
            </Txt>

            <ConfidenceBadge level={level} style={{ marginTop: theme.space[4] }} />

            <Divider style={{ marginVertical: theme.space[5] }} />

            {/* O destaque herda a cor da procedência do campo: o mesmo verde /
                azul / âmbar que o usuário já viu na tabela. */}
            <Callout
              title={explanation.title}
              color={theme.confidence[level].fg}
              icon={level === 'official' ? 'success' : 'info'}
            >
              {explanation.text}
            </Callout>

            <Button
              label="Fechar"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={{ marginTop: theme.space[6] }}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.scrim,
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radii.xxl,
    borderTopRightRadius: theme.radii.xxl,
    overflow: 'hidden',
    maxHeight: '86%',
    ...theme.shadow.lg,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: theme.space[3],
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.ink[200],
  },
  content: {
    paddingHorizontal: theme.space[5],
    paddingTop: theme.space[4],
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
