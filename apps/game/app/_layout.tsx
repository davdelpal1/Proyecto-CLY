import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@cly/design-tokens';
import { useReducedMotion } from '../src/theme/useReducedMotion';

export default function RootLayout() {
  const reducedMotion = useReducedMotion();

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: reducedMotion ? 'none' : 'fade',
        }}
      >
        <Stack.Screen
          name="inicio"
          options={{ title: 'Proyecto CLY · Cifras, palabras y reflejos' }}
        />
        <Stack.Screen
          name="juegos/index"
          options={{ title: 'Juegos individuales · Proyecto CLY' }}
        />
        <Stack.Screen
          name="concurso/index"
          options={{ title: 'Concurso completo · Proyecto CLY' }}
        />
        <Stack.Screen
          name="concurso/contra-ia"
          options={{ title: 'Concurso contra la IA · Proyecto CLY' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
