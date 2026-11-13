// Adaptive practice ("Luyện điểm yếu"): build a practice set aimed at what the
// learner gets wrong, using only the history stored in the browser.
import { buildItems, createRng, shuffle } from './exam.js';
import { newSeed, startSession, topicStats } from './session.js';
import { keys, load } from './storage.js';
import { WEAK_ACCURACY, WEAK_MIN_ANSWERED } from './progress.js';

/** Share of the set taken from previously missed questions, then from weak topics. */
const MISSED_SHARE = 0.4;
const WEAK_SHARE = 0.4;
/** How many topics to target when no topic is clearly weak yet. */
const FALLBACK_TOPICS = 3;

/**
 * @returns {{ list: object[], reason: { missed: number, weakTopics: string[], focusTopics: string[] } }}
 */
export function weakPractice({ manifest, questions, history, wrong, size, seed }) {
  const rng = createRng(seed);
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
  const stats = topicStats(history, byId);
  const seen = new Set(history.flatMap((a) => (a.items || []).map((it) => it.qid)));
  const topicIds = manifest.sections.flatMap((s) => s.topics.map((t) => t.id));
  const acc = (t) => (stats[t]?.answered ? stats[t].correct / stats[t].answered : null);

  // Weak: enough answers and low accuracy. Otherwise focus on the least practised topics.
  const weakTopics = topicIds
    .filter((t) => (stats[t]?.answered || 0) >= WEAK_MIN_ANSWERED && acc(t) * 100 < WEAK_ACCURACY)
    .sort((a, b) => acc(a) - acc(b));
  const leastPractised = [...topicIds].sort((a, b) => (stats[a]?.answered || 0) - (stats[b]?.answered || 0));
  const focusTopics = weakTopics.length ? weakTopics : leastPractised.slice(0, FALLBACK_TOPICS);

  const picked = [];
  const taken = new Set();
  const take = (list, limit) => {
    for (const q of list) {
      if (picked.length >= limit) break;
      if (taken.has(q.id)) continue;
      taken.add(q.id);
      picked.push(q);
    }
  };
  // Unseen questions first inside each pool, random order otherwise.
  const unseenFirst = (list) => {
    const mixed = shuffle(list, rng);
    return [...mixed.filter((q) => !seen.has(q.id)), ...mixed.filter((q) => seen.has(q.id))];
  };

  const missed = shuffle(Object.keys(wrong).map((id) => byId[id]).filter(Boolean), rng);
  take(missed, Math.round(size * MISSED_SHARE));
  const missedCount = picked.length;
  take(unseenFirst(questions.filter((q) => focusTopics.includes(q.topic))), missedCount + Math.round(size * WEAK_SHARE));
  // Fill the rest from the least practised topics, then from anything left.
  for (const t of leastPractised) take(unseenFirst(questions.filter((q) => q.topic === t)), size);
  take(unseenFirst(questions), size);

  return {
    list: shuffle(picked, rng),
    reason: { missed: missedCount, weakTopics, focusTopics },
  };
}

/** Start a "Luyện điểm yếu" practice session for a part. */
export function startWeakPractice(manifest, data, size = 20) {
  const { list, reason } = weakPractice({
    manifest,
    questions: data.questions,
    history: load(keys.history(manifest.id), []),
    wrong: load(keys.wrong(manifest.id), {}),
    size,
    seed: newSeed(),
  });
  const focus = reason.weakTopics.length ? `chủ đề yếu ${reason.weakTopics.join(', ')}` : `chủ đề ít luyện ${reason.focusTopics.join(', ')}`;
  startSession(manifest, {
    id: `${Date.now()}`,
    mode: 'practice',
    title: `Luyện điểm yếu: ${reason.missed} câu từng sai, ${focus}`,
    items: buildItems(list, newSeed()),
    answers: {},
    flags: {},
    struck: {},
    checked: {},
    current: 0,
    startedAt: Date.now(),
    deadline: null,
  });
}
