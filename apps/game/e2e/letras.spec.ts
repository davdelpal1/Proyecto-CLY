import { expect, test } from '@playwright/test';
import { RTVE_2026_REFERENCE } from '@cly/game-engine';
import {
  allWords,
  expectLettersBoardVisible,
  findSeed,
  lettersRoundFor,
  lettersUrl,
  lexicon,
  pickTiles,
  tilesFor,
} from './letters-helpers';

const { minAnswerLength, maxLexiconTier } = RTVE_2026_REFERENCE.letterRules;

// La primera vez que se abre una pantalla de letras, Metro (en frío) tiene que transformar el módulo
// de 5 MB del léxico; con varios navegadores a la vez puede pasar del minuto por defecto.
test.describe.configure({ timeout: 150_000 });

test.describe('La palabra más larga: partida completa en el navegador', () => {
  test('muestra las diez fichas del ejercicio de la semilla', async ({ page }) => {
    const seed = 'e2e-letras-fichas';
    const { puzzle } = lettersRoundFor(seed);
    await page.goto(lettersUrl(seed));
    await expectLettersBoardVisible(page);
    for (const tile of puzzle.tiles) {
      await expect(page.getByTestId(`letter-${tile.id}`)).toHaveText(tile.letter.toUpperCase());
    }
    // La solución no existe en pantalla mientras se juega.
    await expect(page.getByTestId('solution-words')).toHaveCount(0);
    await expect(page.getByTestId('word-count')).toContainText(
      `0 letras · mínimo ${minAnswerLength}`,
    );
  });

  test('forma la palabra más larga con el solver, confirma y recibe resultado óptimo', async ({
    page,
  }) => {
    const seed = 'e2e-letras-mejor';
    const { puzzle, solution } = lettersRoundFor(seed);
    const best = solution.topWords[0];
    if (!best) throw new Error('El ejercicio no tiene solución');

    await page.goto(lettersUrl(seed));
    await expectLettersBoardVisible(page);
    await pickTiles(page, tilesFor(puzzle.tiles, best.key));
    await expect(page.getByTestId('word-count')).toContainText(`${best.key.length} letras`);
    await page.getByTestId('confirm').click();

    await expect(page.getByTestId('result-title')).toHaveText('¡Palabra más larga!');
    await expect(page.getByTestId('score-word')).toContainText(best.word.toUpperCase());
    await expect(page.getByTestId('score-length')).toContainText(String(best.key.length));
    await expect(page.getByTestId('score-best')).toContainText(String(best.key.length));
    await expect(page.getByTestId('solution-words')).toContainText(best.word.toUpperCase());
  });

  test('una palabra válida pero más corta se acepta y se compara con la mejor', async ({
    page,
  }) => {
    const seed = 'e2e-letras-corta';
    const best = lettersRoundFor(seed).solution.bestLength;
    const shorter = allWords(seed).find((w) => w.key.length < best);
    test.skip(!shorter, 'Este ejercicio solo tiene palabras de la longitud máxima');
    if (!shorter) return;

    await page.goto(lettersUrl(seed));
    await expectLettersBoardVisible(page);
    await pickTiles(page, tilesFor(lettersRoundFor(seed).puzzle.tiles, shorter.key));
    await page.getByTestId('confirm').click();

    await expect(page.getByTestId('result-title')).toHaveText('Buena palabra');
    await expect(page.getByTestId('result-detail')).toContainText(`se podía llegar a ${best}`);
    await expect(page.getByTestId('score-word')).toContainText(shorter.word.toUpperCase());
    await expect(page.getByTestId('score-length')).toContainText(String(shorter.key.length));
  });

  test('con menos letras del mínimo no se puede confirmar y se explica cuántas faltan', async ({
    page,
  }) => {
    await page.goto(lettersUrl('e2e-letras-minimo'));
    await expectLettersBoardVisible(page);
    await expect(page.getByTestId('confirm')).toBeDisabled();

    await pickTiles(page, ['l1', 'l2', 'l3']);
    await expect(page.getByTestId('confirm')).toBeDisabled();
    await expect(page.getByTestId('board-message')).toContainText('faltan 2 letras');

    await pickTiles(page, ['l4']);
    await expect(page.getByTestId('board-message')).toContainText('falta 1 letra');

    await pickTiles(page, ['l5']);
    await expect(page.getByTestId('confirm')).toBeEnabled();
  });

  test('una palabra que no está en el diccionario se rechaza sin cerrar la ronda y se puede corregir', async ({
    page,
  }) => {
    const seed = 'e2e-letras-invalida';
    const { puzzle, solution } = lettersRoundFor(seed);
    const letters = puzzle.tiles.map((t) => t.letter);
    const start = [0, 1, 2, 3, 4, 5].find(
      (i) =>
        lexicon.lookup(letters.slice(i, i + minAnswerLength).join(''), maxLexiconTier) === null,
    );
    if (start === undefined) throw new Error('No se encontró una secuencia que no sea palabra');
    const ids = puzzle.tiles.slice(start, start + minAnswerLength).map((t) => t.id);

    await page.goto(lettersUrl(seed));
    await expectLettersBoardVisible(page);
    await pickTiles(page, ids);
    await page.getByTestId('confirm').click();

    await expect(page.getByTestId('board-message')).toContainText('no está en nuestro diccionario');
    await expect(page.getByTestId('result')).toHaveCount(0); // la ronda sigue abierta
    await expect(page.getByTestId('word-count')).toContainText(`${minAnswerLength} letras`);

    await page.getByTestId('clear').click();
    await expect(page.getByTestId('word-count')).toContainText('0 letras');
    const best = solution.topWords[0];
    if (!best) throw new Error('El ejercicio no tiene solución');
    await pickTiles(page, tilesFor(puzzle.tiles, best.key));
    await page.getByTestId('confirm').click();
    await expect(page.getByTestId('result-title')).toHaveText('¡Palabra más larga!');
  });

  test('corregir: tocar una letra de la palabra la quita; Borrar quita la última; Limpiar vacía', async ({
    page,
  }) => {
    await page.goto(lettersUrl('e2e-letras-corregir'));
    await expectLettersBoardVisible(page);
    await pickTiles(page, ['l1', 'l2', 'l3']);
    await expect(page.getByTestId('letter-l2')).toBeDisabled(); // ya está en la palabra
    await expect(page.getByTestId('word-count')).toContainText('3 letras');

    await page.getByTestId('word-1').click(); // quita l2
    await expect(page.getByTestId('word-count')).toContainText('2 letras');
    await expect(page.getByTestId('letter-l2')).toBeEnabled();

    await page.getByTestId('backspace').click(); // quita la última (l3)
    await expect(page.getByTestId('word-count')).toContainText('1 letra ');
    await expect(page.getByTestId('letter-l3')).toBeEnabled();

    await pickTiles(page, ['l4', 'l5']);
    await page.getByTestId('clear').click();
    await expect(page.getByTestId('word-count')).toContainText('0 letras');
    await expect(page.getByTestId('backspace')).toBeDisabled();
  });

  test('mezclar cambia el orden del atril pero no las fichas ni el ejercicio', async ({ page }) => {
    const seed = 'e2e-letras-mezclar';
    const { puzzle } = lettersRoundFor(seed);
    await page.goto(lettersUrl(seed));
    await expectLettersBoardVisible(page);
    await page.getByTestId('shuffle').click();
    for (const tile of puzzle.tiles) {
      await expect(page.getByTestId(`letter-${tile.id}`)).toHaveText(tile.letter.toUpperCase());
    }
    const first = puzzle.tiles[0];
    if (!first) throw new Error('Sin fichas');
    await page.getByTestId(`letter-${first.id}`).click();
    await expect(page.getByTestId('word-0')).toHaveText(first.letter.toUpperCase());
  });

  test('rendirse revela las palabras más largas sin dar por válida ninguna respuesta', async ({
    page,
  }) => {
    const seed = 'e2e-letras-rendirse';
    const best = lettersRoundFor(seed).solution.topWords[0];
    if (!best) throw new Error('El ejercicio no tiene solución');
    await page.goto(lettersUrl(seed));
    await expectLettersBoardVisible(page);
    await page.getByTestId('give-up').click();

    await expect(page.getByTestId('result-title')).toHaveText('Solución revelada');
    await expect(page.getByTestId('score-word')).toContainText('—');
    await expect(page.getByTestId('solution-words')).toContainText(best.word.toUpperCase());
    await expect(page.getByTestId('solution-intro')).toContainText('palabras de 5 letras o más');
  });

  test('Repetir conserva el ejercicio; Siguiente trae uno nuevo; Volver regresa al catálogo', async ({
    page,
  }) => {
    const seed = 'e2e-letras-navegacion';
    const { puzzle } = lettersRoundFor(seed);
    await page.goto(lettersUrl(seed));
    await page.getByTestId('give-up').click();
    await expect(page.getByTestId('result')).toBeVisible();

    await page.getByTestId('repeat').click();
    await expectLettersBoardVisible(page);
    for (const tile of puzzle.tiles) {
      await expect(page.getByTestId(`letter-${tile.id}`)).toHaveText(tile.letter.toUpperCase());
    }
    await expect(page.getByTestId('word-count')).toContainText('0 letras');

    await page.getByTestId('give-up').click();
    await page.getByTestId('next').click();
    await expectLettersBoardVisible(page);
    await expect(page).not.toHaveURL(new RegExp(`semilla=${seed}`));

    await page.getByTestId('give-up').click();
    await page.getByTestId('back-to-games').click();
    await expect(page).toHaveURL(/\/juegos$/);
  });

  test('la práctica sin presión no muestra rival ni marcador de concurso', async ({ page }) => {
    await page.goto(lettersUrl('e2e-letras-sin-reloj', 'libre'));
    await expectLettersBoardVisible(page);
    await expect(page.getByTestId('countdown')).toContainText('Sin reloj');
    await expect(page.getByText(/\b(rival|IA|oponente)\b/i)).toHaveCount(0);
  });
});

