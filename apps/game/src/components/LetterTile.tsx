import { StyleSheet, View } from 'react-native';
import { colors, radii, shadows } from '@cly/design-tokens';
import { AppText } from './AppText';
import { GamePressable } from './GamePressable';

/**
 * `available`: en el atril y libre. `used`: ya está en la palabra (inactiva, discontinua y atenuada).
 * `picked`: forma parte de la palabra; al tocarla se quita.
 */
export type LetterTileState = 'available' | 'used' | 'picked';

interface LetterTileProps {
  /** La letra en minúscula; se muestra en mayúscula. */
  letter: string;
  state: LetterTileState;
  size?: number;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * Ficha de letra. Los estados se distinguen sin depender del color: usada = borde discontinuo y
 * atenuada; en la palabra = borde grueso del color de acento.
 */
export function LetterTile({
  letter,
  state,
  size = 60,
  onPress,
  testID,
  accessibilityLabel,
}: LetterTileProps) {
  const used = state === 'used';
  const picked = state === 'picked';
  const display = letter.toUpperCase();

  return (
    <GamePressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `letra ${display}${used ? ', ya usada' : ''}`}
      aria-disabled={used}
      disabled={used}
      onPress={onPress}
      testID={testID}
      pressScale={0.92}
      style={[
        styles.tile,
        { width: size, height: size },
        picked && styles.picked,
        used && styles.used,
      ]}
    >
      <AppText tone="onPaper" style={{ fontSize: size * 0.5, fontWeight: '800' }}>
        {display}
      </AppText>
    </GamePressable>
  );
}

/** Hueco vacío de la palabra: indica hasta dónde llega el mínimo. */
export function LetterSlot({ size = 60 }: { size?: number }) {
  return <View aria-hidden style={[styles.slot, { width: size, height: size }]} />;
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: '#CDBF9C',
    backgroundColor: colors.tilePaper,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.raised,
  },
  picked: {
    borderWidth: 4,
    borderColor: colors.accent,
    boxShadow: shadows.glowAccent,
  },
  used: { opacity: 0.35, borderStyle: 'dashed', boxShadow: 'none' },
  slot: {
    borderRadius: radii.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
});
