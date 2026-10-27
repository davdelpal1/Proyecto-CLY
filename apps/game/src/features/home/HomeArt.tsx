import { StyleSheet, View } from 'react-native';
import { colors, radii } from '@cly/design-tokens';
import { AppText } from '../../components/AppText';
import type { TextTone } from '../../components/AppText';

/** Ilustración de "Juegos individuales": cuatro fichas sueltas (cifra, operador, letra, interrogante). */
export function GamesArt() {
  const tiles: { glyph: string; bg: string; tone: TextTone; tilt: string }[] = [
    { glyph: '7', bg: colors.tilePaper, tone: 'onPaper', tilt: '-6deg' },
    { glyph: '×', bg: colors.accent, tone: 'onAccent', tilt: '5deg' },
    { glyph: 'A', bg: colors.gold, tone: 'onGold', tilt: '4deg' },
    { glyph: '?', bg: colors.highlight, tone: 'onHighlight', tilt: '-4deg' },
  ];
  return (
    <View style={styles.grid}>
      {tiles.map((tile) => (
        <View
          key={tile.glyph}
          style={[styles.tile, { backgroundColor: tile.bg, transform: [{ rotate: tile.tilt }] }]}
        >
          <AppText tone={tile.tone} style={styles.glyph}>
            {tile.glyph}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** Ilustración de "Concurso completo": un podio de tres barras. */
export function ContestArt() {
  const bars = [
    { rank: '2', height: 50, bg: colors.accent, tone: 'onAccent' as const },
    { rank: '1', height: 76, bg: colors.gold, tone: 'onGold' as const },
    { rank: '3', height: 36, bg: colors.highlight, tone: 'onHighlight' as const },
  ];
  return (
    <View style={styles.podium}>
      {bars.map((bar) => (
        <View key={bar.rank} style={[styles.bar, { height: bar.height, backgroundColor: bar.bg }]}>
          <AppText tone={bar.tone} style={styles.glyph}>
            {bar.rank}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { width: 78, flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  tile: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: 20, fontWeight: '800' },
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bar: {
    width: 22,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    alignItems: 'center',
    paddingTop: 4,
  },
});
