import { expect, test } from '@playwright/test';
import { expectBoardVisible } from './helpers';

test.describe('Inicio y navegación (CLY-017)', () => {
  test('la portada destaca los dos modos sin pedir cuenta', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/inicio$/);
    await expect(page.getByTestId('cta-juegos')).toBeVisible();
    await expect(page.getByTestId('cta-concurso')).toBeVisible();
    await expect(page.getByText('JUEGOS INDIVIDUALES')).toBeVisible();
    await expect(page.getByText('CONCURSO COMPLETO')).toBeVisible();
    await expect(page.getByText(/iniciar sesión|contraseña|crear cuenta/i)).toHaveCount(0);
  });

  test('Inicio → Juegos → Cifras → Jugar en 3 interacciones, sin registro', async ({ page }) => {
    await page.goto('/inicio');
    await page.getByTestId('cta-juegos').click(); // 1
    await page.getByTestId('card-cifras').click(); // 2
    await expect(page.getByRole('heading', { name: 'La cifra exacta' }).first()).toBeVisible();
    await page.getByTestId('play-untimed').click(); // 3
    await expect(page).toHaveURL(/\/sesion\/entrenamiento/);
    await expectBoardVisible(page);
    await expect(page.getByTestId('target')).toBeVisible();
    for (const id of ['n1', 'n2', 'n3', 'n4', 'n5', 'n6']) {
      await expect(page.getByTestId(`tile-${id}`)).toBeVisible();
    }
  });

  test('el catálogo muestra las 13 modalidades y solo la cifra exacta y la palabra más larga son jugables', async ({
    page,
  }) => {
    await page.goto('/juegos');
    const slugs = [
      'cifras',
      'letras',
      'llave',
      '3-en-1',
      'doble-palabra',
      '2-para-2',
      'doble-sentido',
      'calculo',
      'esprint',
      'gran-final',
      'desempate',
      'descifra',
      'palabra-maestra',
    ];
    for (const slug of slugs) await expect(page.getByTestId(`card-${slug}`)).toBeVisible();

    await expect(page.getByText('JUGAR ›')).toHaveCount(2);
    await expect(page.getByText('Disponible', { exact: true })).toHaveCount(2);
    await expect(page.getByText(/En preparación/)).toHaveCount(11);
  });

  test('una prueba en preparación muestra su ficha sin botones de jugar', async ({ page }) => {
    await page.goto('/juegos');
    await page.getByTestId('card-llave').click();
    await expect(page.getByRole('heading', { name: 'La llave' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'En preparación' })).toBeVisible();
    await expect(page.getByTestId('play-timed')).toHaveCount(0);
    await expect(page.getByTestId('play-untimed')).toHaveCount(0);
  });

  test('una URL de sesión de una prueba no disponible no simula jugarla', async ({ page }) => {
    await page.goto('/sesion/entrenamiento?prueba=llave&reloj=libre&semilla=x');
    await expect(page.getByText('Esta prueba aún no se puede jugar')).toBeVisible();
    await expect(page.getByTestId('confirm')).toHaveCount(0);
  });

  test('Inicio → Concurso → Contra la IA muestra la configuración y su estado real', async ({
    page,
  }) => {
    await page.goto('/inicio');
    await page.getByTestId('cta-concurso').click();
    await expect(page.getByRole('heading', { name: 'Concurso completo' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fases del concurso' })).toBeVisible();
    await page.getByTestId('mode-ai').click();

    await expect(
      page.getByRole('heading', { name: 'Concurso contra la IA' }).first(),
    ).toBeVisible();
    await page.getByTestId('input-name').fill('Ada');
    await expect(page.getByTestId('input-name')).toHaveValue('Ada');
    await page.getByTestId('segment-EXPERT').click();
    await expect(page.getByTestId('segment-EXPERT')).toHaveAttribute('aria-checked', 'true');

    // Honestidad: no hay botón que simule empezar una partida que no existe.
    // El Stack mantiene montada (oculta) la pantalla anterior: se filtra por lo visible.
    await expect(
      page.getByText('Partida en preparación').filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /comenzar|empezar|jugar/i })).toHaveCount(0);
  });

  test('las fases del concurso salen del ruleset: llave, 10 clásicas, 4 duelos, desempate y final', async ({
    page,
  }) => {
    await page.goto('/concurso');
    for (const text of ['La llave', '10 rondas clásicas', '4 duelos', 'Desempate', 'Gran final']) {
      await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByTestId('mode-local')).toContainText('En preparación');
    await expect(page.getByTestId('mode-online')).toContainText('En preparación');
  });

  test('una ruta inexistente muestra una pantalla de error con salida', async ({ page }) => {
    await page.goto('/no-existe');
    await expect(page.getByText('Esta pantalla no existe')).toBeVisible();
  });
});
