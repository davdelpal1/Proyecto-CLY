import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, radii, spacing } from '@cly/design-tokens';
import { isPlayable } from '@cly/game-engine';
import type { PuzzleDefinition } from '@cly/game-engine';
import { AppText } from '../../components/AppText';
import { GamePressable } from '../../components/GamePressable';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDuration } from '../../lib/format';
import { GROUP_COLOR, PUZZLE_GLYPH } from './glyphs';

interface GameCatalogCardProps {
  puzzle: PuzzleDefinition;
  durationSeconds: number | null;
}

/**
 * Tarjeta del catálogo: nombre, resumen, tiempo y estado REAL de disponibilidad.
 * Solo las pruebas implementadas muestran "Jugar"; el resto lleva "En preparación" y su ficha
 * informativa (nunca una acción que simule estar disponible).
 */
export function GameCatalogCard({ puzzle, durationSeconds }: GameCatalogCardProps) {
  const playable = isPlayable(puzzle);
  const accent = GROUP_COLOR[puzzle.group];
  const badge = playable
    ? ({ tone: 'available', label: 'Disponible' } as const)
    : puzzle.release === 'EXTENDED_BETA'
      ? ({ tone: 'beta', label: 'Beta ampliada · En preparación' } as const)
      : ({ tone: 'soon', label: 'En preparación' } as const);

  return (
    <Link href={{ pathname: '/juegos/[prueba]', params: { prueba: puzzle.slug } }} asChild>
      <GamePressable
        accessibilityRole="link"
        accessibilityLabel={`${puzzle.title}. ${puzzle.tagline} ${badge.label}. Tiempo: ${formatDuration(durationSeconds)}.`}
        accessibilityHint="Abre la ficha de la prueba"
        testID={`card-${puzzle.slug}`}
        pressScale={0.98}
        hoverStyle={{ borderColor: colors.focusRing }}
        style={StyleSheet.flatten([styles.card, !playable && styles.cardMuted])}
      >
        <View style={[styles.glyph, { borderColor: accent }]} aria-hidden>
          <AppText
            variant="title"
            style={[styles.glyphText, { color: playable ? accent : colors.textMuted }]}
          >
            {PUZZLE_GLYPH[puzzle.type]}
          </AppText>
        </View>
        <View style={styles.body}>
          <AppText variant="title" heading>
            {puzzle.title}
          </AppText>
          <AppText tone="muted">{puzzle.tagline}</AppText>
          <View style={styles.meta}>
            <StatusBadge tone={badge.tone} label={badge.label} />
            <AppText variant="caption" tone="muted" tabular>
              ⏱ {formatDuration(durationSeconds)}
            </AppText>
          </View>
          {playable ? (
            <View style={styles.play} aria-hidden>
              <AppText tone="onAccent" style={styles.playLabel}>
                JUGAR ›
              </AppText>
            </View>
          ) : null}
        </View>
      </GamePressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  cardMuted: { backgroundColor: colors.surface },
  glyph: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    borderWidth: 2,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: { fontWeight: '800', fontSize: 20 },
  body: { flex: 1, minWidth: 0, gap: spacing.xs },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  play: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  playLabel: { fontWeight: '800', letterSpacing: 1 },
});
