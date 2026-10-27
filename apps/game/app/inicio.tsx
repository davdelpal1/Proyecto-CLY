import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@cly/design-tokens';
import { AppText } from '../src/components/AppText';
import { FadeIn } from '../src/components/FadeIn';
import { Logo } from '../src/components/Logo';
import { MainModeCard } from '../src/components/MainModeCard';
import { Screen } from '../src/components/Screen';
import { StatusBadge } from '../src/components/StatusBadge';
import { ContestArt, GamesArt } from '../src/features/home/HomeArt';
import { useBreakpoint } from '../src/theme/useBreakpoint';

export default function Inicio() {
  const { isPhone } = useBreakpoint();

  return (
    <Screen>
      <FadeIn>
        <Logo />
      </FadeIn>

      <FadeIn delay={80}>
        <View style={styles.hero}>
          <AppText variant="label" tone="accent">
            Cifras · Palabras · Reflejos
          </AppText>
          <AppText variant="display" heading>
            RETA TU MENTE
          </AppText>
          <AppText variant="bodyLarge" tone="muted">
            Practica cada prueba por separado o enfréntate a la secuencia completa del concurso.
          </AppText>
        </View>
      </FadeIn>

      <View style={[styles.cards, !isPhone && styles.cardsRow]}>
        <FadeIn delay={160} style={styles.cardSlot}>
          <MainModeCard
            testID="cta-juegos"
            title="JUEGOS INDIVIDUALES"
            description="Elige una prueba y practica a tu ritmo, sin rival ni registro."
            cta="JUGAR"
            tone="accent"
            art={<GamesArt />}
            href="/juegos"
          />
        </FadeIn>
        <FadeIn delay={240} style={styles.cardSlot}>
          <MainModeCard
            testID="cta-concurso"
            title="CONCURSO COMPLETO"
            description="La llave, las rondas clásicas, los duelos y la gran final."
            cta="VER CONCURSO"
            tone="highlight"
            art={<ContestArt />}
            href="/concurso"
            status={<StatusBadge tone="soon" label="Partida en preparación" />}
          />
        </FadeIn>
      </View>

      <FadeIn delay={320}>
        <View style={styles.soon} accessibilityRole="list">
          {['Con amigos', 'Estadísticas'].map((label) => (
            <View key={label} style={styles.soonItem} accessibilityRole="listitem" accessible>
              <AppText variant="caption" tone="muted">
                {label}
              </AppText>
              <StatusBadge tone="soon" label="En preparación" />
            </View>
          ))}
        </View>
      </FadeIn>

      <AppText variant="caption" tone="subtle">
        Proyecto CLY · versión de desarrollo 0.1.0. Juego original, sin relación con ningún programa
        de televisión.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm },
  cards: { gap: spacing.lg },
  cardsRow: { flexDirection: 'row', alignItems: 'stretch' },
  cardSlot: { flex: 1 },
  soon: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  soonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
});
