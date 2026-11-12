// Validate all question/study data. Runs before every build (npm run build).
// Errors fail the build; warnings are printed for authors to review.
import { existsSync, readFileSync } from 'node:fs';
import { questionProblems } from '../src/lib/validate.js';
import { TYPOGRAPHIC } from './text.mjs';

const LENGTH_TELL_RATIO = 1.2;
const MAX_LONGEST_CORRECT_SHARE = 0.4;
const LETTER_REFERENCE =
  /(?:[Pp]hương án|[Đđ]áp án|[Ll]ựa chọn|[Cc]âu)\s+[A-D]\b|[Cc]ả [A-D] và [A-D]\b|[Tt]ất cả các (?:phương án|ý) trên|[Kk]hông có phương án nào/;

const index = JSON.parse(readFileSync('public/data/parts.json', 'utf8'));
const errors = [];
const warnings = [];
const allIds = new Set();
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : []);

for (const { id: part, path } of index.parts) {
  const dir = `public/${path}`;
  const manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, 'utf8'));
  const sectionIds = manifest.sections.map((s) => s.id);
  const weightSum = manifest.sections.reduce((a, s) => a + s.weight, 0);
  if (weightSum !== 100) errors.push(`${part}: section weights sum to ${weightSum}, expected 100`);

  const stems = new Map();
  const positions = [0, 0, 0, 0];
  let total = 0;
  let longestCorrect = 0;
  const missingNotes = [];
  const lines = [];

  for (const section of manifest.sections) {
    const file = `${dir}/questions-${section.id}.json`;
    const list = readJson(file);
    const topicIds = section.topics.map((t) => t.id);
    for (const q of list) {
      const where = `${part}/${q.id ?? '?'}`;
      for (const p of questionProblems(q, sectionIds)) errors.push(`${where}: ${p}`);
      if (q.section !== section.id) errors.push(`${where}: section ${q.section} stored in ${file}`);
      if (allIds.has(q.id)) errors.push(`${where}: duplicate id`);
      allIds.add(q.id);
      if (q.topic && !topicIds.includes(q.topic)) warnings.push(`${where}: unknown topic ${q.topic}`);
      const key = q.stem?.trim().toLowerCase();
      if (stems.has(key)) errors.push(`${where}: same stem as ${stems.get(key)}`);
      stems.set(key, q.id);
      const text = JSON.stringify(q);
      if (TYPOGRAPHIC.test(text)) warnings.push(`${where}: typographic characters (run add-questions to normalize)`);
      // Options are shuffled at display time, so text that names a letter or
      // relies on option order ("cả A và B") is wrong by construction.
      if (!q.optionNotes) missingNotes.push(q.id);
      for (const text of [q.stem, q.explanation, ...(q.options || []), ...(q.optionNotes || [])]) {
        const m = typeof text === 'string' && text.match(LETTER_REFERENCE);
        if (m) errors.push(`${where}: refers to an option by letter or position ("${m[0]}"); options are shuffled`);
      }
      if (Number.isInteger(q.answer)) positions[q.answer] += 1;
      // Length tell: a correct option much longer than every distractor gives the answer away.
      if (Array.isArray(q.options) && Number.isInteger(q.answer)) {
        const lengths = q.options.map((o) => String(o).length);
        const longestDistractor = Math.max(...lengths.filter((_, i) => i !== q.answer));
        if (lengths[q.answer] > longestDistractor) longestCorrect += 1;
        if (lengths[q.answer] > LENGTH_TELL_RATIO * longestDistractor) {
          warnings.push(`${where}: correct option is ${(lengths[q.answer] / longestDistractor).toFixed(1)}x the longest distractor`);
        }
      }
    }
    total += list.length;
    const needed = Math.round((manifest.questionCount * section.weight) / 100);
    lines.push(`  ${section.id} ${String(section.weight).padStart(2)}%  ${String(list.length).padStart(4)} questions  (${needed} per full exam)`);
    if (manifest.status === 'ready' && list.length < needed) {
      errors.push(`${part}: section ${section.id} has ${list.length} questions, a full exam needs ${needed}`);
    }
  }

  // The app shuffles options at runtime; skew here only matters for exported data.
  if (total >= 40) {
    const max = Math.max(...positions);
    if (max / total > 0.4) warnings.push(`${part}: answer positions skewed ${JSON.stringify(positions)}`);
    // By chance the correct option is the longest ~25% of the time.
    const share = longestCorrect / total;
    if (share > MAX_LONGEST_CORRECT_SHARE) {
      errors.push(`${part}: correct option is the longest in ${Math.round(share * 100)}% of questions (max ${MAX_LONGEST_CORRECT_SHARE * 100}%) - "pick the longest" would beat the exam`);
    }
  }

  if (missingNotes.length) {
    warnings.push(`${part}: ${missingNotes.length} question(s) without per-option notes (optionNotes), e.g. ${missingNotes.slice(0, 3).join(', ')}`);
  }

  for (const c of readJson(`${dir}/study.json`)) {
    if (!sectionIds.includes(c.section)) errors.push(`${part}/study ${c.id}: bad section ${c.section}`);
    if (!c.title || !c.rule) errors.push(`${part}/study ${c.id}: missing title or rule`);
  }

  console.log(`${manifest.code} (${manifest.status}) - ${total} questions, answer positions ${JSON.stringify(positions)}`);
  console.log(lines.join('\n'));
}

for (const w of warnings) console.warn(`warn: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`\nOK${warnings.length ? ` with ${warnings.length} warning(s)` : ''}`);
