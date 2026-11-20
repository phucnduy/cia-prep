// Check a batch of new questions before add-questions.mjs, against the whole bank of that part.
// Rebalances answer positions inside the batch (moves each answer, with its note, to the least
// used position) and writes the batch back. Prints length, alignment and near-duplicate problems.
// Usage: node scripts/batch-check.mjs <part> <batch.json>
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const [part, file] = process.argv.slice(2);
if (!part || !file) {
  console.error('Usage: node scripts/batch-check.mjs <part> <batch.json>');
  process.exit(1);
}
const LENGTH_TELL_RATIO = 1.2;
const SHORT_TELL_RATIO = 0.7;
const SIMILAR_STEM = 0.45;
const ANSWER_OVERLAP = 0.9;

const batch = JSON.parse(readFileSync(file, 'utf8'));
const manifest = JSON.parse(readFileSync(`public/data/${part}/manifest.json`, 'utf8'));
const bank = manifest.sections.flatMap(({ id }) => {
  const f = `public/data/${part}/questions-${id}.json`;
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : [];
});
const batchIds = new Set(batch.map((q) => q.id));
const others = bank.filter((q) => !batchIds.has(q.id));
const tok = (t) => new Set(t.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter((w) => w.length > 2));
const problems = [];

// 1. Balance answer positions toward the positions least used in the part.
const count = [0, 0, 0, 0];
others.forEach((q) => count[q.answer]++);
for (const q of batch) {
  const to = [0, 1, 2, 3].sort((a, b) => count[a] - count[b])[0];
  if (to !== q.answer) {
    const from = q.answer;
    [q.options[from], q.options[to]] = [q.options[to], q.options[from]];
    [q.optionNotes[from], q.optionNotes[to]] = [q.optionNotes[to], q.optionNotes[from]];
    q.answer = to;
  }
  count[q.answer]++;
}

// 2. Per-question checks.
let longest = 0;
for (const q of batch) {
  const L = q.options.map((o) => o.length);
  const c = L[q.answer];
  const md = Math.max(...L.filter((_, i) => i !== q.answer));
  if (c > md) longest++;
  if (c / md > LENGTH_TELL_RATIO) problems.push(`${q.id}: correct option ${(c / md).toFixed(2)}x the longest distractor`);
  if (c / md < SHORT_TELL_RATIO) problems.push(`${q.id}: correct option much shorter (${(c / md).toFixed(2)})`);
  q.optionNotes.forEach((n, i) => {
    if (n.startsWith('Đúng.') !== (i === q.answer)) problems.push(`${q.id}: note ${i} misaligned`);
  });
  if (/GIAS\s*\d|\b\d+\.\d+\b/.test(q.stem)) problems.push(`${q.id}: standard number in stem`);
  if (!q.refs?.length) problems.push(`${q.id}: no refs`);
  if (!q.topic) problems.push(`${q.id}: no topic`);
}

// 3. Giveaways and near-duplicates against the rest of the part and the batch itself.
const all = [...others, ...batch];
const jaccard = (a, b) => {
  let i = 0;
  for (const x of a) if (b.has(x)) i++;
  return i / (a.size + b.size - i);
};
for (const q of batch) {
  const stem = tok(q.stem);
  const ans = tok(q.options[q.answer]);
  for (const o of all) {
    if (o.id === q.id) continue;
    if (jaccard(stem, tok(o.stem)) > SIMILAR_STEM) problems.push(`${q.id}: stem similar to ${o.id}`);
    if (ans.size >= 6) {
      const other = tok(`${o.stem} ${o.options.join(' ')}`);
      let hit = 0;
      for (const w of ans) if (other.has(w)) hit++;
      if (hit / ans.size >= ANSWER_OVERLAP) problems.push(`${q.id}: answer words appear in ${o.id} (${(hit / ans.size).toFixed(2)})`);
    }
  }
}

writeFileSync(file, JSON.stringify(batch, null, 1));
let partLongest = longest;
for (const q of others) {
  const L = q.options.map((o) => o.length);
  if (L[q.answer] > Math.max(...L.filter((_, i) => i !== q.answer))) partLongest++;
}
const n = others.length + batch.length;
const traps = batch.filter((q) => q.trap).length;
console.log(
  `batch ${batch.length}: correct-is-longest ${longest}, hard ${batch.filter((q) => q.difficulty === 3).length}, easy ${batch.filter((q) => q.difficulty === 1).length}, trap ${traps} (${Math.round((100 * traps) / batch.length)}%)`,
);
console.log(`part after add: ${n} questions, correct-is-longest ${((100 * partLongest) / n).toFixed(1)}% (max 40%), positions ${count.join('/')}`);
console.log(problems.length ? problems.join('\n') : 'no problems');
