import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@cly/design-tokens';
import { AppText } from './AppText';
import type { TextTone } from './AppText';

export interface ScoreItem {
  label: string;
  value: string;
  tone?: TextTone;
  testID?: string;
}

/**
 * Marcador: una fila de pares etiqueta/valor. En entrenamiento muestra solo datos propios
 * (nunca un rival ficticio); en concurso recibirá los marcadores reales de cada jugador.
 */
export function ScoreBoard({ items }: { items: ScoreItem[] }) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View
          key={item.label}
          style={styles.cell}
          accessible
          accessibilityLabel={`${item.label}: ${item.value}`}
          testID={item.testID}
        >
          <AppText variant="label" tone="muted" numberOfLines={1}>
            {item.label}
          </AppText>
          <AppText variant="headline" tone={item.tone ?? 'default'} tabular numberOfLines={1}>
            {item.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: {
    flexGrow: 1,
    flexBasis: 120,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
