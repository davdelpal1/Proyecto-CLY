import { StyleSheet, View } from 'react-native';
import { colors, radii } from '@cly/design-tokens';
import { AppText } from './AppText';
import type { TextTone } from './AppText';

const tiles: { letter: string; bg: string; tone: TextTone; tilt: string }[] = [
  { letter: 'C', bg: colors.accent, tone: 'onAccent', tilt: '-5deg' },
  { letter: 'L', bg: colors.gold, tone: 'onGold', tilt: '2deg' },
  { letter: 'Y', bg: colors.highlight, tone: 'onHighlight', tilt: '-3deg' },
];

/**
 * Marca provisional: tres fichas con las iniciales del nombre de trabajo (no es una marca validada).
 * Geometría propia, sin relación con ningún programa de televisión.
 */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Proyecto CLY" style={styles.row}>
      {tiles.map((tile) => (
        <View
          key={tile.letter}
          style={[
            styles.tile,
            {
              width: size,
              height: size,
              backgroundColor: tile.bg,
              transform: [{ rotate: tile.tilt }],
            },
          ]}
        >
          <AppText
            tone={tile.tone}
            style={{ fontSize: size * 0.55, fontWeight: '800' }}
            aria-hidden
          >
            {tile.letter}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  tile: { borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
});
