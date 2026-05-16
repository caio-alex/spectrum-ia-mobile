import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/specTable.styles';
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
          // onPress={() => {
          //   // 4. Dispara a navegação passando os dados da linha clicada
          //   navigation.navigate('FieldDetail', {
          //     vehicleName: 'Veículo Selecionado', // Idealmente você passaria isso por prop no SpecTable
          //     fieldCategory: category,
          //     fieldName: item.label,
          //     fieldValue: item.value,
          //     confidence: getConfidenceLevel(item.status),
          //     sourceName: item.source,
          //     sourceUrl: 'https://exemplo.com/fonte', // Mock temporário
          //     sourceQuote: 'Trecho extraído do texto original pela IA para embasar este dado.' // Mock temporário
          //   });
          // }}
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

