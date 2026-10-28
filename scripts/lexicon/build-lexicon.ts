/**
 * Construye el léxico de juego a partir del diccionario RLA-ES (CLY-023, ADR-005).
 *
 *   node scripts/lexicon/build-lexicon.ts [--out .lexicon-build] [--min 2] [--max 10]
 *
 * 1. Verifica las huellas SHA-256 de `third_party/rla-es/` (nada de red: los originales están en el repo).
 * 2. Expande las reglas de afijos de Hunspell a todas las formas.
 * 3. Descarta lo que no es jugable (mayúsculas, guiones, longitud fuera de rango).
 * 4. Asigna a cada palabra el nivel de fiabilidad de su ruta de derivación más fiable.
 * 5. Escribe `es-ES.lexicon.tsv`, `report.json` y `NOTICE.txt`. Es determinista: sin fechas ni azar.
 *
 * Requiere Node ≥ 22.18 (ejecuta TypeScript directamente).
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { IterableHunspellReader } from 'hunspell-reader';
import {
  LEXICON_TIERS,
  classifyDerivation,
  isGameWord,
  moreReliableTier,
  parseAffixKinds,
  tierRank,
} from '../../packages/words-engine/src/lexicon-tiers.ts';
import type { LexiconTier } from '../../packages/words-engine/src/lexicon-tiers.ts';

interface Sources {
  name: string;
  version: string;
  repository: string;
  commit: string;
  retrievedOn: string;
  variant: string;
  licenseChosen: string;
  files: Record<string, string>;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceDir = join(root, 'third_party', 'rla-es');

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const outDir = resolve(root, option('--out') ?? '.lexicon-build');
const minLength = Number(option('--min') ?? 2);
const maxLength = Number(option('--max') ?? 10);
if (
  !Number.isInteger(minLength) ||
  !Number.isInteger(maxLength) ||
  minLength < 1 ||
  maxLength < minLength
) {
  throw new Error(`Rango de longitud inválido: --min ${minLength} --max ${maxLength}`);
}

const sha256 = (data: Buffer | string): string => createHash('sha256').update(data).digest('hex');

// 1. Integridad de los originales ------------------------------------------------------------
const sources = JSON.parse(readFileSync(join(sourceDir, 'SOURCES.json'), 'utf8')) as Sources;
for (const [file, expected] of Object.entries(sources.files)) {
  const actual = sha256(readFileSync(join(sourceDir, file)));
  if (actual !== expected) {
    throw new Error(
      `La huella de ${file} no coincide (esperada ${expected}, actual ${actual}). ` +
        'Los archivos de third_party/rla-es deben permanecer sin modificar (¿conversión de saltos de línea?).',
    );
  }
}

// 2–4. Expansión, filtro y clasificación -----------------------------------------------------
const affPath = join(sourceDir, `${sources.variant}.aff`);
const dicPath = join(sourceDir, `${sources.variant}.dic`);
const kinds = parseAffixKinds(readFileSync(affPath, 'utf8'));
const reader = await IterableHunspellReader.createFromFiles(affPath, dicPath);

const anyLength = { minLength: 1, maxLength: Number.MAX_SAFE_INTEGER };
const range = { minLength, maxLength };
const best = new Map<string, LexiconTier>();
const unknownFlags = new Map<string, number>();
const rejected = { notLetters: 0, outOfLength: 0 };
const seen = new Set<string>();
let rawForms = 0;

for (const entry of reader.seqAffWords()) {
  rawForms++;
  const word = entry.word;
  if (!seen.has(word)) {
    seen.add(word);
    if (!isGameWord(word, anyLength)) rejected.notLetters++;
    else if (!isGameWord(word, range)) rejected.outOfLength++;
  }
  if (!isGameWord(word, range)) continue;

  const { tier, unknownFlags: unknown } = classifyDerivation(entry.rulesApplied, kinds);
  for (const flag of unknown) unknownFlags.set(flag, (unknownFlags.get(flag) ?? 0) + 1);
  best.set(word, moreReliableTier(best.get(word) ?? tier, tier));
}

if (unknownFlags.size > 0) {
  console.error(
    'Flags que no figuran en el .aff (la tabla de clasificación puede estar desactualizada):',
  );
  console.error([...unknownFlags].map(([flag, count]) => `  ${flag} × ${count}`).join('\n'));
  process.exitCode = 1;
}

// 5. Salida ------------------------------------------------------------------------------------
const words = [...best.keys()].sort();
const lexicon = `${words.map((word) => `${word}\t${tierRank(best.get(word) as LexiconTier)}`).join('\n')}\n`;

const byTier = Object.fromEntries(LEXICON_TIERS.map((tier) => [tier, 0])) as Record<
  LexiconTier,
  number
>;
const byLength: Record<number, number> = {};
for (const word of words) {
  byTier[best.get(word) as LexiconTier]++;
  const length = [...word].length;
  byLength[length] = (byLength[length] ?? 0) + 1;
}

/** Tamaño de la lista si se admiten todos los niveles hasta `tier` (solo 5–10 letras: la respuesta mínima). */
const cumulative = LEXICON_TIERS.map((tier) => {
  const subset = words.filter((word) => {
    const length = [...word].length;
    return length >= 5 && length <= 10 && tierRank(best.get(word) as LexiconTier) <= tierRank(tier);
  });
  const raw = Buffer.from(subset.join('\n'), 'utf8');
  return {
    upToTier: tier,
    words: subset.length,
    rawBytes: raw.length,
    gzipBytes: gzipSync(raw).length,
  };
});

