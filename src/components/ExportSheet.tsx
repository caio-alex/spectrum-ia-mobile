// src/components/ExportSheet.tsx
//
// Bottom sheet de exportação — escolhe o formato do arquivo (PDF ou CSV) e
// devolve a escolha para a tela, que chama o endpoint correspondente:
//   - ResultScreen        → GET /v1/searches/{id}/export (uma pesquisa)
//   - SessionDetailScreen → GET /v1/sessions/{id}/export (a sessão inteira)
//
// O componente não conhece os endpoints: só cuida da animação, do gesto de
// arraste e do estado visual (carregando/erro) que a tela informa.

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../styles/theme';
import { styles } from '../styles/exportSheet.styles';
import type { ExportFormat } from '../types/api';

// Distância (em px) que o sheet percorre ao entrar/sair de tela.
const SHEET_OFFSET = 500;
// Arrastando mais que isso para baixo (ou soltando com velocidade alta) fecha o modal.
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.9;

export interface ExportOption {
  format: ExportFormat;
  icon: string;
  title: string;
  subtitle: string;
}

const DEFAULT_OPTIONS: ExportOption[] = [
  { format: 'pdf', icon: '📄', title: 'Baixar PDF', subtitle: 'Relatório formatado, pronto para leitura' },
  { format: 'csv', icon: '📊', title: 'Baixar CSV', subtitle: 'Planilha com todos os campos extraídos' },
];

interface Props {
  visible: boolean;
  /** Formato em download no momento — mostra o spinner na opção correspondente. */
  isExporting: ExportFormat | null;
  onClose: () => void;
  onSelect: (format: ExportFormat) => void;
  title?: string;
  subtitle?: string;
  /** Mensagem de falha da última tentativa (ex.: sessão sem pesquisas concluídas). */
  errorMessage?: string | null;
  options?: ExportOption[];
}

export const ExportSheet: React.FC<Props> = ({
  visible,
  isExporting,
  onClose,
  onSelect,
  title = 'Exportar resultado',
  subtitle = 'Escolha o formato do arquivo para baixar',
  errorMessage = null,
  options = DEFAULT_OPTIONS,
}) => {
  // `mounted` mantém o <Modal> na árvore enquanto a animação de saída roda —
  // se fechássemos direto no `visible`, o RN Modal some sem animar.
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(SHEET_OFFSET)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(SHEET_OFFSET);
      Animated.timing(translateY, { toValue: 0, duration: 240, useNativeDriver: true }).start();
    } else if (mounted) {
      Animated.timing(translateY, { toValue: SHEET_OFFSET, duration: 200, useNativeDriver: true }).start(() => {
        setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const springBack = () => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
  };

  // `isExporting` é lido de um ref porque o PanResponder é criado uma única vez —
  // sem isso o gesto continuaria fechando o sheet no meio de um download.
  const exportingRef = useRef(isExporting);
  exportingRef.current = isExporting;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const panResponder = useRef(
    PanResponder.create({
      // Só assume o gesto quando é um arraste vertical para baixo — assim
      // toques nos botões/opções continuam funcionando normalmente.
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        exportingRef.current === null && gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) {
          onCloseRef.current();
        } else {
          springBack();
        }
      },
      onPanResponderTerminate: () => springBack(),
    }),
  ).current;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Área de arraste: cobre a alça e o título, sem invadir a lista de opções */}
        <View {...panResponder.panHandlers}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        {options.map((opt) => {
          const disabled = isExporting !== null;
          return (
            <TouchableOpacity
              key={opt.format}
              style={[styles.option, disabled && styles.optionDisabled]}
              onPress={() => onSelect(opt.format)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconBox}>
                {isExporting === opt.format ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
                )}
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isExporting !== null}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};
