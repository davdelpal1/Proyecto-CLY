import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@cly/design-tokens';
import {
  OPERATORS,
  OPERATOR_SYMBOL,
  closestAvailable,
  formatStep,
  nextResultId,
  rational,
} from '@cly/numbers-engine';
import type { Operator, PoolEntry } from '@cly/numbers-engine';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { NumberTile } from '../../components/NumberTile';
import type { TileKind } from '../../components/NumberTile';
import { OperatorButton } from '../../components/OperatorButton';
import { Panel } from '../../components/Panel';
import { StepList } from '../../components/StepList';
import { ACTIVE_RULESET } from '../../config/ruleset';
import { formatDistance } from '../../lib/format';
import { useFeedback } from '../../state/useFeedback';
import { useBreakpoint } from '../../theme/useBreakpoint';
import { REJECTION_MESSAGES } from './messages';
import type { NumbersSessionApi } from './useNumbersSession';
import { useWebShortcuts } from './useWebShortcuts';

const BIG_VALUES = ACTIVE_RULESET.numberTiles.bigValues;
const fmt = rational.formatRational;

const kindOf = (entry: PoolEntry): TileKind =>
  entry.kind === 'result' ? 'result' : BIG_VALUES.includes(entry.value.n) ? 'big' : 'small';

/**
 * Tablero de la cifra exacta: objetivo, fichas, operadores, pasos y confirmación.
 * Flujo: ficha → operación → ficha crea un resultado nuevo (que queda seleccionado para encadenar).
 * Todo cálculo y validación lo hace el motor; aquí solo se gestiona la selección.
 */
