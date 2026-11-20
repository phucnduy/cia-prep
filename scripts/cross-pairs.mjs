// Lists question pairs (across sections of one part) whose stems or correct answers overlap most.
// Usage: node scripts/cross-pairs.mjs [part] [count]. A high score is a lead to read, not a verdict.
import fs from 'fs';

const PART = process.argv[2] || 'p1';
const TOP = Number(process.argv[3] || 40);
const all = ['A', 'B', 'C', 'D'].flatMap((s) => {
  const f = `public/data/${PART}/questions-${s}.json`;
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
});

const stop = new Set('và của cho là các có không được trong với một những này đó để khi theo nào vì nhất phù hợp kiểm toán nội bộ viên nên gì thế công ty'.split(' '));
const words = (t) => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w && !stop.has(w));
const bigrams = (ws) => new Set(ws.slice(1).map((w, i) => ws[i] + '_' + w));
const jaccard = (a, b) => {
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return n / (a.size + b.size - n || 1);
};

const items = all.map((q) => ({
  q,
  stem: bigrams(words(q.stem)),
  ans: bigrams(words(q.options[q.answer])),
  text: bigrams(words(q.stem + ' ' + q.options.join(' '))),
}));

const pairs = [];
for (let i = 0; i < items.length; i++) {
  for (let j = i + 1; j < items.length; j++) {
    const a = items[i];
    const b = items[j];
    if (a.q.section === b.q.section) continue;
    // Similar stems, similar answers, or one question's answer showing up in the other's text.
    const score = jaccard(a.stem, b.stem) + 2 * jaccard(a.ans, b.ans) + Math.max(jaccard(a.ans, b.text), jaccard(b.ans, a.text));
    pairs.push([score, a.q, b.q]);
  }
}

pairs.sort((x, y) => y[0] - x[0]);
for (const [score, a, b] of pairs.slice(0, TOP)) {
  console.log(`${score.toFixed(3)} ${a.id} | ${b.id}`);
  console.log(`  ${a.stem.slice(0, 110)}\n   => ${a.options[a.answer]}`);
  console.log(`  ${b.stem.slice(0, 110)}\n   => ${b.options[b.answer]}`);
}
