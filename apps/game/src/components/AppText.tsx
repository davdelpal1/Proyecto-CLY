import { StyleSheet, Text } from 'react-native';
import type { TextProps, TextStyle } from 'react-native';
import { colors, fontSizes, fontWeights, lineHeights, tabularNumbers } from '@cly/design-tokens';

export type TextVariant =
  'display' | 'headline' | 'title' | 'bodyLarge' | 'body' | 'label' | 'caption';
export type TextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'accent'
  | 'highlight'
  | 'success'
  | 'warning'
  | 'danger'
  | 'onAccent'
  | 'onHighlight'
  | 'onGold'
  | 'onPaper';

const toneColor: Record<TextTone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  subtle: colors.textSubtle,
  accent: colors.accent,
  highlight: colors.highlight,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  onAccent: colors.onAccent,
  onHighlight: colors.onHighlight,
  onGold: colors.onGold,
  onPaper: colors.onTilePaper,
};

const variantStyle: Record<TextVariant, TextStyle> = {
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.display * lineHeights.tight,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: fontSizes.headline,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.headline * lineHeights.tight,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.title * lineHeights.normal,
  },
  bodyLarge: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.bodyLarge * lineHeights.normal,
  },
  body: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.body * lineHeights.normal,
  },
  label: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.caption * lineHeights.normal,
  },
};

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /** Cifras de ancho fijo (relojes, marcadores, valores de fichas). */
  tabular?: boolean;
  center?: boolean;
  heading?: boolean;
}

export function AppText({
  variant = 'body',
  tone = 'default',
  tabular = false,
  center = false,
  heading = false,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      accessibilityRole={heading ? 'header' : undefined}
      {...rest}
      style={[
        styles.base,
        variantStyle[variant],
        { color: toneColor[tone] },
        tabular && tabularNumbers,
        center && styles.center,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
  center: { textAlign: 'center' },
});
