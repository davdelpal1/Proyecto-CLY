import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, minTouchTarget, radii, spacing } from '@cly/design-tokens';
import { AI_DIFFICULTIES } from '@cly/game-engine';
import type { AiDifficulty } from '@cly/game-engine';
import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { GameHeader } from '../../src/components/GameHeader';
import { Panel } from '../../src/components/Panel';
import { Screen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { StatusBadge } from '../../src/components/StatusBadge';
import { SchedulePreview } from '../../src/features/contest/SchedulePreview';

const MAX_NAME_LENGTH = 20;

/**
 * Configuración del concurso contra la IA (Ruta B de UX_FLOWS.md). La partida aún no existe: estos
 * ajustes viven solo en esta pantalla y no se guardan ni se aplican todavía.
 */
export default function ContraIa() {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<AiDifficulty>('NORMAL');

  return (
    <Screen>
      <GameHeader title="Concurso contra la IA" fallbackHref="/concurso" />

      <Panel>
        <AppText variant="title" heading>
          Tu nombre
        </AppText>
        <TextInput
          accessibilityLabel="Tu nombre"
          value={name}
          onChangeText={setName}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Jugador"
          placeholderTextColor={colors.textSubtle}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          testID="input-name"
          style={styles.input}
        />
        <AppText variant="caption" tone="subtle">
          Máximo {MAX_NAME_LENGTH} caracteres. No necesitas cuenta.
        </AppText>
      </Panel>

      <Panel>
        <AppText variant="title" heading>
          Dificultad de la IA
        </AppText>
        <SegmentedControl
          label="Dificultad de la IA"
          options={AI_DIFFICULTIES}
          value={difficulty}
          onChange={setDifficulty}
        />
      </Panel>

      <SchedulePreview />

      <Panel tone="raised">
        <StatusBadge tone="soon" label="Partida en preparación" />
        <AppText>
          Todavía no se puede empezar el concurso: la IA y las rondas completas se están
          construyendo. Esta configuración no se guarda aún.
        </AppText>
        <View style={styles.actions}>
          <Button
            label="Practicar en Juegos individuales"
            href="/juegos"
            variant="primary"
            testID="go-juegos"
          />
        </View>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 18,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
