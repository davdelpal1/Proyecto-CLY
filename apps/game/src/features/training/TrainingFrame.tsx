import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@cly/design-tokens';
import { AppText } from '../../components/AppText';
import { GameHeader } from '../../components/GameHeader';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';

interface TrainingFrameProps {
  title: string;
  /** Normalmente el cronómetro, mientras la ronda corre. */
  right?: ReactNode;
  children: ReactNode;
}

/**
 * Marco común de una prueba suelta (ARCHITECTURE.md §3.1): cabecera, avisos de práctica y contenido.
 * Sin rival ni marcador de concurso. Cada prueba aporta su tablero y su panel de resultado.
 */
export function TrainingFrame({ title, right, children }: TrainingFrameProps) {
  return (
    <Screen>
      <GameHeader title={title} eyebrow="Práctica" fallbackHref="/juegos" right={right ?? null} />
      {children}
      <StatusBadge tone="provisional" label="Práctica: no puntúa ni cuenta para ningún ranking" />
    </Screen>
  );
}

/** Pantalla "Prepárate" de la cuenta atrás. */
export function GetReady({ count, message }: { count: number; message: string }) {
  return (
    <View style={styles.getReady} accessibilityLiveRegion="polite" testID="get-ready">
      <AppText variant="label" tone="accent" center>
        Prepárate
      </AppText>
      <AppText center tabular style={styles.bigCount}>
        {count}
      </AppText>
      <AppText tone="muted" center>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  getReady: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxxl },
  bigCount: { fontSize: 120, fontWeight: '800', lineHeight: 130 },
});
