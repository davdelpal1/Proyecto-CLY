import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@cly/design-tokens';
import { formatClock } from '../lib/format';
import { AppText } from './AppText';

const URGENT_SECONDS = 10;

interface CountdownProps {
  /** `null` = práctica sin reloj. */
  remainingMs: number | null;
  totalMs: number | null;
}

/**
 * Cronómetro de la prueba. La urgencia (últimos 10 s) se comunica con texto y marca, no solo con
 * color, y se anuncia a lectores de pantalla una única vez (no cada segundo).
 */
export function Countdown({ remainingMs, totalMs }: CountdownProps) {
  const urgent = remainingMs !== null && remainingMs <= URGENT_SECONDS * 1000;
  const finished = remainingMs !== null && remainingMs <= 0;
  const announced = useRef<'none' | 'urgent' | 'done'>('none');

  useEffect(() => {
    if (finished && announced.current !== 'done') {
      announced.current = 'done';
      AccessibilityInfo.announceForAccessibility('Tiempo agotado');
    } else if (urgent && !finished && announced.current === 'none') {
      announced.current = 'urgent';
      AccessibilityInfo.announceForAccessibility(`Quedan ${URGENT_SECONDS} segundos`);
    }
  }, [urgent, finished]);

  if (remainingMs === null || totalMs === null) {
    return (
      <View
        style={styles.box}
        accessible
        accessibilityLabel="Práctica sin reloj"
        testID="countdown"
      >
        <AppText variant="label" tone="muted">
          Sin reloj
        </AppText>
        <AppText variant="title" tone="accent" aria-hidden>
          ∞
        </AppText>
      </View>
    );
  }

  const ratio = Math.min(1, Math.max(0, remainingMs / totalMs));
  const barColor = urgent ? colors.danger : colors.accent;

  return (
    <View
      style={[styles.box, urgent && styles.boxUrgent]}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={
        finished ? 'Tiempo agotado' : `Tiempo restante: ${Math.ceil(remainingMs / 1000)} segundos`
      }
      testID="countdown"
    >
      <AppText variant="label" tone={urgent ? 'danger' : 'muted'}>
        {finished ? 'Tiempo agotado' : urgent ? '¡Últimos segundos!' : 'Tiempo'}
      </AppText>
      <AppText variant="headline" tone={urgent ? 'danger' : 'default'} tabular style={styles.time}>
        {formatClock(remainingMs)}
      </AppText>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minWidth: 112,
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.border,
  },
  boxUrgent: { borderColor: colors.danger },
  time: { fontSize: 34 },
  track: {
    alignSelf: 'stretch',
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill },
});
