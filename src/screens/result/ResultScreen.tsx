import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { theme } from '../../styles/theme';
import { SpecTable } from '../../components/SpecTable';
import { StatsBar } from '../../components/StatsBar';
import { styles } from '../../styles/resultScreen.styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons/faFilePdf';
import { sourceStyles } from '../../styles/resultScreen.styles';

// Habilita LayoutAnimation no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Dados mockados das fontes utilizadas ─────────────────────────────────
const MOCK_SOURCES = [
  {
    id: 'src_1',
    icon: '🏭',
    name: 'Site Oficial Toyota Brasil',
    url: 'toyota.com.br/corolla-cross',
    type: 'Oficial' as const,
    fieldsFound: 12,
    excerpt:
      'Especificações técnicas completas do Corolla Cross XRE 2024, incluindo motorização, dimensões e equipamentos de série.',
  },
  {
    id: 'src_2',
    icon: '📰',
    name: 'Quatro Rodas — Test Drive',
    url: 'quatrorodas.abril.com.br/test-drive/corolla-cross-2024',
    type: 'Review' as const,
    fieldsFound: 8,
    excerpt:
      '"...no nosso teste cronometrado, o Corolla Cross fez o 0 a 100 em aproximadamente 8,5 segundos com o câmbio CVT bem calibrado..."',
  },
  {
    id: 'src_3',
    icon: '▶️',
    name: 'YouTube — iCarros',
    url: 'youtube.com/watch?v=xK92mZ • 4m32s',
    type: 'Review' as const,
    fieldsFound: 6,
    excerpt:
      '"...o porta-malas do Corolla Cross surpreende com 487 litros de capacidade, um dos maiores da categoria..."',
  },
  {
    id: 'src_4',
    icon: '📄',
    name: 'Press Kit — Toyota Motor',
    url: 'pressroom.toyota.com.br/2024/corolla-cross',
    type: 'Estimado' as const,
    fieldsFound: 4,
    excerpt:
      'Documentação técnica oficial para imprensa com dados preliminares do modelo 2024.',
  },
];

type SourceType = 'Oficial' | 'Review' | 'Estimado';

const SOURCE_BADGE_CONFIG: Record<SourceType, { bg: string; color: string }> = {
  Oficial:  { bg: theme.colors.successBg,  color: theme.colors.success  },
  Review:   { bg: theme.colors.warningBg,  color: theme.colors.warning  },
  Estimado: { bg: '#edf0fb',               color: theme.colors.primary  },
};

