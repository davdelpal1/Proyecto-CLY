import { StyleSheet, View } from 'react-native';
import { spacing } from '@cly/design-tokens';
import {
  PUZZLE_REGISTRY,
  defaultDurationSeconds,
  getCatalogGroups,
  isPlayable,
} from '@cly/game-engine';
import { AppText } from '../../src/components/AppText';
import { FadeIn } from '../../src/components/FadeIn';
import { GameHeader } from '../../src/components/GameHeader';
import { Screen } from '../../src/components/Screen';
import { GameCatalogCard } from '../../src/features/catalog/GameCatalogCard';
import { ACTIVE_RULESET } from '../../src/config/ruleset';
import { useBreakpoint } from '../../src/theme/useBreakpoint';

export default function Juegos() {
  const { breakpoint } = useBreakpoint();
  const groups = getCatalogGroups();
  const available = PUZZLE_REGISTRY.filter(isPlayable).length;

  return (
    <Screen>
      <GameHeader title="Juegos individuales" fallbackHref="/inicio" />

      <AppText tone="muted">
        Elige una prueba y practícala sin rival ni registro. Al terminar verás la solución razonada.{' '}
        <AppText tone="default" style={styles.strong}>
          {available} de {PUZZLE_REGISTRY.length} pruebas disponibles ahora
        </AppText>
        ; el resto está en preparación.
      </AppText>

      {groups.map((group, index) => (
        <FadeIn key={group.id} delay={index * 60}>
          <View style={styles.group}>
            <AppText variant="label" tone="accent" heading>
              {group.label}
            </AppText>
            <View style={styles.grid}>
              {group.puzzles.map((puzzle) => (
                <View
                  key={puzzle.type}
                  style={[styles.cell, breakpoint === 'desktop' && styles.cellHalf]}
                >
                  <GameCatalogCard
                    puzzle={puzzle}
                    durationSeconds={defaultDurationSeconds(puzzle.type, ACTIVE_RULESET)}
                  />
                </View>
              ))}
            </View>
          </View>
        </FadeIn>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  strong: { fontWeight: '800' },
  group: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: { width: '100%' },
  cellHalf: { width: '48.5%', flexGrow: 1 },
});
