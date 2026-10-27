import type { ExpoConfig } from 'expo/config';

/**
 * Configuración de Expo (CLY-014).
 *
 * Los identificadores de bundle/paquete son PROVISIONALES de desarrollo: los definitivos requieren
 * comprobar marcas y reservar IDs (docs/MOBILE_RELEASE.md §2). El nombre no es una marca validada.
 * Aún no hay icono ni splash propios: se añadirán antes de la primera build nativa (EAS).
 */
const config: ExpoConfig = {
  name: 'Proyecto CLY',
  slug: 'proyecto-cly',
  version: '0.1.0',
  scheme: 'cly',
  orientation: 'default',
  userInterfaceStyle: 'dark',
  backgroundColor: '#0A1022',
  ios: {
    bundleIdentifier: 'dev.proyectocly.game',
    supportsTablet: true,
  },
  android: {
    package: 'dev.proyectocly.game',
  },
  web: {
    bundler: 'metro',
    output: 'single',
  },
  plugins: ['expo-router'],
};

export default config;
