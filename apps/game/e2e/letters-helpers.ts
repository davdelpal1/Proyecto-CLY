import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { RTVE_2026_REFERENCE, createLettersRound, solveLetters } from '@cly/game-engine';
import type { LettersTile } from '@cly/game-engine';
import { parseLexicon } from '@cly/words-engine';
import { ES_LEXICON_TEXT } from '@cly/words-engine/data/es-ES';

// Aparte de helpers.ts: parsear el léxico solo cuesta en los specs de letras.
export const lexicon = parseLexicon(ES_LEXICON_TEXT);

/** El mismo ejercicio que verá la app para esa semilla (el motor es determinista). */
export const lettersRoundFor = (seed: string) =>
  createLettersRound(RTVE_2026_REFERENCE, seed, lexicon);

/** Más palabras que las 8 que guarda la solución, para elegir una más corta que la mejor. */
export const allWords = (seed: string) =>
  solveLetters(lettersRoundFor(seed).puzzle, lexicon, RTVE_2026_REFERENCE.letterRules, 5000)
    .topWords;

export const lettersUrl = (seed: string, clock: 'libre' | 'programa' = 'libre') =>
  `/sesion/entrenamiento?prueba=letras&reloj=${clock}&semilla=${seed}`;

/** Fichas, en orden, que forman `key` (la palabra sin tildes), usando cada ficha una sola vez. */
export function tilesFor(tiles: readonly LettersTile[], key: string): string[] {
  const free = [...tiles];
  return [...key].map((letter) => {
    const index = free.findIndex((tile) => tile.letter === letter);
    if (index < 0) throw new Error(`No hay ficha «${letter}» para formar ${key}`);
    return (free.splice(index, 1)[0] as LettersTile).id;
  });
}

/** Forma una palabra pulsando fichas, como lo haría una persona. */
export async function pickTiles(page: Page, ids: readonly string[]): Promise<void> {
  for (const id of ids) await page.getByTestId(`letter-${id}`).click();
}

export async function expectLettersBoardVisible(page: Page): Promise<void> {
  await expect(page.getByTestId('word')).toBeVisible();
  await expect(page.getByTestId('confirm')).toBeVisible();
}

/** Busca una semilla `${prefix}-n` cuyo ejercicio cumpla la condición. */
export function findSeed(
  prefix: string,
  accept: (round: ReturnType<typeof lettersRoundFor>) => boolean,
): string {
  for (let n = 0; n < 200; n++) {
    const seed = `${prefix}-${n}`;
    if (accept(lettersRoundFor(seed))) return seed;
  }
  throw new Error(`Ninguna semilla ${prefix}-n cumple la condición`);
}