test.describe('La palabra más larga: teclado físico', () => {
  test('escribir las letras las coloca; Retroceso borra; Intro confirma', async ({ page }) => {
    // Playwright no genera teclas con ñ: se busca un ejercicio cuya mejor palabra no la lleve.
    const seed = findSeed('e2e-teclado', (r) => !r.solution.topWords[0]?.key.includes('ñ'));
    const best = lettersRoundFor(seed).solution.topWords[0];
    if (!best) throw new Error('El ejercicio no tiene solución');
    const word = best.key;

    await page.goto(lettersUrl(seed));
    await expectLettersBoardVisible(page);
    for (const letter of word) await page.keyboard.press(letter);
    await expect(page.getByTestId('word-count')).toContainText(`${word.length} letras`);

    await page.keyboard.press('Backspace');
    await expect(page.getByTestId('word-count')).toContainText(`${word.length - 1} letras`);
    await page.keyboard.press(word.slice(-1));
    await expect(page.getByTestId('word-count')).toContainText(`${word.length} letras`);

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('word-count')).toContainText('0 letras');
    for (const letter of word) await page.keyboard.press(letter.toUpperCase());
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('result-title')).toHaveText('¡Palabra más larga!');
    await expect(page.getByTestId('score-word')).toContainText(best.word.toUpperCase());
  });

  test('pedir una letra que ya no queda avisa y no cambia la palabra', async ({ page }) => {
    const seed = 'e2e-teclado-sin-ficha';
    const letters = lettersRoundFor(seed).puzzle.tiles.map((t) => t.letter);
    const absent = 'kw'.split('').find((l) => !letters.includes(l)) ?? 'k';
    await page.goto(lettersUrl(seed));
    await expectLettersBoardVisible(page);
    await page.keyboard.press(absent); // k y w no se reparten nunca
    await expect(page.getByTestId('board-message')).toContainText(`«${absent.toUpperCase()}»`);
    await expect(page.getByTestId('word-count')).toContainText('0 letras');
  });
});

