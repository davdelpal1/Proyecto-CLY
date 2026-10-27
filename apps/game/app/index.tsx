import { Redirect } from 'expo-router';

/** La raíz "/" es la portada `/inicio` definida en UX_FLOWS.md §2. */
export default function Index() {
  return <Redirect href="/inicio" />;
}
