import type { Href } from 'expo-router';
import { AppText } from './AppText';
import { Button } from './Button';
import { Panel } from './Panel';
import { Screen } from './Screen';

interface MissingScreenProps {
  title: string;
  message: string;
  backLabel: string;
  backHref: Href;
}

/** Pantalla de "no encontrado" coherente con el resto de la app (enlaces rotos, URLs obsoletas). */
export function MissingScreen({ title, message, backLabel, backHref }: MissingScreenProps) {
  return (
    <Screen>
      <Panel>
        <AppText variant="headline" heading>
          {title}
        </AppText>
        <AppText tone="muted">{message}</AppText>
        <Button label={backLabel} href={backHref} variant="secondary" />
      </Panel>
    </Screen>
  );
}
