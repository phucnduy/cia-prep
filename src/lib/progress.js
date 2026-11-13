// Learner progress, computed from what the browser already stores
// (learned lessons, attempt history, wrong-answer book). No server involved.
import { topicStats } from './session.js';

/** A topic needs this many answered questions before its accuracy counts. */
export const WEAK_MIN_ANSWERED = 5;
/** Below this accuracy (percent) a sufficiently practised topic is "weak". */
export const WEAK_ACCURACY = 70;

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

/**
 * @param {{ manifest: object, questions: object[], history: object[], learned: object,
 *           wrong: object, passPercent: number }} input
 */
export function progressSummary({ manifest, questions, history, learned, wrong, passPercent }) {
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
  const stats = topicStats(history, byId);
  const topicIds = manifest.sections.flatMap((s) => s.topics.map((t) => t.id));

  const topics = topicIds.map((id) => {
    const s = stats[id] || { answered: 0, correct: 0 };
    return { id, answered: s.answered, correct: s.correct, accuracy: pct(s.correct, s.answered), learned: !!learned[id] };
  });
  const weakTopics = topics
    .filter((t) => t.answered >= WEAK_MIN_ANSWERED && t.accuracy < WEAK_ACCURACY)
    .sort((a, b) => a.accuracy - b.accuracy);

  const seenIds = new Set(history.flatMap((a) => (a.items || []).map((it) => it.qid)).filter((id) => byId[id]));
  const fullMocks = history.filter((a) => a.mode === 'exam' && (a.items || []).length === manifest.questionCount);
  const mocks = {
    count: fullMocks.length,
    best: fullMocks.length ? Math.max(...fullMocks.map((a) => a.score.percent)) : null,
    last: fullMocks.length ? fullMocks[fullMocks.length - 1].score.percent : null,
  };

  const learnedDone = topics.filter((t) => t.learned).length;
  const practisedDone = topics.filter((t) => t.answered >= WEAK_MIN_ANSWERED).length;
  const wrongCount = Object.keys(wrong).filter((id) => byId[id]).length;

  // The study path: read, practise every topic, clear the wrong-answer book, pass a full mock.
  const steps = [
    { id: 'read', label: 'Đọc bài học từng chủ đề', done: learnedDone, total: topics.length },
    { id: 'practice', label: `Luyện mỗi chủ đề ít nhất ${WEAK_MIN_ANSWERED} câu`, done: practisedDone, total: topics.length },
    { id: 'review', label: 'Ôn hết các câu đã làm sai', done: wrongCount === 0 && seenIds.size > 0 ? 1 : 0, total: 1, detail: `${wrongCount} câu còn sai` },
    { id: 'mock', label: `Đạt từ ${passPercent}% trong một đề thi thử đầy đủ`, done: mocks.best !== null && mocks.best >= passPercent ? 1 : 0, total: 1 },
  ].map((s) => ({ ...s, complete: s.done >= s.total }));

  return {
    learned: { done: learnedDone, total: topics.length },
    seen: { done: seenIds.size, total: questions.length },
    topics,
    weakTopics,
    wrongCount,
    mocks,
    steps,
    next: steps.find((s) => !s.complete) || null,
  };
}

export const PROGRESS_APP = 'cia-prep';
export const PROGRESS_PREFIX = 'cia:v2:';

/**
 * Validate an exported progress file and return its key/value data.
 * Only keys of this app are accepted, and every value must be a JSON string,
 * so an import can never write arbitrary keys into localStorage.
 */
export function parseProgressFile(text) {
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    throw new Error('Tệp không phải JSON hợp lệ.');
  }
  if (file?.app !== PROGRESS_APP || typeof file.data !== 'object' || file.data === null) {
    throw new Error('Đây không phải tệp tiến độ của CIA Prep.');
  }
  for (const [key, value] of Object.entries(file.data)) {
    if (!key.startsWith(PROGRESS_PREFIX)) throw new Error(`Khóa không hợp lệ trong tệp: ${key}`);
    if (typeof value !== 'string') throw new Error(`Giá trị không hợp lệ cho ${key}`);
    try {
      JSON.parse(value);
    } catch {
      throw new Error(`Dữ liệu bị hỏng ở ${key}`);
    }
  }
  return file.data;
}
