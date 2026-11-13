// Spaced repetition for flashcards (Leitner boxes). Each correct recall moves a
// card to a box with a longer interval; forgetting sends it back to the start.

const DAY = 24 * 60 * 60 * 1000;
/** Days until the next review for each box. Box 0 = new or forgotten. */
export const INTERVAL_DAYS = [0, 1, 3, 7, 16, 35, 80];
/** New cards introduced per day, so reviews never pile up. */
export const NEW_PER_DAY = 20;
/** A forgotten card returns after this delay, within the same study session. */
const RELEARN_MS = 10 * 60 * 1000;

const TOP = INTERVAL_DAYS.length - 1;

/**
 * Next state of a card after a rating.
 * @param {{box:number,due:number,reviews:number,lapses:number}|undefined} state
 * @param {'again'|'hard'|'good'|'easy'} grade
 */
export function rateCard(state, grade, now) {
  const s = state || { box: 0, due: now, reviews: 0, lapses: 0 };
  const base = { reviews: s.reviews + 1, lapses: s.lapses };
  if (grade === 'again') return { ...base, box: 0, due: now + RELEARN_MS, lapses: s.lapses + 1 };
  if (grade === 'hard') {
    const box = Math.max(1, s.box);
    return { ...base, box, due: now + Math.max(1, Math.round(INTERVAL_DAYS[box] / 2)) * DAY };
  }
  const box = Math.min(TOP, s.box + (grade === 'easy' ? 2 : 1));
  return { ...base, box, due: now + INTERVAL_DAYS[box] * DAY };
}

/** Cards to study now: due reviews (oldest first), then new cards up to today's allowance. */
export function dueQueue(deck, states, now, newToday) {
  const due = deck.filter((c) => states[c.id] && states[c.id].due <= now).sort((a, b) => states[a.id].due - states[b.id].due);
  const allowance = Math.max(0, NEW_PER_DAY - newToday);
  const fresh = deck.filter((c) => !states[c.id]).slice(0, allowance);
  return [...due, ...fresh];
}

/** Flashcards from lesson terms, lesson self-checks and knowledge cards. */
export function buildDeck(lessons, cards) {
  const deck = [];
  for (const l of lessons) {
    (l.terms || []).forEach((t, i) =>
      deck.push({ id: `T:${l.topic}:${i}`, kind: 'term', topic: l.topic, front: t.term, back: `${t.vi}. ${t.def}` }),
    );
    (l.checks || []).forEach((c, i) =>
      deck.push({ id: `C:${l.topic}:${i}`, kind: 'check', topic: l.topic, front: c.q, back: c.a }),
    );
  }
  for (const c of cards) {
    const back = [c.rule, c.trap && `Bẫy: ${c.trap}`].filter(Boolean).join('\n');
    if (c.title && back) deck.push({ id: c.id, kind: 'rule', topic: c.section, front: c.title, back });
  }
  return deck;
}
