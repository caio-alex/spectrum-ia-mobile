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
import { styles } from '../../styles/ResultScreen.styles';
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

