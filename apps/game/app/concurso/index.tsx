import { StyleSheet, View } from 'react-native';
import { spacing } from '@cly/design-tokens';
import { CONTEST_MODES } from '@cly/game-engine';
import { AppText } from '../../src/components/AppText';
import { GameHeader } from '../../src/components/GameHeader';
import { Panel } from '../../src/components/Panel';
import { Screen } from '../../src/components/Screen';
import { StatusBadge } from '../../src/components/StatusBadge';
import { ContestModeCard } from '../../src/features/contest/ContestModeCard';
import { SchedulePreview } from '../../src/features/contest/SchedulePreview';

export default function Concurso() {
  return (
    <Screen>
      <GameHeader title="Concurso completo" fallbackHref="/inicio" />

      <Panel tone="raised">
        <StatusBadge tone="soon" label="Partida en preparación" />
        <AppText tone="muted">
          Aquí podrás jugar todas las fases seguidas. De momento puedes revisar cómo será y preparar
          la configuración; las pruebas ya disponibles se juegan en Juegos individuales.
        </AppText>
      </Panel>

      <View style={styles.modes}>
        <AppText variant="label" tone="accent" heading>
          ¿Cómo quieres jugar?
        </AppText>
        {CONTEST_MODES.map((mode) => (
          <ContestModeCard key={mode.id} mode={mode} />
        ))}
      </View>

      <SchedulePreview />
    </Screen>
  );
}

const styles = StyleSheet.create({
  modes: { gap: spacing.md },
});
