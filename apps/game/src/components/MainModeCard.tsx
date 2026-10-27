import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import type { Href } from 'expo-router';
import { colors, minTouchTarget, radii, shadows, spacing } from '@cly/design-tokens';
import { AppText } from './AppText';
import { GamePressable } from './GamePressable';

interface MainModeCardProps {
  title: string;
  description: string;
  cta: string;
  tone: 'accent' | 'highlight';
  art: ReactNode;
  href: Href;
  testID: string;
  /** Estado real de disponibilidad (p. ej. "En preparación"), si no es plenamente jugable. */
  status?: ReactNode;
}

/** Tarjeta protagonista de la portada (UX_FLOWS.md §3): una por modo, siempre visible y sin login. */
export function MainModeCard({
  title,
  description,
  cta,
  tone,
  art,
  href,
  testID,
  status,
}: MainModeCardProps) {
  const toneColor = tone === 'accent' ? colors.accent : colors.highlight;

  return (
    <Link href={href} asChild>
      <GamePressable
        accessibilityRole="link"
        accessibilityLabel={`${title}. ${description}`}
        testID={testID}
        pressScale={0.98}
        hoverStyle={{ borderColor: colors.focusRing }}
        style={StyleSheet.flatten([styles.card, { borderColor: toneColor }])}
      >
        <View style={styles.top}>
          <View style={styles.art} aria-hidden>
            {art}
          </View>
          <View style={styles.text}>
            <AppText variant="headline" heading style={styles.title}>
              {title}
            </AppText>
            <AppText tone="muted">{description}</AppText>
            {status}
          </View>
        </View>
        <View style={[styles.cta, { backgroundColor: toneColor }]} aria-hidden>
          <AppText
            variant="bodyLarge"
            tone={tone === 'accent' ? 'onAccent' : 'onHighlight'}
            style={styles.ctaLabel}
          >
            {cta} ›
          </AppText>
        </View>
      </GamePressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 280,
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 2,
    backgroundColor: colors.surfaceRaised,
    boxShadow: shadows.card,
    overflow: 'hidden',
  },
  top: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  art: { width: 80, height: 84, alignItems: 'center', justifyContent: 'center' },
  // 24 px evita que «INDIVIDUALES» se parta a mitad de palabra en móviles de 360 px.
  title: { fontSize: 24, lineHeight: 28 },
  text: { flex: 1, gap: spacing.xs },
  cta: {
    minHeight: minTouchTarget + 4,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    alignSelf: 'flex-start',
  },
  ctaLabel: { fontWeight: '800', letterSpacing: 1 },
});
