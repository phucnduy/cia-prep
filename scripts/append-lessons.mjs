// Append `details` blocks and `traps` to lessons without replacing existing content.
// Usage: node scripts/append-lessons.mjs <part> <file.json>
// Skips a block whose heading already exists, so re-running is safe.
import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeText } from './text.mjs';

const [part, file] = process.argv.slice(2);
const path = `public/data/${part}/lessons.json`;
const lessons = JSON.parse(readFileSync(path, 'utf8'));
const norm = (v) => (Array.isArray(v) ? v.map(norm) : v && typeof v === 'object'
  ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, norm(x)])) : normalizeText(v));
let added = 0;
for (const add of norm(JSON.parse(readFileSync(file, 'utf8')))) {
  const lesson = lessons.find((l) => l.topic === add.topic);
  if (!lesson) throw new Error(`unknown topic ${add.topic}`);
  for (const d of add.details || []) {
    if ((lesson.details ||= []).some((x) => x.heading === d.heading)) continue;
    lesson.details.push(d);
    added += 1;
  }
  for (const t of add.traps || []) if (!(lesson.traps ||= []).includes(t)) lesson.traps.push(t);
}
writeFileSync(path, JSON.stringify(lessons, null, 2) + '\n');
console.log(`${path}: ${added} detail block(s) appended`);
