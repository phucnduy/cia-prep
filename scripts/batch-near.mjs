// For each question in a batch file, list the existing questions of the same part that are most similar
// (stem, correct answer, or one's correct answer appearing in the other's text). A lead to read, not a verdict.
// Usage: node scripts/batch-near.mjs <part> <batch.json> [top=3]
import fs from 'fs';

const [part, file, topArg] = process.argv.slice(2);
if (!part || !file) {
  console.error('Usage: node scripts/batch-near.mjs <part> <batch.json> [top]');
  process.exit(1);
}
const TOP = Number(topArg || 3);
const existing = ['A', 'B', 'C', 'D'].flatMap((s) => {
  const f = `public/data/${part}/questions-${s}.json`;
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
});
const batch = JSON.parse(fs.readFileSync(file, 'utf8'));

const stop = new Set('và của cho là các có không được trong với một những này đó để khi theo nào vì nhất phù hợp kiểm toán nội bộ viên nên gì thế công ty cae hđqt ban điều hành'.split(' '));
const words = (t) => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w && !stop.has(w));
const bigrams = (ws) => new Set(ws.slice(1).map((w, i) => ws[i] + '_' + w));
const jaccard = (a, b) => {
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return n / (a.size + b.size - n || 1);
};
const prep = (q) => ({
  q,
  stem: bigrams(words(q.stem)),
  ans: bigrams(words(q.options[q.answer])),
  text: bigrams(words(q.stem + ' ' + q.options.join(' '))),
});

const ex = existing.filter((q) => !batch.some((b) => b.id === q.id)).map(prep);
for (const b of batch.map(prep)) {
  const scored = ex
    .map((e) => [jaccard(b.stem, e.stem) + 2 * jaccard(b.ans, e.ans) + Math.max(jaccard(b.ans, e.text), jaccard(e.ans, b.text)), e.q])
    .sort((x, y) => y[0] - x[0])
    .slice(0, TOP);
  console.log(`${b.q.id}  => ${b.q.options[b.q.answer]}`);
  for (const [s, q] of scored) console.log(`   ${s.toFixed(2)} ${q.id}  => ${q.options[q.answer]}`);
}
