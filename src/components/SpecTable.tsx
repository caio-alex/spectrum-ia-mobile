import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';

interface SpecItem {
  label: string;
  value: string;
  source: string;
  status: 'high' | 'medium' | 'low';
}

export const SpecTable = ({ category, data }: { category: string, data: SpecItem[] }) => {
  const navigation = useNavigation<any>(); // 2. Inicialize a navegação

  const getStatusColor = (status: string) => {
    if (status === 'high') return '#4CAF50'; // Oficial
    if (status === 'medium') return '#FF9800'; // Review
    return '#F44336'; // Estimado
  };

  // Mapeamento do status para a tipagem que a Tela 07 espera
  const getConfidenceLevel = (status: string) => {
    if (status === 'high') return 'official';
    if (status === 'medium') return 'review';
    return 'estimated';
  };

  return (
    <View style={styles.tableContainer}>
      <Text style={styles.categoryTitle}>{category}</Text>
      {data.map((item, index) => (
        // 3. Trocamos <View> por <TouchableOpacity> e adicionamos o onPress
        <TouchableOpacity 
          key={index} 
          style={[styles.row, index === data.length - 1 && { borderBottomWidth: 0 }]}
          activeOpacity={0.7}
          onPress={() => {
            // 4. Dispara a navegação passando os dados da linha clicada
            navigation.navigate('FieldDetail', {
              vehicleName: 'Veículo Selecionado', // Idealmente você passaria isso por prop no SpecTable
              fieldCategory: category,
              fieldName: item.label,
              fieldValue: item.value,
              confidence: getConfidenceLevel(item.status),
              sourceName: item.source,
              sourceUrl: 'https://exemplo.com/fonte', // Mock temporário
              sourceQuote: 'Trecho extraído do texto original pela IA para embasar este dado.' // Mock temporário
            });
          }}
        >
          <View style={styles.labelCol}>
            <Text style={styles.label}>{item.label}</Text>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          </View>
          <View style={styles.valueCol}>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.source}>Fonte: {item.source}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    marginBottom: 20,
    overflow: 'hidden'
  },
  categoryTitle: { 
    backgroundColor: theme.colors.surface, 
    padding: 12, 
    fontSize: 11, 
    fontWeight: '700', 
    color: theme.colors.primary,
    textTransform: 'uppercase'
  },
  row: { 
    flexDirection: 'row', 
    padding: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border 
  },
  labelCol: { flex: 1, justifyContent: 'center' },
  label: { fontSize: 13, color: theme.colors.textLight, marginBottom: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  valueCol: { flex: 2, alignItems: 'flex-end' },
  value: { fontSize: 14, fontWeight: '600', color: theme.colors.text, textAlign: 'right' },
  source: { fontSize: 10, color: theme.colors.textLight, marginTop: 4 }
});