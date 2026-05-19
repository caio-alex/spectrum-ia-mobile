// src/screens/result/ResultScreen.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Animated, StatusBar, Platform, UIManager, LayoutAnimation } from 'react-native';
import { SpecTable } from '../../components/SpecTable';
import { StatsBar } from '../../components/StatsBar';
import { styles } from '../../styles/resultScreen.styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons/faFilePdf';
import { sourceStyles } from '../../styles/resultScreen.styles';

import { CATEGORY_ICONS, MOCK_VEHICLE_RESPONSES, MOCK_RESULT_SOURCES } from '../../mocks/vehicleData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── COMPONENTE HAMBÚRGUER (ESTILO EXATO DAS FONTES) ─────────────────────────
const ExpandableCategorySection: React.FC<{ title: string; data: any[]; isLast: boolean }> = ({ title, data, isLast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
    Animated.timing(rotateAnim, { toValue: isOpen ? 0 : 1, duration: 220, useNativeDriver: true }).start();
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const normalizedKey = title.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const icon = CATEGORY_ICONS[normalizedKey] || '📊';

  return (
    <View style={[!isLast && sourceStyles.itemBorder]}>
      <TouchableOpacity
        style={[sourceStyles.item, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
        onPress={toggleSection} activeOpacity={0.8}
      >
        <View style={sourceStyles.header}>
          <View style={sourceStyles.iconBox}>
            <Text style={sourceStyles.icon}>{icon}</Text>
          </View>
          <View style={sourceStyles.headerContent}>
            <Text style={sourceStyles.name}>{title.toUpperCase()}</Text>
            <Text style={sourceStyles.fields}>{data?.length || 0} campo(s) extraído(s)</Text>
          </View>
        </View>
        <Animated.Text style={[sourceStyles.chevron, { transform: [{ rotate }] }]}>▾</Animated.Text>
      </TouchableOpacity>

      
  {isOpen && (
    // Esse padding serve apenas para as letras não encostarem na borda, sem criar caixas novas!
    <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
      <SpecTable category="" data={data || []} />
    </View>
  )}
    </View>
  );
};

// ── COMPONENTE DE FONTES UTILIZADAS ─────────────────────────────────────────
// ── COMPONENTE DE FONTES UTILIZADAS ──────────────────────────────────────────
const SourcesSection: React.FC<{ specsData: any }> = ({ specsData }) => {
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Dicionário dinâmico para facilitar a contagem e cruzar com o Mock
  const sourceCounts: Record<string, number> = {
    OFFICIAL: 0,
    REVIEW: 0,
    ESTIMATED: 0,
  };

  Object.values(specsData || {}).forEach((category: any) => {
    Object.values(category || {}).forEach((field: any) => {
      if (field.source === 'OFFICIAL') sourceCounts.OFFICIAL++;
      else if (field.source === 'REVIEW') sourceCounts.REVIEW++;
      else if (field.source === 'ESTIMATED') sourceCounts.ESTIMATED++;
    });
  });

  const totalFields = sourceCounts.OFFICIAL + sourceCounts.REVIEW + sourceCounts.ESTIMATED;

  // Mapeia as fontes baseadas no Mock do "Back-end" e injeta as contagens encontradas
  const dynamicSources = MOCK_RESULT_SOURCES.map((src) => ({
    ...src,
    fieldsFound: sourceCounts[src.sourceTypeKey] || 0,
  })).filter(src => src.fieldsFound > 0);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
    Animated.timing(rotateAnim, { toValue: open ? 0 : 1, duration: 220, useNativeDriver: true }).start();
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={[sourceStyles.section, { marginTop: 15, marginBottom: 12 }]}>
      <TouchableOpacity style={sourceStyles.sectionHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={sourceStyles.sectionLeft}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>📂</Text>
          <View>
            <Text style={sourceStyles.sectionTitle}>Fontes utilizadas</Text>
            <Text style={sourceStyles.sectionSub}>{dynamicSources.length} origens encontradas · {totalFields} campos</Text>
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
// ── TELA PRINCIPAL DE RESULTADOS ─────────────────────────────────────────────
export const ResultScreen = ({ navigation, route }: any) => {
  const versionId = route?.params?.versionId || 'ranger_limited'; 
  const categoryKeys = route?.params?.categoryKeys || []; 

  const backendResponse = route?.params?.searchResult || MOCK_VEHICLE_RESPONSES[versionId] || MOCK_VEHICLE_RESPONSES['ranger_limited'];
  
  const vehicle = backendResponse?.vehicle || {};
  const specs = backendResponse?.specs || {}; 
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const formatSourceAndStatus = (backendSource: string) => {
    switch (backendSource) {
      case 'OFFICIAL': return { source: 'Oficial', status: 'high' as const };
      case 'REVIEW': return { source: 'Review', status: 'medium' as const };
      default: return { source: 'Estimado', status: 'low' as const };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Análise Spectrum IA</Text>
          <TouchableOpacity style={styles.pdfBtn}><Text style={styles.pdfIcon}><FontAwesomeIcon icon={faFilePdf} style={{ color: "#ffffff" }} /></Text></TouchableOpacity>
        </View>

        <View style={styles.vehicleInfo}>
          <Text style={styles.brandText}>{vehicle?.brand}</Text>
          <Text style={styles.modelText}>{vehicle?.model} {vehicle?.trim}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.yearBadge}><Text style={styles.yearText}>{vehicle?.year}</Text></View>
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
              Análise concluída para {vehicle?.brand} {vehicle?.model}. Exibindo as categorias selecionadas.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>CATEGORIAS SELECIONADAS</Text>

          {/* O FILTRO SEGURO: Mapeia as chaves dentro de um "section" idêntico ao menu de fontes */}
          <View style={sourceStyles.section}>
            {Object.keys(specs)
              .filter((categoryName) => {
                if (categoryKeys && categoryKeys.length > 0) {
                  return categoryKeys.includes(categoryName);
                }
                return true; 
              })
              .map((categoryName, index, filteredArray) => {
                const currentCategoryFields = specs[categoryName] || {};
                
                const formattedFields = Object.keys(currentCategoryFields).map((fieldName) => {
                  const details = currentCategoryFields[fieldName] || {};
                  const { source, status } = formatSourceAndStatus(details.source || 'ESTIMATED');
                  return { label: fieldName, value: details.value || 'N/A', source, status };
                });

                const isLast = index === filteredArray.length - 1;

                return (
                  <ExpandableCategorySection 
                    key={categoryName} 
                    title={categoryName} 
                    data={formattedFields} 
                    isLast={isLast} 
                  />
                );
            })}
          </View>

          {/* ── SEÇÃO DE FONTES ── */}
          <SourcesSection specsData={specs} />

          <TouchableOpacity
            style={[styles.compareFab, { marginTop: 16 }]}
            onPress={() => navigation.navigate('Compare', { vehicleData: vehicle })}
          >
            <Text style={styles.compareFabText}>Comparar Ficha Técnica</Text>
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};