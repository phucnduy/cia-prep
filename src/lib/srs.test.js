import { describe, expect, test } from 'vitest';
import { buildDeck, dueQueue, INTERVAL_DAYS, NEW_PER_DAY, rateCard } from './srs.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 13, 8);

describe('rateCard', () => {
  test('"good" moves a card up one box and schedules it by that box interval', () => {
    const s = rateCard(undefined, 'good', NOW);
    expect(s.box).toBe(1);
    expect(s.due).toBe(NOW + INTERVAL_DAYS[1] * DAY);
    const s2 = rateCard(s, 'good', s.due);
    expect(s2.box).toBe(2);
    expect(s2.due).toBe(s.due + INTERVAL_DAYS[2] * DAY);
  });

  test('"again" resets the card and brings it back within the session', () => {
    const learned = { box: 4, due: NOW, reviews: 5, lapses: 0 };
    const s = rateCard(learned, 'again', NOW);
    expect(s.box).toBe(0);
    expect(s.due - NOW).toBeLessThan(DAY);
    expect(s.lapses).toBe(1);
  });

  test('"easy" skips a box and "hard" keeps the box with a shorter wait', () => {
    expect(rateCard({ box: 1, due: NOW, reviews: 1, lapses: 0 }, 'easy', NOW).box).toBe(3);
    const hard = rateCard({ box: 3, due: NOW, reviews: 3, lapses: 0 }, 'hard', NOW);
    expect(hard.box).toBe(3);
    expect(hard.due - NOW).toBeLessThan(INTERVAL_DAYS[3] * DAY);
  });

  test('the box never goes past the last interval', () => {
    const top = INTERVAL_DAYS.length - 1;
    expect(rateCard({ box: top, due: NOW, reviews: 9, lapses: 0 }, 'easy', NOW).box).toBe(top);
  });
});

describe('dueQueue', () => {
  const deck = Array.from({ length: 40 }, (_, i) => ({ id: `c${i}` }));

  test('shows due cards first, then a limited number of new cards', () => {
    const state = {
      c0: { box: 2, due: NOW - DAY, reviews: 2, lapses: 0 },
      c1: { box: 2, due: NOW + DAY, reviews: 2, lapses: 0 }, // not due yet
    };
    const q = dueQueue(deck, state, NOW, 0);
    expect(q[0].id).toBe('c0');
    expect(q.some((c) => c.id === 'c1')).toBe(false);
    expect(q.length).toBe(1 + NEW_PER_DAY);
  });

  test('new cards already introduced today count against the daily limit', () => {
    const q = dueQueue(deck, {}, NOW, NEW_PER_DAY - 5);
    expect(q.length).toBe(5);
  });
});

describe('buildDeck', () => {
  test('turns lesson terms, self-checks and knowledge cards into flashcards', () => {
    const lessons = [{ topic: 'A1', terms: [{ term: 'Charter', vi: 'Điều lệ', def: 'Văn bản...' }], checks: [{ q: 'Hỏi?', a: 'Đáp.' }] }];
    const cards = [{ id: 'P1-A-K001', section: 'A', title: 'Tiêu đề', rule: 'Quy tắc', trap: 'Bẫy' }];
    const deck = buildDeck(lessons, cards);
    expect(deck.map((c) => c.kind).sort()).toEqual(['check', 'rule', 'term']);
    expect(new Set(deck.map((c) => c.id)).size).toBe(3);
    expect(deck.every((c) => c.front && c.back)).toBe(true);
  });
});
