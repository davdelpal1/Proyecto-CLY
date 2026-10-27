import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, maxContentWidth, spacing } from '@cly/design-tokens';
import { useBreakpoint } from '../theme/useBreakpoint';
import { AppBackground } from './AppBackground';

interface ScreenProps {
  children: ReactNode;
  /** Ancho máximo del contenido; por defecto el de la clase de pantalla. */
  maxWidth?: number;
}

/**
 * Marco común de pantalla: fondo propio, safe areas, scroll y contenido centrado con ancho máximo
 * (móvil, tablet y escritorio comparten la misma composición).
 */
export function Screen({ children, maxWidth }: ScreenProps) {
  const { breakpoint } = useBreakpoint();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <AppBackground />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <View
          style={[
            styles.content,
            {
              maxWidth: maxWidth ?? maxContentWidth[breakpoint],
              paddingHorizontal: breakpoint === 'phone' ? spacing.lg : spacing.xl,
              paddingBottom: spacing.xxl + insets.bottom,
            },
          ]}
        >
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', alignSelf: 'center', paddingTop: spacing.lg, gap: spacing.xl },
});
