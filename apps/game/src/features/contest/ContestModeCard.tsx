import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, radii, spacing } from '@cly/design-tokens';
import type { ContestModeDefinition } from '@cly/game-engine';
import { AppText } from '../../components/AppText';
import { GamePressable } from '../../components/GamePressable';
import { StatusBadge } from '../../components/StatusBadge';

const HREF: Partial<Record<ContestModeDefinition['id'], string>> = { AI: '/concurso/contra-ia' };

/**
 * Modo de concurso. Solo se puede abrir el que tiene pantalla real; el resto se muestra como
 * tarjeta informativa "En preparación" sin ninguna acción que simule estar disponible.
 */
export function ContestModeCard({ mode }: { mode: ContestModeDefinition }) {
  const href = HREF[mode.id];
  const openable = mode.availability === 'CONFIGURABLE' && href !== undefined;
  const badge = openable
    ? ({ tone: 'beta', label: 'Configuración disponible · partida en preparación' } as const)
    : ({ tone: 'soon', label: 'En preparación' } as const);

  const content = (
    <>
      <View style={styles.text}>
        <AppText variant="title" heading>
          {mode.title}
        </AppText>
        <AppText tone="muted">{mode.description}</AppText>
        <StatusBadge tone={badge.tone} label={badge.label} />
      </View>
      {openable ? (
        <AppText variant="title" tone="highlight" aria-hidden>
          ›
        </AppText>
      ) : null}
    </>
  );

  if (!openable) {
    return (
      <View
        style={[styles.card, styles.disabled]}
        accessible
        accessibilityLabel={`${mode.title}. ${mode.description} ${badge.label}`}
        testID={`mode-${mode.id.toLowerCase()}`}
      >
        {content}
      </View>
    );
  }

  return (
    <Link href={href as '/concurso/contra-ia'} asChild>
      <GamePressable
        accessibilityRole="link"
        accessibilityLabel={`${mode.title}. ${mode.description} ${badge.label}`}
        testID={`mode-${mode.id.toLowerCase()}`}
        pressScale={0.98}
        hoverStyle={{ borderColor: colors.focusRing }}
        style={StyleSheet.flatten([styles.card, styles.open])}
      >
        {content}
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
  },
  open: { backgroundColor: colors.surfaceRaised, borderColor: colors.highlight },
  disabled: { backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'dashed' },
  text: { flex: 1, gap: spacing.xs },
});
