import { Pressable, StyleSheet } from 'react-native';
import type {
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '@cly/design-tokens';

interface InteractionState extends PressableStateCallbackType {
  hovered?: boolean;
  focused?: boolean;
}

export interface GamePressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  hoverStyle?: ViewStyle;
  pressedStyle?: ViewStyle;
  /** Escala al pulsar. 1 = sin efecto. */
  pressScale?: number;
}

/**
 * Pressable base de toda la app: feedback al pulsar, hover en web, anillo de foco visible
 * (teclado / lector de pantalla) y cursor. Los demás componentes interactivos lo componen.
 */
export function GamePressable({
  style,
  hoverStyle,
  pressedStyle,
  pressScale = 0.97,
  disabled,
  ...rest
}: GamePressableProps) {
  return (
    <Pressable
      disabled={disabled}
      {...rest}
      style={(state) => {
        const { pressed, hovered, focused } = state as InteractionState;
        return [
          styles.base,
          style,
          !disabled && hovered && hoverStyle,
          !disabled && pressed && { transform: [{ scale: pressScale }] },
          !disabled && pressed && pressedStyle,
          !disabled && focused && styles.focus,
        ];
      }}
    />
  );
}

const styles = StyleSheet.create({
  base: { cursor: 'pointer', userSelect: 'none' },
  focus: {
    outlineColor: colors.focusRing,
    outlineWidth: 3,
    outlineOffset: 2,
    outlineStyle: 'solid',
  },
});
