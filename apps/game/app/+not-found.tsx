import { Stack } from 'expo-router';
import { MissingScreen } from '../src/components/MissingScreen';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página no encontrada · Proyecto CLY' }} />
      <MissingScreen
        title="Esta pantalla no existe"
        message="Puede que el enlace esté desactualizado."
        backLabel="Ir al inicio"
        backHref="/inicio"
      />
    </>
  );
}
