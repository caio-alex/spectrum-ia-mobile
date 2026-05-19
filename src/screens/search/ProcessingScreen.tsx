// src/screens/search/ProcessingScreen.tsx
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Animated, TouchableOpacity, ScrollView, Easing } from 'react-native';
import { theme } from '../../styles/theme';
import { SearchSource, SEARCH_SOURCES } from '../../mocks/vehicleData';
import { styles } from '../../styles/processingScreen.styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';

type SourceStatus = 'pending' | 'running' | 'done' | 'warning';
interface SourceState extends SearchSource { status: SourceStatus; fieldsFound: number; message: string; }

// Tipos atualizados para receber os identificadores únicos do back-end
interface RouteParams {
  brand: string;
  model: string;
  version: string;
  year?: string;
  versionId?: string; // <-- ID do carro
  categories: string[];
  categoryKeys?: string[]; // <-- Chaves das categorias
}

interface Props { navigation?: any; route?: { params?: RouteParams }; }

const PROGRESSION_TIMELINE = [
  { delay: 800,  sourceIndex: 0, status: 'running' as SourceStatus, fields: 0,  msg: 'Acessando site oficial...' },
  { delay: 2200, sourceIndex: 0, status: 'done'    as SourceStatus, fields: 12, msg: '12 especificações encontradas' },
  { delay: 2600, sourceIndex: 1, status: 'running' as SourceStatus, fields: 0,  msg: 'Buscando reviews...' },
  { delay: 4000, sourceIndex: 1, status: 'done'    as SourceStatus, fields: 8,  msg: '8 campos adicionais' },
  { delay: 4400, sourceIndex: 2, status: 'running' as SourceStatus, fields: 0,  msg: 'Analisando transcrições...' },
  { delay: 6200, sourceIndex: 2, status: 'done'    as SourceStatus, fields: 6,  msg: '6 dados de vídeos' },
  { delay: 6600, sourceIndex: 3, status: 'running' as SourceStatus, fields: 0,  msg: 'Processando documentos...' },
  { delay: 8000, sourceIndex: 3, status: 'done'    as SourceStatus, fields: 4,  msg: '4 especificações extras' },
];

const TOTAL_DURATION = 8500;

