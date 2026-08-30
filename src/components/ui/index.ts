// src/components/ui/index.ts
// Ponto único de importação do design system.
//
//   import { Screen, ScreenHeader, Card, Button, Txt } from '../../components/ui';

export { Txt, Eyebrow, type TxtVariant, type TxtTone } from './Txt';
export {
  Icon,
  ICONS,
  categoryIcon,
  categoryColor,
  categoryIdentity,
  type CategoryIdentity,
  type IconName,
} from './Icon';
export { PressableScale } from './Pressable';
export { Button, IconButton, type ButtonVariant, type ButtonSize } from './Button';
export { Card, SectionHeader, StatTile, StatRow, Divider, formatMetric } from './Surfaces';
export { Callout, type CalloutTone } from './Callout';
export { Badge, ConfidenceBadge, ConfidenceBars, toConfidenceKey, type BadgeTone } from './Badge';
export {
  Skeleton,
  SkeletonCard,
  SkeletonList,
  EmptyState,
  ErrorState,
  FormError,
} from './Feedback';
export {
  SpectrumRay,
  ScanGrid,
  BrandMark,
  ProgressBar,
  ProgressRing,
  SpectrumFlow,
  useReducedMotion,
} from './Spectrum';
export { Screen, ScreenHeader, BottomInset } from './Screen';
export { KeyboardAvoider, useKeyboardVisible } from './Keyboard';
export { Sheet } from './Sheet';
export { ConfirmSheet } from './ConfirmSheet';
export { Field, TextField, SelectRow } from './Field';
export { Stepper } from './Stepper';
