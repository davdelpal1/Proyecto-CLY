import { StyleSheet } from 'react-native';
import { OPERATOR_SYMBOL } from '@cly/numbers-engine';
import type { Operator } from '@cly/numbers-engine';
import { colors, radii, shadows } from '@cly/design-tokens';
import { AppText } from './AppText';
import { GamePressable } from './GamePressable';

const NAME: Record<Operator, string> = {
  add: 'sumar',
  subtract: 'restar',
  multiply: 'multiplicar',
  divide: 'dividir',
};

interface OperatorButtonProps {
  op: Operator;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function OperatorButton({ op, selected, disabled = false, onPress }: OperatorButtonProps) {
  return (
    <GamePressable
      accessibilityRole="button"
      accessibilityLabel={NAME[op]}
      aria-selected={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      testID={`op-${op}`}
      hoverStyle={{ backgroundColor: selected ? colors.accentPressed : colors.surfaceOverlay }}
      style={[styles.button, selected && styles.selected, disabled && styles.disabled]}
    >
      <AppText variant="headline" tone={selected ? 'onAccent' : 'default'} aria-hidden>
        {OPERATOR_SYMBOL[op]}
      </AppText>
    </GamePressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.raised,
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.focusRing, borderWidth: 4 },
  disabled: { opacity: 0.4 },
});