// ── Componente de fonte expansível ───────────────────────────────────────
const SourceItem: React.FC<{
  source: typeof MOCK_SOURCES[0];
  isLast: boolean;
}> = ({ source, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const badge = SOURCE_BADGE_CONFIG[source.type];
  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={[sourceStyles.item, !isLast && sourceStyles.itemBorder]}>
      {/* Cabeçalho sempre visível */}
      <TouchableOpacity
        style={sourceStyles.header}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={sourceStyles.iconBox}>
          <Text style={sourceStyles.icon}>{source.icon}</Text>
        </View>

        <View style={sourceStyles.headerContent}>
          <View style={sourceStyles.headerRow}>
            <Text style={sourceStyles.name} numberOfLines={1}>
              {source.name}
            </Text>
            <View style={[sourceStyles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[sourceStyles.badgeText, { color: badge.color }]}>
                {source.type}
              </Text>
            </View>
          </View>
          <Text style={sourceStyles.fields}>
            {source.fieldsFound} campo{source.fieldsFound !== 1 ? 's' : ''} extraído{source.fieldsFound !== 1 ? 's' : ''}
          </Text>
        </View>

        <Animated.Text style={[sourceStyles.chevron, { transform: [{ rotate }] }]}>
          ▾
        </Animated.Text>
      </TouchableOpacity>

      {/* Conteúdo expandido */}
      {expanded && (
        <View style={sourceStyles.expanded}>
          <Text style={sourceStyles.urlText} numberOfLines={1}>
            <FontAwesomeIcon icon={faLink} style={{color: "#001881",}} /> {source.url}
          </Text>
          <View style={sourceStyles.quoteBox}>
            <Text style={sourceStyles.quoteText}>{source.excerpt}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ── Seção de fontes colapsável ────────────────────────────────────────────
const SourcesSection: React.FC = () => {
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const totalFields = MOCK_SOURCES.reduce((s, src) => s + src.fieldsFound, 0);

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
    <View style={sourceStyles.section}>
      {/* Cabeçalho da seção */}
      <TouchableOpacity style={sourceStyles.sectionHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={sourceStyles.sectionLeft}>
          <Text style={sourceStyles.sectionIcon}><FontAwesomeIcon icon={faBars} style={{color: "#001881",}} /></Text>
          <View>
            <Text style={sourceStyles.sectionTitle}>Fontes utilizadas</Text>
            <Text style={sourceStyles.sectionSub}>
              {MOCK_SOURCES.length} fontes · {totalFields} campos extraídos
            </Text>
          </View>
        </View>
        <Animated.Text style={[sourceStyles.chevron, { transform: [{ rotate }] }]}>
          ▾
        </Animated.Text>
      </TouchableOpacity>

      {/* Lista de fontes */}
      {open && (
        <View style={sourceStyles.list}>
          {MOCK_SOURCES.map((src, i) => (
            <SourceItem
              key={src.id}
              source={src}
              isLast={i === MOCK_SOURCES.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// ── Tela principal ────────────────────────────────────────────────────────
export const ResultScreen = ({ navigation, route }: any) => {
  const params = route?.params ?? {
    brand: 'Toyota',
    model: 'Corolla Cross',
    version: 'XRE 2.0 Híbrido',
    year: '2024',
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER CORPORATIVO */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resultado da Análise</Text>
          <TouchableOpacity style={styles.pdfBtn}>
            <Text style={styles.pdfIcon}><FontAwesomeIcon icon={faFilePdf} style={{color: "#ffffff",}} /></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vehicleInfo}>
          <Text style={styles.brandText}>{params.brand}</Text>
          <Text style={styles.modelText}>
            {params.model} {params.version}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{params.year}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatsBar
            stats={[
              { label: 'Acurácia', value: '92%', emoji: '✅' },
            ]}
          />
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollPadding}
        >
          {/* Card de insight da IA */}
          <View style={styles.insightCard}>
            <Text style={styles.insightEmoji}>🧠</Text>
            <Text style={styles.insightText}>
              A IA identificou que este modelo possui 15% mais eficiência
              energética que a média da categoria SUV Médio.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>ESPECIFICAÇÕES TÉCNICAS</Text>

          {/* Tabelas de specs */}
          <SpecTable
            category="Motorização"
            data={[
              {
                label: 'Potência Max',
                value: '177 cv (E) / 169 cv (G)',
                source: 'Oficial',
                status: 'high',
              },
              {
                label: 'Torque Max',
                value: '21,4 kgfm',
                source: 'Oficial',
                status: 'high',
              },
              {
                label: 'Câmbio',
                value: 'CVT com 10 marchas',
                source: 'Review',
                status: 'medium',
              },
            ]}
          />

          <SpecTable
            category="Segurança & ADAS"
            data={[
              {
                label: 'Airbags',
                value: '7 (Frontais, laterais e cortina)',
                source: 'Oficial',
                status: 'high',
              },
              {
                label: 'Frenagem Autônoma',
                value: 'Sim (Toyota Safety Sense)',
                source: 'Oficial',
                status: 'high',
              },
              {
                label: 'Alerta de Faixa',
                value: 'Sim, com correção',
                source: 'Estimado',
                status: 'low',
              },
            ]}
          />

          {/* ── SEÇÃO DE FONTES EXPANSÍVEL ──────────────────────────── */}
          <SourcesSection />

          {/* Botão comparar */}
          <TouchableOpacity
            style={styles.compareFab}
            onPress={() =>
              navigation.navigate('Compare', {
                vehicleIds: ['corolla_cross_xre_2024'],
              })
            }
          >
            <Text style={styles.compareFabText}>Comparar este veículo</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

// ── Styles das fontes ─────────────────────────────────────────────────────