export const ProcessingScreen: React.FC<Props> = ({ navigation, route }) => {
  const params = route?.params ?? {
    brand: 'Ford', model: 'Ranger', version: 'Limited 3.0 V6', year: '2026', versionId: 'ranger_limited',
    categories: ['Motor e Transmissão', 'Segurança'], categoryKeys: ['Motor e Transmissão', 'Segurança'],
  };

  const vehicleLabel = `${params.brand} ${params.model} ${params.version}`;
  
  const [sources, setSources] = useState<SourceState[]>(SEARCH_SOURCES.map((src) => ({ ...src, status: 'pending', fieldsFound: 0, message: 'Aguardando...' })));
  const [isDone, setIsDone] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const pulseAnims = useRef(SEARCH_SOURCES.map(() => new Animated.Value(0.4))).current;
  const doneScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { Animated.spring(fadeInAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start(); }, []);
  useEffect(() => { Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 2800, easing: Easing.linear, useNativeDriver: true })).start(); }, [spinAnim]);
  useEffect(() => { Animated.timing(progressAnim, { toValue: 1, duration: TOTAL_DURATION, easing: Easing.out(Easing.quad), useNativeDriver: false }).start(); }, []);

  const startPulse = useCallback((index: number) => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnims[index], { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulseAnims[index], { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, [pulseAnims]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    PROGRESSION_TIMELINE.forEach(({ delay, sourceIndex, status, fields, msg }) => {
      timers.push(setTimeout(() => {
        if (status === 'running') startPulse(sourceIndex);
        setSources((prev) => prev.map((src, i) => i === sourceIndex ? { ...src, status, fieldsFound: fields || src.fieldsFound, message: msg } : src));
      }, delay));
    });

    timers.push(setTimeout(() => {
      setIsDone(true);
      Animated.spring(doneScaleAnim, { toValue: 1, tension: 65, friction: 9, useNativeDriver: true }).start();

      setTimeout(() => {
        // ESSENCIAL: Repassando o params inteiro (que agora possui versionId e categoryKeys)
        navigation?.replace?.('Result', { ...params });
      }, 1400);
    }, TOTAL_DURATION));

    return () => timers.forEach(clearTimeout);
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const doneFields = sources.reduce((s, src) => s + src.fieldsFound, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isDone ? 'Concluído ✓' : 'Pesquisando...'}</Text>
        <Text style={styles.headerSub}>{vehicleLabel}</Text>
      </View>
      <Animated.View style={[styles.body, { opacity: fadeInAnim }]}>
        <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={styles.spinnerSection}>
            {isDone ? (
              <Animated.View style={[styles.spinnerDone, { transform: [{ scale: doneScaleAnim }] }]}>
                <Text style={styles.spinnerDoneEmoji}>✓</Text>
              </Animated.View>
            ) : (
              <View style={styles.spinnerContainer}>
                <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]}><View style={styles.spinnerRingDot} /></Animated.View>
                <View style={styles.spinnerInner}><Text style={styles.spinnerInnerEmoji}><FontAwesomeIcon icon={faMagnifyingGlass} style={{color: "#001881"}} /></Text></View>
              </View>
            )}
            <Text style={styles.spinnerTitle}>{isDone ? 'Pesquisa concluída!' : 'IA em ação'}</Text>
            <Text style={styles.spinnerSubtitle}>{isDone ? `${doneFields} campos encontrados em ${sources.filter((s) => s.status === 'done').length} fontes` : 'Consultando múltiplas fontes'}</Text>
            <View style={styles.progressBar}><Animated.View style={[styles.progressFill, { width: progressWidth }]} /></View>
            
            <View style={styles.categoriesRow}>
              {params.categories.map((cat) => (
                <View key={cat} style={styles.categoryPill}><Text style={styles.categoryPillText}>{cat}</Text></View>
              ))}
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.sourcesTitle}>Fontes consultadas</Text>
          <View style={styles.sourcesList}>
            {sources.map((src, i) => (
              <SourceItem key={src.id} source={src} pulseAnim={pulseAnims[i]} />
            ))}
          </View>
          {!isDone && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancelar pesquisa</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

interface SourceItemProps { source: SourceState; pulseAnim: Animated.Value; }
const SourceItem: React.FC<SourceItemProps> = ({ source, pulseAnim }) => {
  const isRunning = source.status === 'running';
  const isDone = source.status === 'done';
  const isPending = source.status === 'pending';

  return (
    <View style={[sourceStyles.item, isRunning && sourceStyles.itemRunning, isPending && sourceStyles.itemPending]}>
      <View style={[sourceStyles.iconBox, isDone && sourceStyles.iconBoxDone, isRunning && sourceStyles.iconBoxRunning]}>
        <Text style={sourceStyles.icon}>{source.icon}</Text>
      </View>
      <View style={sourceStyles.content}>
        <Text style={[sourceStyles.name, isRunning && sourceStyles.nameRunning, isPending && sourceStyles.namePending]} numberOfLines={1}>{source.name}</Text>
        <Text style={[sourceStyles.message, isRunning && sourceStyles.messageRunning, isPending && sourceStyles.messagePending]} numberOfLines={1}>{source.message}</Text>
      </View>
      <View>
        {isDone ? (
          <View style={sourceStyles.badgeDone}><Text style={sourceStyles.badgeDoneText}>✓ OK</Text></View>
        ) : isRunning ? (
          <View style={sourceStyles.badgeRunning}>
            <Animated.View style={[sourceStyles.pulseDot, { opacity: pulseAnim }]} />
            <Text style={sourceStyles.badgeRunningText}>{source.fieldsFound || '...'}</Text>
          </View>
        ) : (
          <View style={sourceStyles.badgePending}><Text style={sourceStyles.badgePendingText}>—</Text></View>
        )}
      </View>
    </View>
  );
};

const sourceStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: 'transparent' },
  itemRunning: { backgroundColor: 'rgba(131,192,255,0.1)', borderColor: theme.colors.secondary },
  itemPending: { opacity: 0.45 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, flexShrink: 0 },
  iconBoxDone: { backgroundColor: theme.colors.successBg, borderColor: theme.colors.success },
  iconBoxRunning: { backgroundColor: 'rgba(131,192,255,0.15)', borderColor: theme.colors.secondary },
  icon: { fontSize: 16 }, content: { flex: 1, minWidth: 0 },
  name: { fontSize: 12, fontWeight: '700', color: theme.colors.text, marginBottom: 1 },
  nameRunning: { color: theme.colors.primary }, namePending: { color: theme.colors.textMuted },
  message: { fontSize: 10, color: theme.colors.textLight },
  messageRunning: { color: theme.colors.primary, opacity: 0.8 }, messagePending: { color: theme.colors.textMuted },
  badgeDone: { backgroundColor: theme.colors.successBg, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  badgeDoneText: { fontSize: 9, fontWeight: '700', color: theme.colors.success },
  badgeRunning: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(131,192,255,0.2)', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3, gap: 4 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary },
  badgeRunningText: { fontSize: 9, fontWeight: '700', color: theme.colors.primary },
  badgePending: { backgroundColor: theme.colors.surface, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: theme.colors.border },
  badgePendingText: { fontSize: 9, fontWeight: '700', color: theme.colors.textMuted },
});