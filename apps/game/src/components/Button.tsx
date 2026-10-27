import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import type { Href } from 'expo-router';
import { colors, minTouchTarget, radii, shadows, spacing } from '@cly/design-tokens';
import { AppText } from './AppText';
import type { TextTone } from './AppText';
import { GamePressable } from './GamePressable';

export type ButtonVariant = 'primary' | 'highlight' | 'secondary' | 'ghost';

const variants: Record<
  ButtonVariant,
  { bg: string; hover: string; text: TextTone; border: string }
> = {
  primary: {
    bg: colors.accent,
    hover: colors.accentPressed,
    text: 'onAccent',
    border: colors.accent,
  },
  highlight: {
    bg: colors.highlight,
    hover: colors.highlightPressed,
    text: 'onHighlight',
    border: colors.highlight,
  },
  secondary: {
    bg: colors.surfaceRaised,
    hover: colors.surfaceOverlay,
    text: 'default',
    border: colors.borderStrong,
  },
  ghost: { bg: 'transparent', hover: colors.surfaceRaised, text: 'accent', border: 'transparent' },
};

interface ButtonProps {
  label: string;
  onPress?: () => void;
  /** Si se indica, el botón navega (se renderiza como enlace en web). */
  href?: Href;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  href,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  accessibilityHint,
  testID,
  style,
}: ButtonProps) {
  const v = variants[variant];
  const pressable = (
    <GamePressable
      accessibilityRole={href ? 'link' : 'button'}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      hoverStyle={{ backgroundColor: v.hover }}
      // `Link asChild` exige un único objeto de estilo en su hijo (no un array): se aplana.
      style={StyleSheet.flatten([
        styles.base,
        size === 'lg' && styles.large,
        { backgroundColor: v.bg, borderColor: v.border },
        variant === 'primary' || variant === 'highlight' ? { boxShadow: shadows.raised } : null,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ])}
    >
      <AppText variant={size === 'lg' ? 'bodyLarge' : 'body'} tone={v.text} style={styles.label}>
        {label}
      </AppText>
    </GamePressable>
  );

  return href ? (
    <Link href={href} asChild>
      {pressable}
    </Link>
  ) : (
    pressable
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { minHeight: 60, paddingHorizontal: spacing.xxl },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  label: { fontWeight: '800', letterSpacing: 0.4 },
});
