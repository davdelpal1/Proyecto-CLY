import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { RTVE_2026_REFERENCE, createNumbersRound } from '@cly/game-engine';
import type { ExpressionTree, Operator } from '@cly/numbers-engine';

export interface ClickStep {
  left: string;
  op: Operator;
  right: string;
  resultId: string;
}

/** Traduce el árbol testigo del solver a los pasos que hay que pulsar en la interfaz (orden posfijo). */
export function planClicks(tree: ExpressionTree): ClickStep[] {
  const steps: ClickStep[] = [];
  let counter = 0;
  const walk = (node: ExpressionTree): string => {
    if (node.kind === 'tile') return node.tileId;
    const left = walk(node.left);
    const right = walk(node.right);
    const resultId = `r${++counter}`;
    steps.push({ left, op: node.op, right, resultId });
    return resultId;
  };
  walk(tree);
  return steps;
}

/** El mismo ejercicio que verá la app para esa semilla (el motor es determinista). */
export const roundFor = (seed: string) => createNumbersRound(RTVE_2026_REFERENCE, seed);

export const practiceUrl = (seed: string, clock: 'libre' | 'programa' = 'libre') =>
  `/sesion/entrenamiento?prueba=cifras&reloj=${clock}&semilla=${seed}`;

/** Juega los pasos pulsando fichas y operadores, como lo haría una persona. */
export async function playSteps(page: Page, steps: ClickStep[]): Promise<string> {
  let selected: string | null = null;
  for (const step of steps) {
    if (selected !== step.left) await page.getByTestId(`tile-${step.left}`).click();
    await page.getByTestId(`op-${step.op}`).click();
    await page.getByTestId(`tile-${step.right}`).click();
    selected = step.resultId;
  }
  return selected ?? '';
}

export async function expectBoardVisible(page: Page): Promise<void> {
  await expect(page.getByTestId('target')).toBeVisible();
  await expect(page.getByTestId('confirm')).toBeVisible();
}
