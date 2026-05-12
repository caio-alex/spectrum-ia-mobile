// src/screens/result/FieldDetailScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar,
  ScrollView
} from 'react-native';
// Utilizando os ícones nativos do Expo
import { FontAwesome5, Ionicons } from '@expo/vector-icons'; 
import { theme } from '../../styles/theme';
import { styles } from '../../styles/fieldDetailScreen.styles';
// ── Tipagem dos Parâmetros da Rota ────────────────────────────────────────
interface RouteParams {
  vehicleName: string;
  fieldCategory: string;
  fieldName: string;
  fieldValue: string;
  confidence: 'official' | 'review' | 'estimated';
  sourceName: string;
  sourceUrl: string;
  sourceQuote: string;
}

export const FieldDetailScreen = ({ navigation, route }: any) => {
  // Dados de fallback caso a tela seja aberta sem parâmetros
  const params: RouteParams = route?.params ?? {
    vehicleName: 'Toyota Corolla Cross XRE',
    fieldCategory: 'Especificação',
    fieldName: '0–100 km/h',
    fieldValue: '~8,5 s',
    confidence: 'review',
    sourceName: 'YouTube — Quatro Rodas',
    sourceUrl: 'youtube.com/watch?v=xK92mZ • 4m32s',
    sourceQuote: '"...no nosso teste cronometrado, o Corolla Cross fez o 0 a 100 em aproximadamente 8,5 segundos..."'
  };

  // Lógica para as cores e labels do Badge de Confiança
  const getBadgeStyle = (confidence: string) => {
    switch (confidence) {
      case 'official': 
        return { bg: '#e8f5e9', color: '#1a6e1a', label: 'Oficial' };
      case 'review': 
        return { bg: '#fff4e3', color: '#c06000', label: 'Review' };
      case 'estimated': 
        return { bg: '#ffebee', color: '#c62828', label: 'Estimado' };
      default: 
        return { bg: theme.colors.border, color: theme.colors.text, label: 'Desconhecido' };
    }
  };

  const badge = getBadgeStyle(params.confidence);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* ── HEADER AZUL ────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.vehicleContext}>{params.vehicleName}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Campo</Text>
      </View>

      {/* ── OVERLAY E BOTTOM SHEET (Mockup visual) ─────────────────────── */}
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.handle} />
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* ── INFO DO CAMPO ────────────────────────────────────────── */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldLeft}>
                <Text style={styles.fieldCategory}>{params.fieldCategory}</Text>
                <Text style={styles.fieldName}>{params.fieldName}</Text>
              </View>
              <View style={styles.fieldRight}>
                <Text style={styles.fieldValue}>{params.fieldValue}</Text>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.color }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* ── FONTE DO DADO ────────────────────────────────────────── */}
            <Text style={styles.sourceTitle}>FONTE DO DADO DA IA</Text>
            
            <View style={styles.sourceCard}>
              <View style={styles.sourceHeader}>
                {params.confidence === 'official' ? (
                  <FontAwesome5 name="building" size={14} color={theme.colors.primary} />
                ) : (
                  <FontAwesome5 name="youtube" size={14} color="#ff0000" />
                )}
                <Text style={styles.sourceName}>{params.sourceName}</Text>
              </View>
              
              <Text style={styles.sourceUrl} numberOfLines={1}>
                {params.sourceUrl}
              </Text>
              
              <View style={styles.quoteBox}>
                <Text style={styles.sourceQuote}>{params.sourceQuote}</Text>
              </View>
            </View>

            {/* ── AVISO (Aparece se não for oficial) ───────────────────── */}
            {params.confidence !== 'official' && (
              <View style={styles.warningCard}>
                <FontAwesome5 name="exclamation-triangle" size={14} color="#c06000" style={{ marginTop: 2 }} />
                <Text style={styles.warningText}>
                  <Text style={{ fontWeight: '700' }}>Dado de {params.confidence}: </Text> 
                  Sugerimos que um especialista valide a informação antes de utilizá-la em materiais comerciais.
                </Text>
              </View>
            )}

            {/* ── BOTÃO DE VALIDAÇÃO ───────────────────────────────────── */}
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => {
                // Lógica futura de validação (Tenant/Role Admin)
                alert('Informação validada e atualizada no banco de dados!');
                navigation.goBack();
              }}
            >
              <Text style={styles.primaryButtonText}>Marcar como validado</Text>
              <FontAwesome5 name="check" size={14} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};