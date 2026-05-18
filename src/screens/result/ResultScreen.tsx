// src/screens/result/ResultScreen.tsx
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { SpecTable } from '../../components/SpecTable';
import { StatsBar } from '../../components/StatsBar';
import { styles } from '../../styles/resultScreen.styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons/faFilePdf';
import { sourceStyles } from '../../styles/resultScreen.styles';

import { 
  CATEGORY_ICONS, 
  MOCK_BACKEND_RANGER_RESPONSE 
} from '../../mocks/vehicleData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── COMPONENTE HAMBÚRGUER EXPANSÍVEL POR CATEGORIA ──────────────────────
const ExpandableCategorySection: React.FC<{
  title: string;
  data: any[];
}> = ({ title, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const normalizedKey = title.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const icon = CATEGORY_ICONS[normalizedKey] || '📊';

  return (
    <View style={{ marginBottom: 12, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eef0f7' }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          backgroundColor: '#f8f9fd',
        }}
        onPress={toggleSection}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#001881', letterSpacing: 0.3 }}>
              {title.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {data.length} campo{data.length !== 1 ? 's' : ''} encontrado{data.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesomeIcon icon={faBars} size={14} style={{ color: '#001881', marginRight: 12, opacity: 0.4 }} />
          <Animated.Text style={{ fontSize: 16, color: '#001881', transform: [{ rotate }] }}>
            ▾
          </Animated.Text>
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
          <SpecTable category="" data={data} />
        </View>
      )}
    </View>
  );
};

// ── COMPONENTE DE FONTES UTILIZADAS (DINÂMICO) ───────────────────────────
const SourcesSection: React.FC<{ specsData: any }> = ({ specsData }) => {
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  let oficialCount = 0;
  let reviewCount = 0;
  let estimadoCount = 0;

  Object.values(specsData || {}).forEach((category: any) => {
    Object.values(category || {}).forEach((field: any) => {
      if (field.source === 'OFFICIAL') oficialCount++;
      else if (field.source === 'REVIEW') reviewCount++;
      else if (field.source === 'ESTIMATED') estimadoCount++;
    });
  });

  const totalFields = oficialCount + reviewCount + estimadoCount;

  const dynamicSources = [
    {
      id: 'src_ford_1',
      icon: '🏭',
      name: 'Site e Press Kit Oficial Ford',
      url: 'ford.com.br/picapes/ranger',
      type: 'Oficial',
      fieldsFound: oficialCount,
    },
    {
      id: 'src_ford_2',
      icon: '📰',
      name: 'Revistas e Portais Automotivos',
      url: 'quatrorodas.abril.com.br/ranger-v6',
      type: 'Review',
      fieldsFound: reviewCount,
    },
  ].filter(src => src.fieldsFound > 0);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
    Animated.timing(rotateAnim, {
      toValue: open ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={[sourceStyles.section, { marginTop: 8, marginBottom: 12 }]}>
      <TouchableOpacity style={sourceStyles.sectionHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={sourceStyles.sectionLeft}>
          <Text style={sourceStyles.sectionIcon}><FontAwesomeIcon icon={faBars} style={{ color: "#001881" }} /></Text>
          <View>
            <Text style={sourceStyles.sectionTitle}>Fontes utilizadas</Text>
            <Text style={sourceStyles.sectionSub}>
              {dynamicSources.length} origens encontradas · {totalFields} mapeamentos
            </Text>
          </View>
        </View>
        <Animated.Text style={[sourceStyles.chevron, { transform: [{ rotate }] }]}>▾</Animated.Text>
      </TouchableOpacity>

      {open && (
        <View style={sourceStyles.list}>
          {dynamicSources.map((src, i) => (
            <View key={src.id} style={[sourceStyles.item, i !== dynamicSources.length - 1 && sourceStyles.itemBorder, { padding: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, marginRight: 8 }}>{src.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#333' }}>{src.name}</Text>
                  <Text style={{ fontSize: 11, color: '#888' }}>{src.fieldsFound} dados extraídos · {src.url}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// ── TELA PRINCIPAL DE RESULTADOS ─────────────────────────────────────────
export const ResultScreen = ({ navigation, route }: any) => {
  const backendResponse = route?.params?.searchResult ?? MOCK_BACKEND_RANGER_RESPONSE;
  const { vehicle, specs } = backendResponse;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatSourceAndStatus = (backendSource: string) => {
    switch (backendSource) {
      case 'OFFICIAL':
        return { source: 'Oficial', status: 'high' as const };
      case 'REVIEW':
        return { source: 'Review', status: 'medium' as const };
      case 'ESTIMATED':
      default:
        return { source: 'Estimado', status: 'low' as const };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Análise Spectrum IA</Text>
          <TouchableOpacity style={styles.pdfBtn}>
            <Text style={styles.pdfIcon}><FontAwesomeIcon icon={faFilePdf} style={{ color: "#ffffff" }} /></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vehicleInfo}>
          <Text style={styles.brandText}>{vehicle.brand}</Text>
          <Text style={styles.modelText}>{vehicle.model} {vehicle.trim}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{vehicle.year}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatsBar stats={[{ label: 'Acurácia Geral', value: '98%', emoji: '🧠' }]} />
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightEmoji}>⚡</Text>
            <Text style={styles.insightText}>
              Análise concluída para a {vehicle.brand} {vehicle.model}. Utilize as seções hambúrguer expansíveis abaixo para gerenciar os dados auditados.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>CATEGORIAS DISPONÍVEIS</Text>

          {/* RENDERIZAÇÃO DINÂMICA COMPLETA */}
          {Object.keys(specs).map((categoryName) => {
            const currentCategoryFields = specs[categoryName];

            const formattedFields = Object.keys(currentCategoryFields).map((fieldName) => {
              const details = currentCategoryFields[fieldName];
              const { source, status } = formatSourceAndStatus(details.source);

              return {
                label: fieldName,
                value: details.value,
                source: source,
                status: status,
              };
            });

            return (
              <ExpandableCategorySection
                key={categoryName}
                title={categoryName}
                data={formattedFields}
              />
            );
          })}

          {/* ── SEÇÃO DE FONTES UTILIZADAS REINTEGRADA ────────────────── */}
          <SourcesSection specsData={specs} />

          {/* BOTÃO COMPARAR */}
          <TouchableOpacity
            style={[styles.compareFab, { marginTop: 16 }]}
            onPress={() => navigation.navigate('Compare', { vehicleData: vehicle })}
          >
            <Text style={styles.compareFabText}>Comparar Ficha Técnico</Text>
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};