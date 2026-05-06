import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { theme } from '../../styles/theme';
import { SpecTable } from '../../components/SpecTable';
import { StatsBar } from '../../components/StatsBar'; // Componente que você já possui

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
            <Text style={styles.pdfIcon}>📄</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vehicleInfo}>
          <Text style={styles.brandText}>{params.brand}</Text>
          <Text style={styles.modelText}>{params.model} {params.version}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.yearBadge}><Text style={styles.yearText}>{params.year}</Text></View>
            <Text style={styles.sourceCount}>12 fontes consultadas</Text>
          </View>
        </View>

        {/* MÉTRICAS DE CONFIANÇA DA IA */}
        <View style={styles.statsContainer}>
          <StatsBar stats={[
    { label: "Confiança Geral", value: "98%", emoji: "🎯" },
    { label: "Acurácia", value: "92%", emoji: "✅" }
  ]}/>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightEmoji}>🧠</Text>
            <Text style={styles.insightText}>
              A IA identificou que este modelo possui 15% mais eficiência energética que a média da categoria SUV Médio.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>ESPECIFICAÇÕES TÉCNICAS</Text>
          
          {/* TABELA DE SPECS */}
          <SpecTable category="Motorização" data={[
            { label: 'Potência Max', value: '177 cv (E) / 169 cv (G)', source: 'Oficial', status: 'high' },
            { label: 'Torque Max', value: '21,4 kgfm', source: 'Oficial', status: 'high' },
            { label: 'Câmbio', value: 'CVT com 10 marchas', source: 'Review', status: 'medium' },
          ]} />

          <SpecTable category="Segurança & ADAS" data={[
            { label: 'Airbags', value: '7 (Frontais, laterais e cortina)', source: 'Oficial', status: 'high' },
            { label: 'Frenagem Autônoma', value: 'Sim (Toyota Safety Sense)', source: 'Oficial', status: 'high' },
            { label: 'Alerta de Faixa', value: 'Sim, com correção', source: 'Estimado', status: 'low' },
          ]} />

          <TouchableOpacity 
            style={styles.compareFab}
            onPress={() => navigation.navigate('CompareSelector')}
          >
            <Text style={styles.compareFabText}>Comparar este veículo</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primary },
  header: { padding: 20, paddingBottom: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backBtn: { color: '#fff', fontSize: 24 },
  pdfBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 },
  pdfIcon: { fontSize: 18 },
  vehicleInfo: { marginBottom: 20 },
  brandText: { color: theme.colors.secondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  modelText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  yearBadge: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 10 },
  yearText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
  sourceCount: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  statsContainer: { gap: 12 },
  content: { flex: 1, backgroundColor: theme.colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  scrollPadding: { padding: 20, paddingBottom: 100 },
  insightCard: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, flexDirection: 'row', gap: 12, marginBottom: 25 },
  insightEmoji: { fontSize: 24 },
  insightText: { flex: 1, fontSize: 13, color: theme.colors.text, lineHeight: 18 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.textLight, letterSpacing: 1, marginBottom: 15 },
  compareFab: { backgroundColor: theme.colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  compareFabText: { color: '#fff', fontWeight: '700' }
});