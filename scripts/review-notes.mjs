// Review helper for option notes (CLAUDE.md section 3c).
//
// List questions whose wrong-option notes are below the bar, in a compact form to read:
//   node scripts/review-notes.mjs list [--min 45] [--part p1] [--section A] [--limit 20] [--offset 0]
//
// Apply edits written as JSON { "<id>": { "notes": { "<index>": "Sai. ..." }, "options": { "<index>": "..." } } }:
//   node scripts/review-notes.mjs apply edits1.json [edits2.json ...]
// Edits are raw-text replacements inside each question's own block, so file formatting is kept.
// The correct option's note is never touched; a changed correct option must keep its opening words.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { normalizeText } from './text.mjs';

const PARTS = ['p1', 'p2', 'p3'];
const [cmd, ...rest] = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : dflt;
};
const questionFiles = () =>
  PARTS.flatMap((p) => readdirSync(`public/data/${p}`).filter((f) => f.startsWith('questions-')).map((f) => `public/data/${p}/${f}`));

if (cmd === 'list') {
  const min = Number(flag('min', 45));
  const part = flag('part', null);
  const section = flag('section', null);
  const limit = Number(flag('limit', 20));
  const offset = Number(flag('offset', 0));
  const all = questionFiles()
    .filter((f) => !part || f.includes(`/${part}/`))
    .flatMap((f) => JSON.parse(readFileSync(f, 'utf8')))
    .filter((q) => !section || q.section === section);
  const thin = all.filter((q) => (q.optionNotes || []).some((n, i) => i !== q.answer && n.length < min));
  console.log(`${thin.length} questions below ${min} characters; showing ${offset + 1}-${Math.min(offset + limit, thin.length)}\n`);
  for (const q of thin.slice(offset, offset + limit)) {
    console.log(`# ${q.id} [${q.topic} d${q.difficulty}] ${q.stem}`);
    q.options.forEach((o, i) => {
      const weak = i !== q.answer && q.optionNotes[i].length < min;
      console.log(`  ${i === q.answer ? '*' : '-'}${i} ${o}${weak ? `\n      > ${q.optionNotes[i]}` : ''}`);
    });
    console.log(`  E: ${q.explanation.slice(0, 200)}\n`);
  }
} else if (cmd === 'apply') {
  const edits = Object.assign({}, ...rest.map((f) => JSON.parse(readFileSync(f, 'utf8'))));
  const done = new Set();
  for (const file of questionFiles()) {
    let raw = readFileSync(file, 'utf8');
    let changed = false;
    for (const q of JSON.parse(raw)) {
      const e = edits[q.id];
      if (!e) continue;
      const idKey = `"id": ${JSON.stringify(q.id)}`;
      const start = raw.indexOf(idKey);
      if (start < 0 || raw.indexOf(idKey, start + 1) >= 0) throw new Error(`${q.id}: id not found exactly once`);
      const next = raw.indexOf('"id": ', start + idKey.length);
      const end = next < 0 ? raw.length : next;
      let block = raw.slice(start, end);
      const swap = (from, to) => {
        const a = JSON.stringify(from);
        if (block.split(a).length - 1 !== 1) throw new Error(`${q.id}: text not unique in the question: ${from.slice(0, 50)}`);
        block = block.replace(a, JSON.stringify(normalizeText(to)));
      };
      for (const [i, text] of Object.entries(e.options || {})) {
        const k = Number(i);
        if (k === q.answer && !text.startsWith(q.options[k].slice(0, 8))) throw new Error(`${q.id}: refusing to rewrite the correct option`);
        swap(q.options[k], text);
      }
      for (const [i, text] of Object.entries(e.notes || {})) {
        const k = Number(i);
        if (k === q.answer) throw new Error(`${q.id}: refusing to rewrite the correct option's note`);
        if (!text.startsWith('Sai.')) throw new Error(`${q.id}: a wrong-option note must start with "Sai."`);
        swap(q.optionNotes[k], text);
      }
      raw = raw.slice(0, start) + block + raw.slice(end);
      changed = true;
      done.add(q.id);
    }
    if (changed) {
      JSON.parse(raw);
      writeFileSync(file, raw);
    }
  }
  const missing = Object.keys(edits).filter((id) => !done.has(id));
  console.log(`edited ${done.size} questions${missing.length ? `; NOT FOUND: ${missing.join(', ')}` : ''}`);
} else {
  console.error('Usage: node scripts/review-notes.mjs list [--min 45] [--part p1] [--section A] [--limit 20] [--offset 0]\n       node scripts/review-notes.mjs apply edits.json [...]');
  process.exit(1);
}
