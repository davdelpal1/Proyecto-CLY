import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '@cly/design-tokens';

interface PanelProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'raised' | 'accent';
}

/** Superficie base (tarjetas, marcadores, bloques de información). */
export function Panel({ children, style, tone = 'default' }: PanelProps) {
  return (
    <View
      style={[
        styles.base,
        tone === 'raised' && styles.raised,
        tone === 'accent' && styles.accent,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    boxShadow: shadows.card,
  },
  raised: { backgroundColor: colors.surfaceRaised },
  accent: { borderColor: colors.accent },
});
