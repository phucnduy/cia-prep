// Append questions from a JSON file into public/data/<part>/questions-<section>.json.
// Normalizes typography, validates the schema and refuses duplicate ids.
// Usage: node scripts/add-questions.mjs <part> <file.json> [--study]
//   --study  treat the file as study cards and append to study.json instead.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { normalizeText } from './text.mjs';
import { questionProblems } from '../src/lib/validate.js';

const [part, file, flag] = process.argv.slice(2);
if (!part || !file) {
  console.error('Usage: node scripts/add-questions.mjs <p1|p2|p3> <file.json> [--study]');
  process.exit(1);
}

const dir = `public/data/${part}`;
const manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, 'utf8'));
const sectionIds = manifest.sections.map((s) => s.id);
const incoming = JSON.parse(readFileSync(file, 'utf8'));
const readJson = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : []);
const writeJson = (path, data) => writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
const deepNormalize = (v) =>
  Array.isArray(v) ? v.map(deepNormalize)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deepNormalize(x)]))
      : normalizeText(v);

if (flag === '--study') {
  const path = `${dir}/study.json`;
  const existing = readJson(path);
  const ids = new Set(existing.map((c) => c.id));
  const added = incoming.map(deepNormalize).filter((c) => {
    if (ids.has(c.id)) return console.warn(`skip duplicate card ${c.id}`), false;
    if (!sectionIds.includes(c.section)) throw new Error(`card ${c.id}: bad section ${c.section}`);
    return true;
  });
  writeJson(path, [...existing, ...added]);
  console.log(`study.json: +${added.length} (total ${existing.length + added.length})`);
  process.exit(0);
}

const existingIds = new Set(sectionIds.flatMap((s) => readJson(`${dir}/questions-${s}.json`).map((q) => q.id)));
const bySection = {};
let failed = 0;
for (const raw of incoming) {
  const q = deepNormalize(raw);
  const problems = questionProblems(q, sectionIds);
  if (existingIds.has(q.id)) problems.push('duplicate id');
  if (problems.length) {
    failed += 1;
    console.error(`x ${q.id || '(no id)'}: ${problems.join('; ')}`);
    continue;
  }
  existingIds.add(q.id);
  (bySection[q.section] ||= []).push({
    id: q.id,
    section: q.section,
    topic: q.topic,
    difficulty: q.difficulty ?? 2,
    stem: q.stem,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    ...(q.optionNotes ? { optionNotes: q.optionNotes } : {}),
    refs: q.refs ?? [],
    source: q.source ?? 'original',
  });
}

for (const [section, list] of Object.entries(bySection)) {
  const path = `${dir}/questions-${section}.json`;
  const merged = [...readJson(path), ...list];
  writeJson(path, merged);
  console.log(`${path}: +${list.length} (total ${merged.length})`);
}
if (failed) {
  console.error(`${failed} question(s) rejected`);
  process.exit(1);
}
