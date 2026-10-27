import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@cly/design-tokens';
import { AppText } from './AppText';

interface StepListProps {
  steps: readonly string[];
  emptyText: string;
  testID?: string;
}

/** Lista numerada de pasos de cálculo, p. ej. "25 × 4 = 100". */
export function StepList({ steps, emptyText, testID }: StepListProps) {
  if (steps.length === 0) {
    return (
      <AppText tone="muted" testID={testID}>
        {emptyText}
      </AppText>
    );
  }
  return (
    <View accessibilityRole="list" style={styles.list} testID={testID}>
      {steps.map((step, index) => (
        <View key={`${index}-${step}`} style={styles.item} accessibilityRole="listitem" accessible>
          <View style={styles.index}>
            <AppText variant="caption" tone="muted" tabular aria-hidden>
              {index + 1}
            </AppText>
          </View>
          <AppText variant="bodyLarge" tabular accessibilityLabel={`Paso ${index + 1}: ${step}`}>
            {step}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  index: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
