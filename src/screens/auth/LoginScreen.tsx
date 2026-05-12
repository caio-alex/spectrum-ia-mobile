// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../../styles/theme';
import { Image, ImageSourcePropType, ImageStyle } from 'react-native';
import {styles} from '../../styles/login.styles'

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('ana.silva@ford.com.br');

  const handleLogin = () => {
    // Aqui entrará a lógica do AuthContext futuramente
    // Por enquanto, apenas navegamos para o fluxo principal
    navigation.replace('MainTabs'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Azul */}
      <View style={styles.header}>
        <View style={styles.logoIcon}>
          <Image
            source={require('../../../assets/spectrum-logo-icone.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.logoTextContainer}>
          <Image
            source={require('../../../assets/spectrum-logo-texto.png')}
            style={styles.logoTextImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subTitle}>Análise competitiva automotiva</Text>
      </View>

      {/* Card de Formulário */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Entrar na plataforma</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-MAIL CORPORATIVO</Text>
          <TextInput 
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="exemplo@empresa.com"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SENHA</Text>
          <TextInput 
            style={styles.input}
            secureTextEntry
            value="********"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};