const report = {
  source: {
    name: sources.name,
    version: sources.version,
    commit: sources.commit,
    variant: sources.variant,
    licenseChosen: sources.licenseChosen,
    inputSha256: sources.files,
  },
  filter: range,
  counts: {
    rawFormsWithDuplicates: rawForms,
    uniqueForms: seen.size,
    rejectedNotLetters: rejected.notLetters,
    rejectedOutOfLength: rejected.outOfLength,
    kept: words.length,
  },
  byTier,
  byLength,
  cumulativeFor5to10Letters: cumulative,
  output: { file: 'es-ES.lexicon.tsv', bytes: Buffer.byteLength(lexicon), sha256: sha256(lexicon) },
};

const notice = `Léxico de Proyecto CLY — es-ES.lexicon.tsv
=========================================

Este archivo es una OBRA DERIVADA del diccionario ortográfico RLA-ES para español (variante ${sources.variant}),
versión ${sources.version}, de Santiago Bosio y colaboradores:
  ${sources.repository}  (commit ${sources.commit})

Distribuido bajo la licencia ${sources.licenseChosen} (Mozilla Public License 1.1), una de las tres ofrecidas
por sus autores (GPL 3, LGPL 3 o MPL 1.1). Texto de la licencia: third_party/rla-es/MPL-1.1.txt.
Archivos originales, sin modificar: third_party/rla-es/.

MODIFICACIONES (MPL 1.1 §3.3), realizadas el ${sources.retrievedOn} por Proyecto CLY:
  - Se expandieron todas las reglas de afijos del diccionario a formas completas.
  - Se descartaron las formas con mayúsculas (nombres propios y siglas), signos que no son letras y
    las de longitud fuera de ${minLength}–${maxLength} letras.
  - Se añadió a cada palabra el nivel de fiabilidad de su ruta de derivación más fiable
    (${LEXICON_TIERS.map((tier, rank) => `${rank}=${tier}`).join(', ')}).
Fuente de la transformación: scripts/lexicon/build-lexicon.ts y packages/words-engine/src/lexicon-tiers.ts.

Formato: una palabra por línea, "palabra<TAB>nivel", ordenadas.

Este léxico NO es el del Diccionario de la lengua española de la RAE ni el criterio de ningún programa de
televisión: es una lista de formas ortográficamente válidas según RLA-ES. Ver docs/ADR/ADR-005-LEXICO.md.
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'es-ES.lexicon.tsv'), lexicon);
writeFileSync(join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(outDir, 'NOTICE.txt'), notice);

console.log(`Léxico escrito en ${outDir}`);
console.log(
  `  formas en bruto ${rawForms} · únicas ${seen.size} · conservadas ${words.length} (${minLength}–${maxLength} letras)`,
);
console.log(
  `  descartadas: ${rejected.notLetters} no son solo letras minúsculas · ${rejected.outOfLength} fuera de longitud`,
);
console.log('  por nivel:', byTier);
console.log('  acumulado 5–10 letras:');
for (const row of cumulative) {
  console.log(
    `    hasta ${row.upToTier.padEnd(18)} ${String(row.words).padStart(7)} palabras · ` +
      `${(row.rawBytes / 1024).toFixed(0)} KB · gzip ${(row.gzipBytes / 1024).toFixed(0)} KB`,
  );
}
console.log(`  sha256 del léxico: ${report.output.sha256}`);
