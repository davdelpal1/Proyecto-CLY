import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@cly/design-tokens';
import { buildContestSchedule } from '@cly/game-engine';
import { AppText } from '../../components/AppText';
import { Panel } from '../../components/Panel';
import { ACTIVE_RULESET } from '../../config/ruleset';
import { summarizeSchedule } from './schedule-summary';

/** Secuencia del concurso derivada del ruleset activo (no escrita a mano en la interfaz). */
export function SchedulePreview() {
  const rows = summarizeSchedule(buildContestSchedule(ACTIVE_RULESET));
  return (
    <Panel>
      <AppText variant="title" heading>
        Fases del concurso
      </AppText>
      <View accessibilityRole="list" style={styles.list}>
        {rows.map((row, index) => (
          <View key={row.id} style={styles.row} accessibilityRole="listitem" accessible>
            <View style={styles.index}>
              <AppText variant="label" tone="onAccent" aria-hidden>
                {index + 1}
              </AppText>
            </View>
            <View style={styles.text}>
              <AppText variant="bodyLarge" style={styles.title}>
                {row.title}
              </AppText>
              <AppText variant="caption" tone="muted">
                {row.detail}
              </AppText>
            </View>
          </View>
        ))}
      </View>
      <AppText variant="caption" tone="subtle">
        Basado en el perfil «{ACTIVE_RULESET.rulesetId}» (
        {ACTIVE_RULESET.releaseStatus === 'UNVERIFIED' ? 'sin verificar' : 'verificado'}). El orden
        de las rondas clásicas está pendiente de confirmar.
      </AppText>
    </Panel>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  index: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { fontWeight: '800' },
});