export function NumbersBoard({ session }: { session: NumbersSessionApi }) {
  const { isPhone } = useBreakpoint();
  const feedback = useFeedback();
  const { state, entries } = session;
  const target = state.puzzle.target;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedOp, setSelectedOp] = useState<Operator | null>(null);
  const [error, setError] = useState<string | null>(null);

  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);
  const tiles = entries.filter((e) => e.kind === 'tile');
  const results = entries.filter((e) => e.kind === 'result');

  const stepLines = useMemo(
    () =>
      state.steps.flatMap((step) => {
        const left = byId.get(step.left);
        const right = byId.get(step.right);
        const result = byId.get(step.resultId);
        return left && right && result
          ? [
              formatStep({
                left: left.value,
                op: step.op,
                right: right.value,
                result: result.value,
              }),
            ]
          : [];
      }),
    [state.steps, byId],
  );

  const selected = selectedId ? byId.get(selectedId) : undefined;
  const candidate =
    selectedOp === null && selected && !selected.consumed
      ? selected
      : closestAvailable(entries, target);
  const candidateDistance = candidate
    ? Math.abs(candidate.value.n / candidate.value.d - target)
    : null;

  const clearSelection = () => {
    setSelectedId(null);
    setSelectedOp(null);
    setError(null);
  };

  const onTile = (id: string) => {
    setError(null);
    feedback.tap();
    if (selectedId === null) return setSelectedId(id);
    if (selectedOp === null) return setSelectedId(id === selectedId ? null : id);
    if (id === selectedId) return setError('Elige un número distinto del primero.');

    const code = session.applyStep(selectedId, selectedOp, id);
    if (code) {
      feedback.warning();
      return setError(REJECTION_MESSAGES[code]);
    }
    feedback.success();
    // El resultado nuevo queda seleccionado para poder encadenar la siguiente operación.
    setSelectedId(nextResultId(state.steps.length));
    setSelectedOp(null);
  };

  const onOperator = (op: Operator) => {
    setError(null);
    feedback.tap();
    if (selectedId === null) return setError('Elige primero un número.');
    setSelectedOp(selectedOp === op ? null : op);
  };

  const onUndo = () => {
    feedback.tap();
    const code = session.undo();
    clearSelection();
    if (code) setError(REJECTION_MESSAGES[code]);
  };

  const onReset = () => {
    feedback.tap();
    session.reset();
    clearSelection();
  };

  const onConfirm = () => {
    if (!candidate) return;
    const code = session.submit(candidate.id);
    if (code) setError(REJECTION_MESSAGES[code]);
  };

  useWebShortcuts(
    {
      '+': () => onOperator('add'),
      '-': () => onOperator('subtract'),
      '*': () => onOperator('multiply'),
      x: () => onOperator('multiply'),
      '/': () => onOperator('divide'),
      Backspace: onUndo,
      Escape: clearSelection,
      Enter: onConfirm,
    },
    state.status === 'RUNNING',
  );

  const hint =
    selectedId === null
      ? 'Toca un número para empezar.'
      : selectedOp === null
        ? 'Elige una operación.'
        : 'Elige el segundo número.';

  const renderTile = (entry: PoolEntry) => (
    <NumberTile
      key={entry.id}
      testID={`tile-${entry.id}`}
      value={fmt(entry.value)}
      kind={kindOf(entry)}
      state={entry.consumed ? 'consumed' : entry.id === selectedId ? 'selected' : 'available'}
      onPress={() => onTile(entry.id)}
    />
  );

  const hasSteps = state.steps.length > 0;

  return (
    <View style={[styles.layout, !isPhone && styles.layoutWide]}>
      <View style={styles.main}>
        <Panel tone="accent" style={styles.targetPanel}>
          <View accessible accessibilityLabel={`Objetivo: ${target}`} testID="target">
            <AppText variant="label" tone="accent" center>
              Objetivo
            </AppText>
            <AppText tabular center style={styles.target}>
              {target}
            </AppText>
          </View>
        </Panel>

        <View style={styles.tilesBlock}>
          <AppText variant="label" tone="muted" heading>
            Tus números
          </AppText>
          <View style={styles.tiles}>{tiles.map(renderTile)}</View>
          {results.length > 0 ? (
            <>
              <AppText variant="label" tone="muted" heading>
                Resultados
              </AppText>
              <View style={styles.tiles}>{results.map(renderTile)}</View>
            </>
          ) : null}
        </View>

        <View style={styles.ops} accessibilityRole="toolbar" accessibilityLabel="Operaciones">
          {OPERATORS.map((op) => (
            <OperatorButton
              key={op}
              op={op}
              selected={selectedOp === op}
              onPress={() => onOperator(op)}
            />
          ))}
        </View>

        <View style={styles.composer} testID="composer">
          <Slot
            text={selected && !selected.consumed ? fmt(selected.value) : '—'}
            filled={!!selected}
          />
          <Slot
            text={selectedOp ? OPERATOR_SYMBOL[selectedOp] : '?'}
            filled={selectedOp !== null}
          />
          <Slot text="?" filled={false} />
        </View>

        <View
          accessibilityLiveRegion="polite"
          role={error ? 'alert' : undefined}
          style={styles.message}
        >
          <AppText tone={error ? 'danger' : 'muted'} center testID="board-message">
            {error ? `⚠ ${error}` : hint}
          </AppText>
        </View>

        <Panel tone="raised">
          <View
            accessible
            accessibilityLabel={
              candidate && candidateDistance !== null
                ? `Tu respuesta: ${fmt(candidate.value)}, ${formatDistance(candidateDistance)}`
                : 'Sin respuesta'
            }
            testID="answer"
          >
            <AppText variant="label" tone="muted">
              Tu respuesta
            </AppText>
            <View style={styles.answerRow}>
              <AppText variant="headline" tabular>
                {candidate ? fmt(candidate.value) : '—'}
              </AppText>
              {candidateDistance !== null ? (
                <AppText tone={candidateDistance === 0 ? 'success' : 'muted'}>
                  {candidateDistance === 0 ? '✓ ' : ''}
                  {formatDistance(candidateDistance)}
                </AppText>
              ) : null}
            </View>
          </View>
          <Button
            testID="confirm"
            label="Confirmar solución"
            variant="highlight"
            size="lg"
            fullWidth
            onPress={onConfirm}
            disabled={!candidate}
            accessibilityHint="Cierra la ronda con la respuesta mostrada"
          />
        </Panel>
      </View>

      <View style={[styles.side, !isPhone && styles.sideWide]}>
        <Panel>
          <AppText variant="title" heading>
            Tus pasos
          </AppText>
          <StepList
            steps={stepLines}
            emptyText="Aún no has hecho ninguna operación."
            testID="steps"
          />
          <View style={styles.row}>
            <Button
              testID="undo"
              label="Deshacer"
              variant="secondary"
              onPress={onUndo}
              disabled={!hasSteps}
            />
            <Button
              testID="reset"
              label="Reiniciar"
              variant="ghost"
              onPress={onReset}
              disabled={!hasSteps}
            />
          </View>
        </Panel>
        <Button
          testID="give-up"
          label="Rendirme y ver la solución"
          variant="ghost"
          onPress={() => session.giveUp()}
          accessibilityHint="Termina la ronda sin respuesta y muestra una solución"
        />
      </View>
    </View>
  );
}

function Slot({ text, filled }: { text: string; filled: boolean }) {
  return (
    <View style={[styles.slot, filled && styles.slotFilled]} aria-hidden>
      <AppText variant="title" tabular tone={filled ? 'default' : 'subtle'}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { gap: spacing.xl },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 1, gap: spacing.lg, minWidth: 0 },
  side: { gap: spacing.md },
  sideWide: { width: 300 },
  targetPanel: { paddingVertical: spacing.md },
  target: { fontSize: 72, fontWeight: '800', lineHeight: 80 },
  tilesBlock: { gap: spacing.sm },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingTop: 6,
  },
  ops: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  composer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slot: {
    minWidth: 64,
    height: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: colors.accent,
    backgroundColor: colors.surfaceRaised,
  },
  message: { minHeight: 28, justifyContent: 'center' },
  answerRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md, flexWrap: 'wrap' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
