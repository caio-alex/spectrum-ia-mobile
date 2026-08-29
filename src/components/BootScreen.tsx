// src/components/BootScreen.tsx
//
// Tela de abertura. Aparece duas vezes: enquanto a Sora carrega e enquanto o
// AuthProvider reidrata os tokens. Antes esse momento era um ActivityIndicator
// branco no meio do azul — funcional, mas é literalmente o primeiro contato do
// usuário com o produto todo dia.
//
// Sem texto de propósito: nesse instante a fonte da marca pode ainda não estar
// disponível, e um "flash" de fonte do sistema estraga justamente a primeira
// impressão que a tela existe para criar.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { theme } from '../styles/theme';
import { ScanGrid, SpectrumRay } from './ui/Spectrum';

export const BootScreen: React.FC = () => {
  const fade = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: theme.motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [fade, sweep]);

  return (
    <View style={styles.root}>
      <ScanGrid />
      <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
        <Image
          source={require('../../assets/spectrum-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Um feixe percorrendo a faixa: o "scan" acontecendo. */}
        <View style={styles.track}>
          <Animated.View
            style={{
              width: '45%',
              height: '100%',
              transform: [
                {
                  translateX: sweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-70, 140],
                  }),
                },
              ],
            }}
          >
            <SpectrumRay height={3} rounded />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.brand[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 52,
  },
  track: {
    width: 140,
    height: 3,
    borderRadius: 2,
    marginTop: theme.space[6],
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
});
