import { expect, test } from '@playwright/test';
import { expectBoardVisible, planClicks, playSteps, practiceUrl, roundFor } from './helpers';

test.describe('La cifra exacta: partida completa en el navegador', () => {
  test('resuelve un ejercicio con el solver, confirma y recibe resultado exacto con solución razonada', async ({
    page,
  }) => {
    const seed = 'e2e-exacto';
    const { puzzle, solution } = roundFor(seed);
    await page.goto(practiceUrl(seed));
    await expectBoardVisible(page);

    // La pantalla muestra el ejercicio determinista de la semilla.
    await expect(page.getByTestId('target')).toContainText(String(puzzle.target));
    for (const tile of puzzle.tiles) {
      await expect(page.getByTestId(`tile-${tile.id}`)).toContainText(String(tile.value));
    }

    const lastId = await playSteps(page, planClicks(solution.witness));
    await expect(page.getByTestId('answer')).toContainText(String(puzzle.target));
    expect(lastId).not.toBe('');

    await page.getByTestId('confirm').click();

    await expect(page.getByTestId('result-title')).toHaveText('¡Exacto!');
    await expect(page.getByTestId('score-target')).toContainText(String(puzzle.target));
    await expect(page.getByTestId('score-value')).toContainText(String(puzzle.target));
    await expect(page.getByTestId('score-distance')).toContainText('0');
    await expect(page.getByTestId('solution-expression')).toBeVisible();
    await expect(page.getByTestId('solution-steps')).toBeVisible();
  });

  test('una aproximación se valida y muestra la distancia al objetivo', async ({ page }) => {
    const seed = 'e2e-cercano';
    const { puzzle } = roundFor(seed);
    await page.goto(practiceUrl(seed));
    await expectBoardVisible(page);

    // Sin operar, la respuesta propuesta es la ficha más cercana al objetivo.
    const closest = puzzle.tiles.reduce((a, b) =>
      Math.abs(b.value - puzzle.target) < Math.abs(a.value - puzzle.target) ? b : a,
    );
    const distance = Math.abs(closest.value - puzzle.target);
    await expect(page.getByTestId('answer')).toContainText(String(closest.value));
    await page.getByTestId('confirm').click();

    await expect(page.getByTestId('result-title')).toHaveText(distance === 0 ? '¡Exacto!' : 'Casi');
    await expect(page.getByTestId('score-distance')).toContainText(String(distance));
  });

  test('corregir: deshacer y reiniciar devuelven las fichas', async ({ page }) => {
    const seed = 'e2e-deshacer';
    const { solution } = roundFor(seed);
    const [first] = planClicks(solution.witness);
    if (!first) throw new Error('El ejercicio no tiene pasos');
    await page.goto(practiceUrl(seed));
    await expectBoardVisible(page);
    await expect(page.getByTestId('steps')).toContainText('Aún no has hecho ninguna operación');

    await playSteps(page, [first]);
    await expect(page.getByTestId('steps')).not.toContainText('Aún no has hecho');
    await expect(page.getByTestId(`tile-${first.resultId}`)).toBeVisible();
    await expect(page.getByTestId(`tile-${first.left}`)).toBeDisabled();

    await page.getByTestId('undo').click();
    await expect(page.getByTestId('steps')).toContainText('Aún no has hecho ninguna operación');
    await expect(page.getByTestId(`tile-${first.left}`)).toBeEnabled();
    await expect(page.getByTestId(`tile-${first.resultId}`)).toHaveCount(0);

    await playSteps(page, [first]);
    await page.getByTestId('reset').click();
    await expect(page.getByTestId('steps')).toContainText('Aún no has hecho ninguna operación');
  });

  test('una operación inválida (división no exacta) se rechaza con un mensaje claro', async ({
    page,
  }) => {
    const seed = 'e2e-division';
    const { puzzle } = roundFor(seed);
    const pair = puzzle.tiles
      .flatMap((a) => puzzle.tiles.map((b) => ({ a, b })))
      .find(({ a, b }) => a.id !== b.id && a.value > b.value && a.value % b.value !== 0);
    test.skip(!pair, 'Este ejercicio no tiene ninguna división no exacta posible');
    if (!pair) return;

    await page.goto(practiceUrl(seed));
    await expectBoardVisible(page);
    await page.getByTestId(`tile-${pair.a.id}`).click();
    await page.getByTestId('op-divide').click();
    await page.getByTestId(`tile-${pair.b.id}`).click();

    await expect(page.getByTestId('board-message')).toContainText('división debe ser exacta');
    await expect(page.getByTestId('steps')).toContainText('Aún no has hecho ninguna operación');
  });

  test('una resta con resultado no positivo se rechaza', async ({ page }) => {
    const seed = 'e2e-resta';
    const { puzzle } = roundFor(seed);
    const pair = puzzle.tiles
      .flatMap((a) => puzzle.tiles.map((b) => ({ a, b })))
      .find(({ a, b }) => a.id !== b.id && a.value < b.value);
    if (!pair) test.skip(true, 'Sin pares con valores distintos');
    if (!pair) return;

    await page.goto(practiceUrl(seed));
    await page.getByTestId(`tile-${pair.a.id}`).click();
    await page.getByTestId('op-subtract').click();
    await page.getByTestId(`tile-${pair.b.id}`).click();
    await expect(page.getByTestId('board-message')).toContainText('mayor que cero');
  });

  test('rendirse revela una solución razonada sin dar por válida ninguna respuesta', async ({
    page,
  }) => {
    await page.goto(practiceUrl('e2e-rendirse'));
    await expectBoardVisible(page);
    // La solución no existe en pantalla mientras se juega.
    await expect(page.getByTestId('solution-steps')).toHaveCount(0);
    await page.getByTestId('give-up').click();

    await expect(page.getByTestId('result-title')).toHaveText('Solución revelada');
    await expect(page.getByTestId('score-value')).toContainText('—');
    await expect(page.getByTestId('solution-expression')).toBeVisible();
  });

  test('Repetir conserva el ejercicio; Siguiente trae uno nuevo; Volver regresa al catálogo', async ({
    page,
  }) => {
    const seed = 'e2e-navegacion';
    const { puzzle } = roundFor(seed);
    await page.goto(practiceUrl(seed));
    await page.getByTestId('give-up').click();
    await expect(page.getByTestId('result')).toBeVisible();

    await page.getByTestId('repeat').click();
    await expectBoardVisible(page);
    await expect(page.getByTestId('target')).toContainText(String(puzzle.target));
    await expect(page.getByTestId('steps')).toContainText('Aún no has hecho ninguna operación');

    await page.getByTestId('give-up').click();
    await page.getByTestId('next').click();
    await expectBoardVisible(page);
    await expect(page).not.toHaveURL(new RegExp(`semilla=${seed}`));

    await page.getByTestId('give-up').click();
    await page.getByTestId('back-to-games').click();
    await expect(page).toHaveURL(/\/juegos$/);
  });

  test('la práctica sin presión no muestra reloj; el marcador nunca incluye rivales', async ({
    page,
  }) => {
    await page.goto(practiceUrl('e2e-sin-reloj', 'libre'));
    await expectBoardVisible(page);
    await expect(page.getByTestId('countdown')).toBeVisible();
    await expect(page.getByTestId('countdown')).toContainText('Sin reloj');
    await expect(page.getByText(/\b(rival|IA|oponente)\b/i)).toHaveCount(0);
  });
});

test.describe('Con tiempo del programa', () => {
  test('hay cuenta atrás con el ejercicio oculto y después reloj de 0:40', async ({ page }) => {
    await page.clock.install();
    await page.goto(practiceUrl('e2e-reloj', 'programa'));

    await expect(page.getByTestId('get-ready')).toBeVisible();
    await expect(page.getByTestId('target')).toHaveCount(0); // no se puede leer antes de empezar

    await page.clock.fastForward(3_000);
    await expectBoardVisible(page);
    await expect(page.getByTestId('countdown')).toContainText('0:4');
  });

  test('si se agota el tiempo la ronda se cierra sin respuesta y se muestra la solución', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto(practiceUrl('e2e-agotado', 'programa'));
    await page.clock.fastForward(3_000);
    await expectBoardVisible(page);

    await page.clock.fastForward(41_000);
    await expect(page.getByTestId('result-title')).toHaveText('Tiempo agotado');
    await expect(page.getByTestId('result-detail')).toContainText('no cuenta');
    await expect(page.getByTestId('solution-expression')).toBeVisible();
  });
});
