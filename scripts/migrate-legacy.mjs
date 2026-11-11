// One-off: extract the hand-written content from the legacy single-file app
// and remap it from the 2019 domains (D1..D6) onto the 2025 CIA syllabus.
// Usage: node scripts/migrate-legacy.mjs legacy/cia-part1-legacy.html
import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeText } from './text.mjs';

const src = readFileSync(process.argv[2], 'utf8');

function sliceArray(startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  const end = src.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`marker not found: ${startMarker}`);
  return src.slice(start + startMarker.length - 1, end + 1); // keep [ ... ]
}

const topicsSrc = sliceArray('const CORE_CIA_TOPICS = [', '];\n\n    const buildInitialQuestions');
// The legacy QUESTIONS array starts with 298 template-generated items; drop them.
const questionsSrc = sliceArray('const QUESTIONS = [', '];\n\n    const LOCAL_STORAGE_KEY')
  .replace('...buildInitialQuestions(),', '');

const topics = new Function(`return ${topicsSrc}`)();
const questions = new Function(`return ${questionsSrc}`)();

const ORG_INDEPENDENCE = /độc lập về mặt tổ chức|báo cáo chức năng|báo cáo hành chính|organizational independence|functional/i;

// 2019 domain -> 2025 [part, section]
function remap(domain, text) {
  switch (domain) {
    case 'D1': return ['p1', 'A'];
    case 'D2': return ORG_INDEPENDENCE.test(text) ? ['p1', 'A'] : ['p1', 'B'];
    case 'D3': return ['p1', 'B'];
    case 'D4': return ['p3', 'C']; // QAIP moved to Part 3 in the 2025 syllabus
    case 'D5': return ['p1', 'C'];
    case 'D6': return ['p1', 'D'];
    default: throw new Error(`unknown domain ${domain}`);
  }
}

function refsFrom(text) {
  const refs = new Set();
  for (const m of text.matchAll(/Chuẩn mực(?: GIAS)? (\d{1,2}\.\d{1,2})/g)) refs.add(`GIAS ${m[1]}`);
  for (const m of text.matchAll(/Nguyên tắc (\d{1,2})\b/g)) refs.add(`GIAS Principle ${m[1]}`);
  if (/COSO/.test(text)) refs.add('COSO');
  return [...refs];
}

const counters = {};
const nextId = (part, section) => {
  const key = `${part}-${section}`;
  counters[key] = (counters[key] || 0) + 1;
  return `${part.toUpperCase()}-${section}-L${String(counters[key]).padStart(3, '0')}`;
};

const byPart = { p1: [], p3: [] };
for (const q of questions) {
  const text = `${q.question} ${q.explanation}`;
  const [part, section] = remap(q.domain, text);
  byPart[part].push({
    id: nextId(part, section),
    section,
    difficulty: 2,
    stem: normalizeText(q.question),
    options: q.options.map(normalizeText),
    answer: q.correctAnswer,
    explanation: normalizeText(q.explanation),
    refs: refsFrom(text),
    source: 'legacy',
  });
}

const cardsByPart = { p1: [], p3: [] };
topics.forEach((t, i) => {
  const text = `${t.topic} ${t.rule}`;
  const [part, section] = remap(t.d, text);
  cardsByPart[part].push({
    id: `${part.toUpperCase()}-${section}-K${String(i + 1).padStart(3, '0')}`,
    section,
    title: normalizeText(t.topic),
    rule: normalizeText(t.rule),
    action: normalizeText(t.action),
    violation: normalizeText(t.violation),
    trap: normalizeText(t.trap),
    distinction: normalizeText(t.distinction),
  });
});

for (const part of ['p1', 'p3']) {
  writeFileSync(`legacy/${part}-questions.legacy.json`, JSON.stringify(byPart[part], null, 2) + '\n');
  writeFileSync(`legacy/${part}-study.legacy.json`, JSON.stringify(cardsByPart[part], null, 2) + '\n');
}
console.log({
  topics: topics.length,
  questions: questions.length,
  p1Questions: byPart.p1.length,
  p3Questions: byPart.p3.length,
  p1Cards: cardsByPart.p1.length,
  p3Cards: cardsByPart.p3.length,
  counters,
});
