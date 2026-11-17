// Audit the question bank against the style principles in CLAUDE.md section 2.
// Read-only: prints a report and, with --json <file>, writes the flagged items.
// Heuristics only. Every flag needs a human read before anything is changed.
import { readFileSync, writeFileSync } from 'node:fs';

const THIN_TOPIC = 10;
const THROWAWAY_RATIO = 0.35;
const MIN_ANSWER_FOR_RATIO = 40;
/** Rough target mix (percent) for difficulty 1/2/3, see CLAUDE.md "Difficulty". */
const TARGET_MIX = { 1: 20, 2: 50, 3: 30 };

/** A stem with a set-up sentence before the question is a scenario, whatever its last words are. */
const isScenario = (stem) => stem.trim().split(/(?<=[.:;])\s+/).length >= 2 || stem.length > 160;
/** One short sentence asking for a name, a definition or a listed fact. */
const RECALL = /(gọi là gì|được gọi là|được định nghĩa|thuật ngữ nào|là gì\?$|bao gồm những gì|bao nhiêu)/i;
const isRecall = (stem) => !isScenario(stem) && RECALL.test(stem.trim());
const SEQUENCE = /(đầu tiên|trước tiên|trước hết|bước tiếp theo|bước kế tiếp|ưu tiên làm)/i;
// A numbered standard such as "GIAS 13.6" or "IPPF 2017 1210"; a bare framework year is fine.
const STANDARD_IN_STEM = /(GIAS|Chuẩn mực|Standard)\s*\d{1,2}\.\d|IPPF 2017\s*\d{4}/;

const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const index = JSON.parse(readFileSync('public/data/parts.json', 'utf8'));
const flagged = [];
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

for (const { id: part, path } of index.parts) {
  const dir = `public/${path}`;
  const manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, 'utf8'));
  const questions = manifest.sections.flatMap((s) => {
    try {
      return JSON.parse(readFileSync(`${dir}/questions-${s.id}.json`, 'utf8'));
    } catch {
      return [];
    }
  });
  const n = questions.length;
  const diff = { 1: 0, 2: 0, 3: 0 };
  let recall = 0;
  let scenario = 0;
  let sequence = 0;
  const byTopic = {};

  for (const q of questions) {
    diff[q.difficulty] = (diff[q.difficulty] || 0) + 1;
    byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
    const recallStem = isRecall(q.stem);
    if (recallStem) recall += 1;
    if (isScenario(q.stem)) scenario += 1;
    if (SEQUENCE.test(q.stem)) sequence += 1;

    const flags = [];
    if (STANDARD_IN_STEM.test(q.stem)) flags.push('standard number in stem');
    if (recallStem && q.difficulty === 3) flags.push('recall stem rated hard');
    if (recallStem && q.difficulty === 2) flags.push('recall stem rated medium (easy candidate)');
    const answerLen = q.options[q.answer].length;
    if (answerLen >= MIN_ANSWER_FOR_RATIO) {
      const short = q.options.filter((o, i) => i !== q.answer && o.length < answerLen * THROWAWAY_RATIO);
      if (short.length) flags.push(`possible throwaway distractor (${short.map((o) => `"${o}"`).join(', ')})`);
    }
    if (flags.length) flagged.push({ part, id: q.id, topic: q.topic, difficulty: q.difficulty, flags, stem: q.stem });
  }

  const topics = manifest.sections.flatMap((s) => s.topics.map((t) => t.id));
  const thin = topics.filter((t) => (byTopic[t] || 0) < THIN_TOPIC).map((t) => `${t}:${byTopic[t] || 0}`);

  console.log(`\n${part} - ${n} questions`);
  console.log(
    `  difficulty  easy ${pct(diff[1], n)}% / medium ${pct(diff[2], n)}% / hard ${pct(diff[3], n)}%` +
      `  (target about ${TARGET_MIX[1]}/${TARGET_MIX[2]}/${TARGET_MIX[3]})`,
  );
  console.log(`  stem types  scenario ${pct(scenario, n)}%, recall ${pct(recall, n)}%, sequence ("first/next") ${sequence}`);
  console.log(`  thin topics (< ${THIN_TOPIC})  ${thin.length ? thin.join(' ') : 'none'}`);
  const partFlags = flagged.filter((f) => f.part === part);
  const kinds = {};
  for (const f of partFlags) for (const k of f.flags) kinds[k.replace(/ \(.*$/, '')] = (kinds[k.replace(/ \(.*$/, '')] || 0) + 1;
  console.log(`  flags       ${Object.entries(kinds).map(([k, v]) => `${k}: ${v}`).join('; ') || 'none'}`);
}

if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify(flagged, null, 2));
  console.log(`\n${flagged.length} flagged questions written to ${jsonOut}`);
}