test.describe('La palabra más larga: con tiempo del programa', () => {
  test('hay cuenta atrás con las letras ocultas y después reloj de 0:30', async ({ page }) => {
    await page.clock.install();
    await page.goto(lettersUrl('e2e-letras-reloj', 'programa'));

    await expect(page.getByTestId('get-ready')).toBeVisible();
    await expect(page.getByTestId('letter-l1')).toHaveCount(0); // no se pueden leer antes de empezar

    await page.clock.fastForward(3_000);
    await expectLettersBoardVisible(page);
    await expect(page.getByTestId('countdown')).toContainText('0:3');
  });

  test('si se agota el tiempo la ronda se cierra sin palabra y se muestra la solución', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto(lettersUrl('e2e-letras-agotado', 'programa'));
    await expect(page.getByTestId('get-ready')).toBeVisible();
    await page.clock.fastForward(3_000);
    await expectLettersBoardVisible(page);

    await page.clock.fastForward(31_000);
    await expect(page.getByTestId('result-title')).toHaveText('Tiempo agotado');
    await expect(page.getByTestId('result-detail')).toContainText('no cuenta');
    await expect(page.getByTestId('solution-words')).toBeVisible();
  });
});

test.describe('La palabra más larga: ficha, progreso y créditos', () => {
  test('la ficha ya es jugable y avisa de que las reglas son provisionales', async ({ page }) => {
    await page.goto('/juegos/letras');
    await expect(page.getByRole('heading', { name: 'La palabra más larga' }).first()).toBeVisible();
    await expect(page.getByText('Disponible', { exact: true })).toBeVisible();
    await expect(page.getByTestId('play-timed')).toBeVisible();
    await expect(page.getByTestId('play-untimed')).toBeVisible();
    await expect(page.getByText('Reglas provisionales')).toBeVisible();
    await expect(page.getByText(/pronombre pegado/).first()).toBeVisible();
  });

  test('Inicio → Juegos → La palabra más larga → Practicar en 3 interacciones, sin registro', async ({
    page,
  }) => {
    await page.goto('/inicio');
    await page.getByTestId('cta-juegos').click(); // 1
    await page.getByTestId('card-letras').click(); // 2
    await page.getByTestId('play-untimed').click(); // 3
    await expect(page).toHaveURL(/\/sesion\/entrenamiento/);
    await expectLettersBoardVisible(page);
  });

  test('el progreso se guarda por prueba y «Seguir practicando» lleva a la ficha', async ({
    page,
  }) => {
    const seed = 'e2e-letras-progreso';
    const best = lettersRoundFor(seed);
    const top = best.solution.topWords[0];
    if (!top) throw new Error('El ejercicio no tiene solución');

    await page.goto('/juegos/letras');
    await expect(page.getByTestId('progress-empty')).toBeVisible();

    await page.goto(lettersUrl(seed));
    await expectLettersBoardVisible(page);
    await pickTiles(page, tilesFor(best.puzzle.tiles, top.key));
    await page.getByTestId('confirm').click();
    await expect(page.getByTestId('progress-line')).toContainText(
      '1 vez la palabra más larga en 1 jugada',
    );

    await page.goto('/juegos/letras');
    await expect(page.getByTestId('stat-played')).toContainText('1');
    await expect(page.getByTestId('stat-exact')).toContainText('1');
    await expect(page.getByTestId('stat-exact')).toContainText('Palabra más larga');

    // La cifra exacta no se mezcla con las letras.
    await page.goto('/juegos/cifras');
    await expect(page.getByTestId('progress-empty')).toBeVisible();

    await page.goto('/inicio');
    await expect(page.getByTestId('continue-card')).toContainText('La palabra más larga');
    await page.getByTestId('continue-button').click();
    await expect(page).toHaveURL(/\/juegos\/letras$/);
  });

  test('Ajustes muestra la atribución del diccionario y aclara que no es el de la RAE', async ({
    page,
  }) => {
    await page.goto('/ajustes');
    await expect(page.getByTestId('lexicon-credits')).toContainText('RLA-ES');
    await expect(page.getByTestId('lexicon-credits')).toContainText('MPL 1.1');
    await expect(page.getByTestId('lexicon-credits')).toContainText(
      'No es el diccionario de la RAE',
    );
  });
});
