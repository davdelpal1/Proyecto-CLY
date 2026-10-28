import { useState } from 'react';
import { Platform, StyleSheet, Switch, View } from 'react-native';
import { colors, spacing } from '@cly/design-tokens';
import { AppText } from '../src/components/AppText';
import { Button } from '../src/components/Button';
import { GameHeader } from '../src/components/GameHeader';
import { Panel } from '../src/components/Panel';
import { Screen } from '../src/components/Screen';
import { useProgress } from '../src/state/ProgressProvider';
import { useSettings } from '../src/state/SettingsProvider';
import { useReducedMotion } from '../src/theme/useReducedMotion';

/** Ajustes (UX_FLOWS.md §2): vibración, movimiento y datos locales. Sin cuenta, sin servidor. */
export default function Ajustes() {
  const { settings, setHapticsEnabled } = useSettings();
  const { reset } = useProgress();
  const reducedMotion = useReducedMotion();
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const onDelete = async () => {
    await reset();
    setConfirming(false);
    setDeleted(true);
  };

  return (
    <Screen>
      <GameHeader title="Ajustes" fallbackHref="/inicio" />

      <Panel>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <AppText variant="title" heading>
              Vibración
            </AppText>
            <AppText tone="muted">
              {Platform.OS === 'web'
                ? 'Se usa en el móvil al tocar fichas y al terminar una ronda. En el navegador no hace nada.'
                : 'Un toque suave al tocar fichas y al terminar una ronda.'}
            </AppText>
          </View>
          <Switch
            testID="switch-haptics"
            accessibilityLabel="Vibración"
            value={settings.hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.text}
          />
        </View>
        <AppText variant="caption" tone="subtle">
          La información importante nunca depende de la vibración.
        </AppText>
      </Panel>

      <Panel>
        <AppText variant="title" heading>
          Movimiento
        </AppText>
        <AppText tone="muted" testID="motion-status">
          {reducedMotion
            ? 'Tu dispositivo pide reducir el movimiento: las animaciones están desactivadas.'
            : 'Las animaciones siguen el ajuste «Reducir movimiento» de tu dispositivo.'}
        </AppText>
      </Panel>

      <Panel>
        <AppText variant="title" heading>
          Tus datos
        </AppText>
        <AppText tone="muted">
          Tu progreso de entrenamiento se guarda solo en este dispositivo. No hay cuenta ni se envía
          nada a ningún servidor.
        </AppText>
        {confirming ? (
          <View accessibilityLiveRegion="polite" style={styles.confirm}>
            <AppText tone="warning">
              ⚠ Se borrarán tus estadísticas y tu última práctica. No se puede deshacer.
            </AppText>
            <View style={styles.row}>
              <Button
                testID="confirm-delete"
                label="Sí, borrar mi progreso"
                variant="highlight"
                onPress={onDelete}
              />
              <Button
                testID="cancel-delete"
                label="Cancelar"
                variant="secondary"
                onPress={() => setConfirming(false)}
              />
            </View>
          </View>
        ) : (
          <View style={styles.row}>
            <Button
              testID="delete-progress"
              label="Borrar mi progreso"
              variant="secondary"
              onPress={() => {
                setDeleted(false);
                setConfirming(true);
              }}
            />
          </View>
        )}
        {deleted ? (
          <View accessibilityLiveRegion="polite">
            <AppText tone="success" testID="deleted-message">
              ✓ Progreso borrado.
            </AppText>
          </View>
        ) : null}
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  switchText: { flex: 1, gap: spacing.xs },
  confirm: { gap: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
