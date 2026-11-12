// Starting a session (exam or practice). Shared by the overview and study pages.
import { keys, load, save } from './storage.js';

export function newSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}

export function startSession(manifest, session) {
  // Exams and practice share one resumable slot per part; never drop one silently.
  const existing = load(keys.activeSession(manifest.id), null);
  if (existing && !window.confirm(`Bạn đang có bài làm dở: "${existing.title}". Bắt đầu bài mới sẽ xóa bài đó. Tiếp tục?`)) {
    return;
  }
  save(keys.activeSession(manifest.id), session);
  window.location.hash = `#/${manifest.id}/session`;
}

export function practiceSession(title, items) {
  return {
    id: `${Date.now()}`,
    mode: 'practice',
    title,
    items,
    answers: {},
    flags: {},
    struck: {},
    checked: {},
    current: 0,
    startedAt: Date.now(),
    deadline: null,
  };
}

/** Per-topic totals over every saved attempt: { [topic]: { answered, correct } }. */
export function topicStats(history, byId) {
  const stats = {};
  for (const attempt of history) {
    for (const item of attempt.items) {
      const q = byId[item.qid];
      const given = attempt.answers[item.qid];
      if (!q?.topic || given === undefined || given === null) continue;
      const s = (stats[q.topic] ||= { answered: 0, correct: 0 });
      s.answered += 1;
      if (given === q.answer) s.correct += 1;
    }
  }
  return stats;
}
