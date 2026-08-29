// src/components/ui/Stepper.tsx
//
// Indicador de etapas do fluxo de pesquisa (Veículo → Categorias → Pesquisando
// → Resultado). Saber quantos passos faltam é o que impede o abandono no meio
// de um fluxo de quatro telas.
//
// As etapas já vencidas são ligadas pelo degradê da marca; as futuras, por um
// traço cinza. O progresso vira a própria assinatura visual.

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';
import { Icon } from './Icon';
import { SpectrumRay } from './Spectrum';
import { Txt } from './Txt';

interface Props {
  steps: string[];
  /** Índice da etapa atual (0-based). */
  current: number;
  style?: StyleProp<ViewStyle>;
  /** Sobre o header escuro. */
  onDark?: boolean;
}

export const Stepper: React.FC<Props> = ({ steps, current, style, onDark }) => (
  <View style={[styles.row, style]} accessibilityLabel={`Etapa ${current + 1} de ${steps.length}`}>
    {steps.map((step, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={step}>
          <View style={styles.item}>
            <View
              style={[
                styles.dot,
                onDark && styles.dotOnDark,
                done && styles.dotDone,
                active && (onDark ? styles.dotActiveOnDark : styles.dotActive),
              ]}
            >
              {done ? (
                <Icon name="check" size={9} color="#FFFFFF" />
              ) : (
                <Txt
                  variant="micro"
                  color={
                    active
                      ? onDark
                        ? theme.brand[900]
                        : '#FFFFFF'
                      : onDark
                        ? theme.colors.onDarkFaint
                        : theme.ink[400]
                  }
                  style={{ fontFamily: theme.fonts.bold, fontSize: 10 }}
                >
                  {i + 1}
                </Txt>
              )}
            </View>
            <Txt
              variant="micro"
              numberOfLines={1}
              color={
                active
                  ? onDark
                    ? '#FFFFFF'
                    : theme.brand[800]
                  : done
                    ? onDark
                      ? theme.colors.onDarkMuted
                      : theme.brand[500]
                    : onDark
                      ? theme.colors.onDarkFaint
                      : theme.ink[400]
              }
              style={{
                fontFamily: active ? theme.fonts.bold : theme.fonts.regular,
                fontSize: 10,
                marginTop: 5,
              }}
            >
              {step}
            </Txt>
          </View>
          {i < steps.length - 1 ? (
            <View style={styles.connector}>
              {done ? (
                <SpectrumRay height={2} rounded stops={theme.spectrum.stopsShort} />
              ) : (
                <View
                  style={[
                    styles.connectorLine,
                    { backgroundColor: onDark ? 'rgba(255,255,255,0.16)' : theme.ink[100] },
                  ]}
                />
              )}
            </View>
          ) : null}
        </React.Fragment>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  item: {
    alignItems: 'center',
    width: 66,
  },
  connector: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: -6,
  },
  connectorLine: {
    height: 2,
    borderRadius: 1,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.ink[100],
  },
  dotOnDark: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  dotDone: {
    backgroundColor: theme.brand[500],
  },
  dotActive: {
    backgroundColor: theme.brand[800],
    boxShadow: '0px 0px 0px 4px rgba(0, 24, 129, 0.12)',
  },
  dotActiveOnDark: {
    backgroundColor: theme.aqua[500],
    boxShadow: '0px 0px 0px 4px rgba(44, 229, 213, 0.20)',
  },
});
