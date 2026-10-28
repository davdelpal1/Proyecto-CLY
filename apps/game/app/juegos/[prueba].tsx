import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { colors, spacing } from '@cly/design-tokens';
import {
  PUZZLE_GROUPS,
  defaultDurationSeconds,
  findPuzzleBySlug,
  isPlayable,
  pendingFields,
} from '@cly/game-engine';
import { newExerciseSeed } from '../../src/adapters/random-seed';
import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { GameHeader } from '../../src/components/GameHeader';
import { MissingScreen } from '../../src/components/MissingScreen';
import { Panel } from '../../src/components/Panel';
import { Screen } from '../../src/components/Screen';
import { StatusBadge } from '../../src/components/StatusBadge';
import { ACTIVE_RULESET } from '../../src/config/ruleset';
import { describePendingField } from '../../src/features/catalog/pending-labels';
import { ProgressPanel } from '../../src/features/progress/ProgressPanel';
import { formatDuration } from '../../src/lib/format';

/** Ficha de prueba (UX_FLOWS.md §4): qué hay que hacer, cómo se juega y estado real de disponibilidad. */
export default function FichaPrueba() {
  const { prueba } = useLocalSearchParams<{ prueba: string }>();
  const [seed] = useState(newExerciseSeed);
  const puzzle = prueba ? findPuzzleBySlug(prueba) : undefined;

  if (!puzzle) {
    return (
      <MissingScreen
        title="Prueba no encontrada"
        message="Esa prueba no está en el catálogo."
        backLabel="Volver a juegos"
        backHref="/juegos"
      />
    );
  }

  const playable = isPlayable(puzzle);
  const seconds = defaultDurationSeconds(puzzle.type, ACTIVE_RULESET);
  const groupLabel = PUZZLE_GROUPS.find((g) => g.id === puzzle.group)?.label ?? '';
  const pending =
    puzzle.type === 'NUMBER'
      ? [
          ...pendingFields(ACTIVE_RULESET, 'numberRules'),
          ...pendingFields(ACTIVE_RULESET, 'numberScoring'),
        ]
      : [];

  const sessionHref = (clock: 'programa' | 'libre') =>
    ({
      pathname: '/sesion/entrenamiento',
      params: { prueba: puzzle.slug, reloj: clock, semilla: seed },
    }) as const;

  return (
    <Screen>
      <Stack.Screen options={{ title: `${puzzle.title} · Proyecto CLY` }} />
      <GameHeader title={puzzle.title} eyebrow={groupLabel} fallbackHref="/juegos" />

      <View style={styles.intro}>
        <AppText variant="bodyLarge">{puzzle.tagline}</AppText>
        <View style={styles.badges}>
          {playable ? (
            <StatusBadge tone="available" label="Disponible" />
          ) : (
            <StatusBadge tone="soon" label="En preparación" />
          )}
          {puzzle.release === 'EXTENDED_BETA' ? (
            <StatusBadge tone="beta" label="Beta ampliada" />
          ) : null}
        </View>
      </View>

      <Panel>
        <AppText variant="title" heading>
          Cómo se juega
        </AppText>
        <View accessibilityRole="list" style={styles.list}>
          {puzzle.howToPlay.map((line) => (
            <View key={line} style={styles.listItem} accessibilityRole="listitem" accessible>
              <AppText tone="accent" aria-hidden>
                ›
              </AppText>
              <AppText style={styles.listText}>{line}</AppText>
            </View>
          ))}
        </View>
      </Panel>

      <Panel>
        <View style={styles.facts}>
          <Fact label="Tiempo del programa" value={formatDuration(seconds)} />
          <Fact label="Rival" value="Ninguno (práctica individual)" />
          <Fact label="Dificultad" value={playable ? 'Única por ahora' : '—'} />
        </View>
      </Panel>

      {playable ? <ProgressPanel puzzle={puzzle.type} /> : null}

      {pending.length > 0 || puzzle.ruleStatus === 'PENDING_VERIFICATION' ? (
        <Panel tone="raised">
          <StatusBadge tone="provisional" label="Reglas provisionales" />
          <AppText tone="muted">
            {puzzle.ruleStatus === 'PENDING_VERIFICATION'
              ? 'La mecánica exacta de esta prueba aún no está verificada con emisiones reales.'
              : 'Estas reglas todavía no están verificadas con emisiones reales y pueden cambiar:'}
          </AppText>
          {pending.map((path) => (
            <View key={path} style={styles.listItem}>
              <AppText tone="warning" aria-hidden>
                △
              </AppText>
              <AppText style={styles.listText} variant="caption" tone="muted">
                {describePendingField(path)}
              </AppText>
            </View>
          ))}
        </Panel>
      ) : null}

      {playable ? (
        <View style={styles.actions}>
          <Button
            testID="play-timed"
            size="lg"
            variant="highlight"
            label={`Jugar con tiempo del programa · ${formatDuration(seconds)}`}
            href={sessionHref('programa')}
          />
          <Button
            testID="play-untimed"
            size="lg"
            variant="secondary"
            label="Practicar sin presión"
            accessibilityHint="Sin reloj. No cuenta para ninguna puntuación"
            href={sessionHref('libre')}
          />
        </View>
      ) : (
        <Panel tone="raised">
          <AppText variant="title" heading>
            En preparación
          </AppText>
          <AppText tone="muted">
            Esta prueba todavía no se puede jugar en esta versión. Aparecerá aquí en cuanto esté
            lista.
          </AppText>
          <Button label="Volver a juegos" href="/juegos" variant="secondary" />
        </Panel>
      )}
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <AppText variant="bodyLarge" tabular>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { gap: spacing.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  list: { gap: spacing.sm },
  listItem: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  listText: { flex: 1 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  fact: {
    flexGrow: 1,
    flexBasis: 160,
    gap: spacing.xs,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  actions: { gap: spacing.md },
});
