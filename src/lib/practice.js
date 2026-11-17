// Pure helpers for practice features: difficulty labels, the practice pool
// filter, live accuracy during a session, the diagnostic quiz band, and the
// term games. No DOM or storage access so they can be unit-tested directly.
import { createRng, shuffle } from './exam.js';

export const DIFFICULTY = {
  1: { label: 'Dễ', tone: 'easy' },
  2: { label: 'Trung bình', tone: 'medium' },
  3: { label: 'Khó', tone: 'hard' },
};

/** Counts per difficulty level: { 1: n, 2: n, 3: n }. */
export function difficultyCounts(questions) {
  const out = { 1: 0, 2: 0, 3: 0 };
  for (const q of questions) if (out[q.difficulty] !== undefined) out[q.difficulty] += 1;
  return out;
}

/** Question ids the learner has actually answered in any saved attempt (blank exam items do not count). */
export function answeredIds(history) {
  const ids = new Set();
  for (const attempt of history) {
    for (const item of attempt.items || []) {
      const given = attempt.answers?.[item.qid];
      if (given !== undefined && given !== null) ids.add(item.qid);
    }
  }
  return ids;
}

export const POOL_FILTERS = [
  ['all', 'Tất cả'],
  ['new', 'Chưa làm'],
  ['wrong', 'Làm sai'],
];

/**
 * Narrow the practice pool. 'new' keeps questions never answered; 'wrong' keeps
 * questions in the wrong-answer book (a later correct answer removes them).
 */
export function filterPool(questions, filter, { history = [], wrong = {} } = {}) {
  if (filter === 'new') {
    const done = answeredIds(history);
    return questions.filter((q) => !done.has(q.id));
  }
  if (filter === 'wrong') return questions.filter((q) => wrong[q.id]);
  return questions;
}

/**
 * Accuracy so far in a practice session, from the questions already checked.
 * Returns sections in manifest order with { id, correct, total }, plus overall totals.
 */
export function liveStats(session, byId, sections) {
  const per = Object.fromEntries(sections.map((s) => [s.id, { id: s.id, correct: 0, total: 0, topics: {} }]));
  let correct = 0;
  let total = 0;
  for (const item of session.items) {
    if (!session.checked?.[item.qid]) continue;
    const q = byId[item.qid];
    if (!q || !per[q.section]) continue;
    const ok = session.answers[item.qid] === q.answer;
    const s = per[q.section];
    const t = (s.topics[q.topic] ||= { id: q.topic, correct: 0, total: 0 });
    s.total += 1;
    t.total += 1;
    total += 1;
    if (ok) {
      s.correct += 1;
      t.correct += 1;
      correct += 1;
    }
  }
  return { correct, total, sections: Object.values(per) };
}

export const DIAGNOSTIC_SIZE = 12;
/** Seconds per question in the diagnostic: the real exam's pace (150 min / 125 questions). */
export const DIAGNOSTIC_SECONDS_PER_QUESTION = 72;
/** Margin below the practice target that still counts as "close". */
const NEAR_MARGIN = 15;

/**
 * Readiness band for a diagnostic score. 12 questions is a small sample, so the
 * band is a rough signal for where to start, never a pass prediction.
 */
export function readinessBand(percent, target) {
  if (percent >= target) {
    return { id: 'ready', label: 'Nền tảng tốt', text: 'Bạn đã nắm khá chắc. Hãy thử đề rút gọn hoặc đề đầy đủ để kiểm tra độ bền.' };
  }
  if (percent >= target - NEAR_MARGIN) {
    return { id: 'near', label: 'Gần đạt', text: 'Bạn đã có nền tảng. Hãy học kỹ các phần yếu bên dưới rồi luyện theo chủ đề.' };
  }
  return { id: 'start', label: 'Nên bắt đầu từ bài học', text: 'Hãy đọc bài học theo thứ tự chủ đề, sau đó luyện mỗi chủ đề vài câu.' };
}

/** Terms from all lessons, deduplicated by English term, tagged with topic and section. */
export function termPool(lessons, manifest) {
  const sectionOf = Object.fromEntries(manifest.sections.flatMap((s) => s.topics.map((t) => [t.id, s.id])));
  const seen = new Set();
  const out = [];
  for (const lesson of lessons) {
    for (const t of lesson.terms || []) {
      const key = t.term.trim().toLowerCase();
      if (!t.def || seen.has(key)) continue;
      seen.add(key);
      out.push({ ...t, topic: lesson.topic, section: sectionOf[lesson.topic] || null });
    }
  }
  return out;
}

/**
 * Rounds for "definition -> term": each round shows one definition and four terms.
 * Distractors come from the same section first, so the choice is not obvious.
 */
export function guessRounds(terms, count, seed) {
  const rng = createRng(seed);
  // A definition that names its own term gives the answer away; never ask it.
  const fair = terms.filter((t) => {
    const def = t.def.toLowerCase();
    return !def.includes(t.term.toLowerCase()) && !(t.vi && def.includes(t.vi.toLowerCase()));
  });
  const picked = shuffle(fair, rng).slice(0, count);
  return picked.map((answer) => {
    const others = terms.filter((t) => t.term !== answer.term);
    const same = shuffle(others.filter((t) => t.section === answer.section), rng);
    const rest = shuffle(others.filter((t) => t.section !== answer.section), rng);
    const distractors = [...same, ...rest].slice(0, 3);
    return { answer, options: shuffle([answer, ...distractors], rng) };
  });
}

/** One matching board: `size` terms, with the Vietnamese names in a separate shuffled order. */
export function matchBoard(terms, size, seed) {
  const rng = createRng(seed);
  const pairs = shuffle(terms, rng).slice(0, size);
  return { left: pairs, right: shuffle(pairs, rng) };
}
