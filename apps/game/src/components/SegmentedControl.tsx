import { StyleSheet, View } from 'react-native';
import { colors, minTouchTarget, radii, spacing } from '@cly/design-tokens';
import { AppText } from './AppText';
import { GamePressable } from './GamePressable';

interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Selector de una opción entre pocas (semántica de grupo de radio para lectores de pantalla). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.row}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <GamePressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            aria-checked={selected}
            onPress={() => onChange(option.id)}
            testID={`segment-${option.id}`}
            hoverStyle={{
              backgroundColor: selected ? colors.accentPressed : colors.surfaceOverlay,
            }}
            style={[styles.option, selected && styles.selected]}
          >
            <AppText tone={selected ? 'onAccent' : 'default'} style={styles.label}>
              {selected ? '✓ ' : ''}
              {option.label}
            </AppText>
          </GamePressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { fontWeight: '800' },
});
