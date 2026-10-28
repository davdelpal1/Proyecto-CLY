import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { planClicks, playSteps, practiceUrl, roundFor } from './helpers';

/** Juega un ejercicio hasta el final: exacto con el solver, o rindiéndose. */
async function playRound(page: Page, seed: string, how: 'exact' | 'giveup'): Promise<void> {
  await page.goto(practiceUrl(seed));
  await page.getByTestId('confirm').waitFor();
  if (how === 'exact') {
    await playSteps(page, planClicks(roundFor(seed).solution.witness));
    await page.getByTestId('confirm').click();
    await expect(page.getByTestId('result-title')).toHaveText('¡Exacto!');
  } else {
    await page.getByTestId('give-up').click();
    await expect(page.getByTestId('result')).toBeVisible();
  }
}

test.describe('Progreso local de entrenamiento', () => {
  test('una persona nueva no ve historial ni «Seguir practicando»', async ({ page }) => {
    await page.goto('/inicio');
    await expect(page.getByTestId('cta-juegos')).toBeVisible();
    await expect(page.getByTestId('continue-card')).toHaveCount(0);

    await page.goto('/juegos/cifras');
    await expect(page.getByTestId('progress-empty')).toBeVisible();
  });

  test('las estadísticas suben, sobreviven a recargar y la racha cuenta exactas seguidas', async ({
    page,
  }) => {
    await playRound(page, 'prog-1', 'exact');
    await expect(page.getByTestId('progress-line')).toContainText('1 exacta en 1 jugada');
    await playRound(page, 'prog-2', 'exact');
    await expect(page.getByTestId('progress-line')).toContainText('Racha: 2 exactas seguidas');

    await page.goto('/juegos/cifras');
    await expect(page.getByTestId('stat-played')).toContainText('2');
    await expect(page.getByTestId('stat-exact')).toContainText('2');
    await expect(page.getByTestId('stat-streak')).toContainText('2');
    await expect(page.getByTestId('stat-fastest')).not.toContainText('—');

    await page.reload();
    await expect(page.getByTestId('stat-played')).toContainText('2');
  });

  test('rendirse cuenta como jugada pero rompe la racha', async ({ page }) => {
    await playRound(page, 'prog-3', 'exact');
    await playRound(page, 'prog-4', 'giveup');
    await page.goto('/juegos/cifras');
    await expect(page.getByTestId('stat-played')).toContainText('2');
    await expect(page.getByTestId('stat-exact')).toContainText('1');
    await playRound(page, 'prog-5', 'exact');
    await expect(page.getByTestId('progress-line')).toContainText('2 exactas en 3 jugadas');
  });

  test('tras jugar, Inicio ofrece seguir practicando y lleva a la ficha', async ({ page }) => {
    await playRound(page, 'prog-6', 'giveup');
    await page.goto('/inicio');
    await expect(page.getByTestId('continue-card')).toContainText('La cifra exacta');
    await expect(page.getByTestId('continue-card')).toContainText('hace un momento');
    await page.getByTestId('continue-button').click();
    await expect(page.getByRole('heading', { name: 'La cifra exacta' }).first()).toBeVisible();
    await expect(page).toHaveURL(/\/juegos\/cifras$/);
  });

  test('datos guardados corruptos no rompen la app: se parte de cero', async ({ page }) => {
    // El script se ejecuta en cada navegación: solo siembra los datos corruptos la primera vez.
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem('cly.progress.v1', '{esto no es json');
      localStorage.setItem('cly.settings.v1', '[1,2,3]');
    });
    await page.goto('/juegos/cifras');
    await expect(page.getByTestId('progress-empty')).toBeVisible();
    await playRound(page, 'prog-7', 'giveup'); // y se puede seguir jugando y guardando
    await page.goto('/juegos/cifras');
    await expect(page.getByTestId('stat-played')).toContainText('1');
  });
});

test.describe('Ajustes', () => {
  test('se llega desde Inicio y la vibración se puede desactivar de forma persistente', async ({
    page,
  }) => {
    await page.goto('/inicio');
    await page.getByTestId('open-settings').click();
    await expect(page.getByRole('heading', { name: 'Ajustes' }).first()).toBeVisible();

    const haptics = page.getByRole('switch', { name: 'Vibración' });
    await expect(haptics).toBeChecked();
    await haptics.click();
    await expect(haptics).not.toBeChecked();

    await page.reload();
    await expect(page.getByRole('switch', { name: 'Vibración' })).not.toBeChecked();
  });

  test('borrar el progreso pide confirmación y se puede cancelar', async ({ page }) => {
    await playRound(page, 'aj-1', 'giveup');
    await page.goto('/ajustes');

    await page.getByTestId('delete-progress').click();
    await page.getByTestId('cancel-delete').click();
    await page.goto('/juegos/cifras');
    await expect(page.getByTestId('stat-played')).toContainText('1'); // nada se borró
  });

  test('borrar el progreso lo elimina por completo, incluido «Seguir practicando»', async ({
    page,
  }) => {
    await playRound(page, 'aj-2', 'exact');
    await page.goto('/ajustes');
    await page.getByTestId('delete-progress').click();
    await page.getByTestId('confirm-delete').click();
    await expect(page.getByTestId('deleted-message')).toBeVisible();

    await page.goto('/juegos/cifras');
    await expect(page.getByTestId('progress-empty')).toBeVisible();
    await page.goto('/inicio');
    await expect(page.getByTestId('cta-juegos')).toBeVisible();
    await expect(page.getByTestId('continue-card')).toHaveCount(0);
  });

  test('el estado del movimiento sigue la preferencia del sistema', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ajustes');
    await expect(page.getByTestId('motion-status')).toContainText('reducir el movimiento');
  });
});
