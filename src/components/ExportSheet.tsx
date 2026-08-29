// src/components/ExportSheet.tsx
//
// Bottom sheet de exportação — escolhe o formato do arquivo (PDF ou CSV) e
// devolve a escolha para a tela, que chama o endpoint correspondente:
//   - ResultScreen        → GET /v1/searches/{id}/export (uma pesquisa)
//   - SessionDetailScreen → GET /v1/sessions/{id}/export (a sessão inteira)
//
// O componente não conhece os endpoints: só cuida do estado visual
// (carregando / erro) que a tela informa. A animação e o gesto de arraste vêm
// do <Sheet> compartilhado.

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '../styles/theme';
import type { ExportFormat } from '../types/api';
import { Button, FormError, Icon, PressableScale, Sheet, Txt, type IconName } from './ui';

export interface ExportOption {
  format: ExportFormat;
  icon: IconName;
  title: string;
  subtitle: string;
}

const DEFAULT_OPTIONS: ExportOption[] = [
  {
    format: 'pdf',
    icon: 'pdf',
    title: 'Baixar PDF',
    subtitle: 'Relatório formatado, pronto para leitura',
  },
  {
    format: 'csv',
    icon: 'csv',
    title: 'Baixar CSV',
    subtitle: 'Planilha com todos os campos extraídos',
  },
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
}) => (
  <Sheet
    visible={visible}
    onClose={onClose}
    title={title}
    subtitle={subtitle}
    locked={isExporting !== null}
    maxHeightRatio={0.6}
  >
    <FormError message={errorMessage} />

    <View style={{ gap: theme.space[2] }}>
      {options.map((opt) => {
        const busy = isExporting === opt.format;
        const disabled = isExporting !== null;
        return (
          <PressableScale
            key={opt.format}
            onPress={() => onSelect(opt.format)}
            disabled={disabled}
            scaleTo={0.985}
            accessibilityRole="button"
            accessibilityLabel={opt.title}
            style={[styles.option, disabled && !busy && { opacity: 0.45 }]}
          >
            <View style={styles.optionIcon}>
              {busy ? (
                <ActivityIndicator size="small" color={theme.brand[600]} />
              ) : (
                <Icon name={opt.icon} size={16} color={theme.brand[700]} />
              )}
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Txt variant="bodyStrong">{opt.title}</Txt>
              <Txt variant="micro" tone="faint">
                {busy ? 'Gerando arquivo…' : opt.subtitle}
              </Txt>
            </View>
            {!busy ? <Icon name="download" size={13} color={theme.ink[300]} /> : null}
          </PressableScale>
        );
      })}
    </View>

    <Button
      label="Cancelar"
      variant="ghost"
      onPress={onClose}
      disabled={isExporting !== null}
      style={{ marginTop: theme.space[3] }}
    />
  </Sheet>
);

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[3],
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.card,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
