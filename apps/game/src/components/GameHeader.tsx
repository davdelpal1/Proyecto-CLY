import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { colors, minTouchTarget, radii, spacing } from '@cly/design-tokens';
import { AppText } from './AppText';
import { GamePressable } from './GamePressable';

interface GameHeaderProps {
  title: string;
  eyebrow?: string;
  /** Destino si no hay historial al que volver (p. ej. al abrir la URL directamente). */
  fallbackHref: Href;
  right?: ReactNode;
}

/** Cabecera compacta de pantalla: volver, título y un hueco para reloj/estado (UX_FLOWS.md §6). */
export function GameHeader({ title, eyebrow, fallbackHref, right }: GameHeaderProps) {
  const router = useRouter();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace(fallbackHref));

  return (
    <View style={styles.row}>
      <GamePressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={goBack}
        style={styles.back}
        hoverStyle={{ backgroundColor: colors.surfaceOverlay }}
        testID="header-back"
      >
        <AppText variant="title" aria-hidden>
          ←
        </AppText>
      </GamePressable>
      <View style={styles.titles}>
        {eyebrow ? (
          <AppText variant="label" tone="accent" numberOfLines={1}>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant="title" heading numberOfLines={1}>
          {title}
        </AppText>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1, minWidth: 0 },
  right: { alignItems: 'flex-end' },
});
