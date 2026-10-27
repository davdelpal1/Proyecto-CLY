import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@cly/design-tokens';
import { AppText } from './AppText';
import type { TextTone } from './AppText';

export type BadgeTone = 'available' | 'soon' | 'beta' | 'provisional';

const config: Record<BadgeTone, { tone: TextTone; border: string; mark: string }> = {
  available: { tone: 'success', border: colors.success, mark: '●' },
  soon: { tone: 'warning', border: colors.warning, mark: '◌' },
  beta: { tone: 'highlight', border: colors.highlight, mark: '◆' },
  provisional: { tone: 'muted', border: colors.borderStrong, mark: '△' },
};

interface StatusBadgeProps {
  tone: BadgeTone;
  label: string;
}

/**
 * Etiqueta de estado. El significado va siempre en texto y en una marca de forma distinta
 * (no solo en el color), por accesibilidad.
 */
export function StatusBadge({ tone, label }: StatusBadgeProps) {
  const { tone: textTone, border, mark } = config[tone];
  return (
    <View style={[styles.badge, { borderColor: border }]} accessible accessibilityLabel={label}>
      <AppText variant="caption" tone={textTone} aria-hidden style={styles.mark}>
        {mark}
      </AppText>
      <AppText variant="caption" tone={textTone} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  mark: { fontSize: 9 },
  text: { fontWeight: '600' },
});
