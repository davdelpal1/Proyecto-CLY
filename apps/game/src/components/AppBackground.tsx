import { StyleSheet, View } from 'react-native';
import { colors } from '@cly/design-tokens';

/**
 * Fondo decorativo propio: formas geométricas abstractas (círculos y fichas giradas).
 * No imita ningún plató ni recurso de terceros. Oculto para lectores de pantalla.
 */
export function AppBackground() {
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={styles.root}
    >
      <View style={[styles.circle, styles.circleAccent]} />
      <View style={[styles.circle, styles.circleHighlight]} />
      <View style={[styles.tile, styles.tileOne]} />
      <View style={[styles.tile, styles.tileTwo]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, overflow: 'hidden', backgroundColor: colors.background },
  circle: { position: 'absolute', borderRadius: 999 },
  circleAccent: {
    width: 520,
    height: 520,
    top: -200,
    right: -160,
    backgroundColor: 'rgba(31, 224, 207, 0.07)',
  },
  circleHighlight: {
    width: 420,
    height: 420,
    bottom: -180,
    left: -140,
    backgroundColor: 'rgba(255, 122, 89, 0.06)',
  },
  tile: {
    position: 'absolute',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(86, 104, 176, 0.18)',
  },
  tileOne: { width: 160, height: 160, top: 220, left: -50, transform: [{ rotate: '18deg' }] },
  tileTwo: { width: 120, height: 120, bottom: 140, right: -30, transform: [{ rotate: '-14deg' }] },
});
