import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@cly/design-tokens';
import { shuffled } from '@cly/game-engine';
import type { LettersRejectionCode } from '@cly/game-engine';
import { toTileKey } from '@cly/words-engine';
import { uiRandom } from '../../adapters/random-seed';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { LetterSlot, LetterTile } from '../../components/LetterTile';
import { Panel } from '../../components/Panel';
import { ACTIVE_RULESET } from '../../config/ruleset';
import { useFeedback } from '../../state/useFeedback';
import { useBreakpoint } from '../../theme/useBreakpoint';
import { useWebShortcuts } from '../numbers/useWebShortcuts';
import type { ShortcutHandlers } from '../numbers/useWebShortcuts';
import { lettersRejectionMessage } from './messages';
import type { LettersSessionApi } from './useLettersSession';

const MIN_LENGTH = ACTIVE_RULESET.letterRules.minAnswerLength;
const KEYBOARD_LETTERS = 'abcdefghijklmnñopqrstuvwxyzáéíóúü';

const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);

/**
 * Tablero de la palabra más larga: la palabra que se va formando, el atril de diez fichas y las
 * acciones. Toda validación la hace el motor; aquí solo se gestiona la presentación y el orden
 * (puramente visual) de las fichas del atril.
 */
export function LettersBoard({ session }: { session: LettersSessionApi }) {
  const { isPhone } = useBreakpoint();
  const feedback = useFeedback();
  const { state, word } = session;
  const tiles = state.puzzle.tiles;

  // El orden del atril es solo visual: mezclarlo no cambia el ejercicio.
  const [rackOrder, setRackOrder] = useState<readonly string[]>(() => tiles.map((t) => t.id));
  const [error, setError] = useState<string | null>(null);

  const byId = useMemo(() => new Map(tiles.map((t) => [t.id, t])), [tiles]);
  const rack = rackOrder.flatMap((id) => {
    const tile = byId.get(id);
    return tile ? [tile] : [];
  });
  const picked = state.draft;
  const length = picked.length;
  const missing = Math.max(0, MIN_LENGTH - length);

  const fail = (code: LettersRejectionCode) => {
    feedback.warning();
    setError(lettersRejectionMessage(code, MIN_LENGTH));
  };

  const onRackTile = (id: string) => {
    setError(null);
    feedback.tap();
    const code = session.pick(id);
    if (code) fail(code);
  };

  const onPickedTile = (id: string) => {
    setError(null);
    feedback.tap();
    const code = session.unpick(id);
    if (code) fail(code);
  };

  const onBackspace = () => {
    setError(null);
    if (length === 0) return;
    feedback.tap();
    session.unpick();
  };

  const onClear = () => {
    setError(null);
    if (length === 0) return;
    feedback.tap();
    session.clear();
  };

  const onShuffle = () => {
    setError(null);
    feedback.tap();
    setRackOrder(shuffled(rackOrder, uiRandom));
  };

  const onConfirm = () => {
    const code = session.submit();
    if (code) fail(code);
  };

  /** Teclado físico (web): la letra escrita toma la primera ficha libre con esa letra. */
  const onLetterKey = (typed: string) => {
    const letter = toTileKey(typed);
    const free = rack.find((tile) => tile.letter === letter && !picked.includes(tile.id));
    if (free) return onRackTile(free.id);
    setError(`No te quedan fichas «${letter.toUpperCase()}».`);
    feedback.warning();
  };

  const shortcuts: ShortcutHandlers = { Backspace: onBackspace, Escape: onClear, Enter: onConfirm };
  for (const letter of KEYBOARD_LETTERS) {
    shortcuts[letter] = () => onLetterKey(letter);
    shortcuts[letter.toUpperCase()] = () => onLetterKey(letter);
  }
  useWebShortcuts(shortcuts, state.status === 'RUNNING');

  const rackSize = isPhone ? 58 : 64;
  const slotSize = isPhone ? 46 : 56;
  const slots = Math.max(MIN_LENGTH, length);

  const hint =
    length === 0
      ? 'Toca las letras para formar una palabra.'
      : missing > 0
        ? `Te ${plural(missing, 'falta', 'faltan')} ${missing} ${plural(missing, 'letra', 'letras')} para llegar al mínimo.`
        : 'Cuando estés listo, confirma tu palabra.';

  const letterOf = (id: string) => byId.get(id)?.letter ?? '';

  return (
    <View style={[styles.layout, !isPhone && styles.layoutWide]}>
      <View style={styles.main}>
        <Panel tone="accent">
          <AppText variant="label" tone="accent" center>
            Tu palabra
          </AppText>
          <View
            accessible
            accessibilityLabel={
              length === 0
                ? 'Tu palabra: vacía'
                : `Tu palabra: ${word.toUpperCase()}, ${length} letras`
            }
            testID="word"
            style={styles.word}
          >
            {Array.from({ length: slots }, (_, index) => {
              const id = picked[index];
              return id === undefined ? (
                <LetterSlot key={`slot-${index}`} size={slotSize} />
              ) : (
                <LetterTile
                  key={id}
                  testID={`word-${index}`}
                  letter={letterOf(id)}
                  state="picked"
                  size={slotSize}
                  accessibilityLabel={`letra ${letterOf(id).toUpperCase()}, posición ${index + 1}. Toca para quitarla`}
                  onPress={() => onPickedTile(id)}
                />
              );
            })}
          </View>
          <AppText tone="muted" center tabular testID="word-count">
            {length} {plural(length, 'letra', 'letras')} · mínimo {MIN_LENGTH}
          </AppText>
        </Panel>

        <View style={styles.rackBlock}>
          <AppText variant="label" tone="muted" heading>
            Tus letras
          </AppText>
          <View
            style={[styles.rack, { maxWidth: isPhone ? rackSize * 5 + 8 * 4 + 4 : undefined }]}
            accessibilityRole="toolbar"
            accessibilityLabel="Letras disponibles"
          >
            {rack.map((tile) => (
              <LetterTile
                key={tile.id}
                testID={`letter-${tile.id}`}
                letter={tile.letter}
                state={picked.includes(tile.id) ? 'used' : 'available'}
                size={rackSize}
                onPress={() => onRackTile(tile.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Button testID="shuffle" label="Mezclar" variant="secondary" onPress={onShuffle} />
          <Button
            testID="backspace"
            label="Borrar"
            variant="secondary"
            onPress={onBackspace}
            disabled={length === 0}
          />
          <Button
            testID="clear"
            label="Limpiar"
            variant="ghost"
            onPress={onClear}
            disabled={length === 0}
          />
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

        <Button
          testID="confirm"
          label="Confirmar palabra"
          variant="highlight"
          size="lg"
          fullWidth
          onPress={onConfirm}
          disabled={missing > 0}
          accessibilityHint="Cierra la ronda con la palabra formada"
        />
      </View>

      <View style={[styles.side, !isPhone && styles.sideWide]}>
        <Panel>
          <AppText variant="title" heading>
            Cómo puntúa esto
          </AppText>
          <AppText tone="muted">
            Gana la palabra más larga. Si sabes una más larga, pruébala: aquí no puntúa y puedes
            equivocarte sin consecuencias.
          </AppText>
          <AppText variant="caption" tone="subtle">
            Las tildes se ponen solas. La Ñ es una letra distinta de la N.
          </AppText>
        </Panel>
        <Button
          testID="give-up"
          label="Rendirme y ver la solución"
          variant="ghost"
          onPress={() => session.giveUp()}
          accessibilityHint="Termina la ronda sin respuesta y muestra las palabras más largas"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { gap: spacing.xl },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 1, gap: spacing.lg, minWidth: 0 },
  side: { gap: spacing.md },
  sideWide: { width: 300 },
  word: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
  },
  rackBlock: { gap: spacing.sm, alignItems: 'center' },
  rack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingTop: 4,
    alignSelf: 'center',
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  message: { minHeight: 28, justifyContent: 'center' },
});
