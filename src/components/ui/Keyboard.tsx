// src/components/ui/Keyboard.tsx
//
// Tratamento de teclado — um lugar só, para as duas plataformas.
//
// O bug que originou este arquivo: o app usava
// `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`, receita que
// circula em quase todo tutorial de React Native. No Android isso deixa o
// KeyboardAvoidingView SEM COMPORTAMENTO — a conta é que o próprio sistema
// encolhe a janela (`windowSoftInputMode=adjustResize`) e o layout se ajusta
// sozinho.
//
// Só que este projeto roda com `edgeToEdgeEnabled: true` (padrão da SDK 54):
// nesse modo o app desenha sob as barras do sistema e a janela NÃO encolhe mais
// quando o teclado sobe — ele é desenhado por cima. Resultado: nada se movia e o
// teclado cobria os campos de baixo.
//
// A correção é usar `padding` também no Android. Como a janela não encolhe, não
// há risco de compensar duas vezes.
//
// Nota sobre alternativas: a melhor solução hoje é o
// `react-native-keyboard-controller`, que acompanha o teclado quadro a quadro em
// vez de reagir ao evento. Ele exige módulo nativo e NÃO roda no Expo Go — vale
// a troca quando o projeto passar a usar development build.

import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/**
 * `true` enquanto o teclado está aberto.
 *
 * Serve para a tela ceder espaço a ele: encolher um banner, esconder um rodapé
 * decorativo. No iOS ouvimos os eventos `Will*`, que chegam antes da animação —
 * a interface se reorganiza junto com o teclado, e não depois dele.
 */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, () => setVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Altura já descontada acima do teclado (ex.: uma barra de ação fixa). */
  offset?: number;
}

/**
 * Envolve conteúdo que contém campos de digitação e abre espaço para o teclado.
 * Use sempre este componente em vez do `KeyboardAvoidingView` direto — é ele que
 * garante o mesmo comportamento no Android e no iOS.
 */
export const KeyboardAvoider: React.FC<Props> = ({ children, style, offset = 0 }) => (
  <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={offset} style={style}>
    {children}
  </KeyboardAvoidingView>
);
