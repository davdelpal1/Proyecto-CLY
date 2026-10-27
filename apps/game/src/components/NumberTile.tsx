import { StyleSheet } from 'react-native';
import { colors, radii, shadows } from '@cly/design-tokens';
import { AppText } from './AppText';
import type { TextTone } from './AppText';
import { GamePressable } from './GamePressable';

export type TileKind = 'small' | 'big' | 'result';
export type TileState = 'available' | 'selected' | 'consumed';

const palette: Record<TileKind, { bg: string; border: string; tone: TextTone }> = {
  small: { bg: colors.tilePaper, border: '#CDBF9C', tone: 'onPaper' },
  big: { bg: colors.gold, border: '#D9A12E', tone: 'onGold' },
  result: { bg: colors.surfaceRaised, border: colors.accent, tone: 'accent' },
};

const KIND_LABEL: Record<TileKind, string> = {
  small: 'ficha',
  big: 'ficha grande',
  result: 'resultado',
};

interface NumberTileProps {
  value: string;
  kind: TileKind;
  state: TileState;
  size?: number;
  onPress?: () => void;
  testID?: string;
}

/**
 * Ficha de número. Estados distinguibles sin depender del color: seleccionada = elevada y con
 * borde grueso; usada = borde discontinuo y atenuada. Cuando está usada queda inactiva.
 */
export function NumberTile({ value, kind, state, size = 76, onPress, testID }: NumberTileProps) {
  const colorsForKind = palette[kind];
  const consumed = state === 'consumed';
  const selected = state === 'selected';
  const digits = value.length;
  const fontSize = size * (digits <= 3 ? 0.42 : digits === 4 ? 0.34 : 0.26);

  return (
    <GamePressable
      accessibilityRole="button"
      accessibilityLabel={`${KIND_LABEL[kind]} ${value}${consumed ? ', ya usada' : ''}${selected ? ', seleccionada' : ''}`}
      aria-disabled={consumed}
      aria-selected={selected}
      disabled={consumed}
      onPress={onPress}
      testID={testID}
      pressScale={0.94}
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          backgroundColor: colorsForKind.bg,
          borderColor: selected ? colors.focusRing : colorsForKind.border,
        },
        selected && styles.selected,
        consumed && styles.consumed,
      ]}
    >
      <AppText tone={colorsForKind.tone} tabular style={{ fontSize, fontWeight: '800' }}>
        {value}
      </AppText>
    </GamePressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.raised,
  },
  selected: {
    borderWidth: 5,
    transform: [{ translateY: -6 }],
    boxShadow: shadows.glowAccent,
  },
  consumed: { opacity: 0.4, borderStyle: 'dashed', boxShadow: 'none' },
});
