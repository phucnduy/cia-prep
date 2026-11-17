import { describe, expect, test } from 'vitest';
import {
  answeredIds,
  difficultyCounts,
  filterPool,
  guessRounds,
  liveStats,
  matchBoard,
  readinessBand,
  termPool,
} from './practice.js';

const Q = [
  { id: 'q1', section: 'A', topic: 'A1', answer: 0, difficulty: 1 },
  { id: 'q2', section: 'A', topic: 'A2', answer: 1, difficulty: 2 },
  { id: 'q3', section: 'B', topic: 'B1', answer: 2, difficulty: 3 },
  { id: 'q4', section: 'B', topic: 'B1', answer: 3, difficulty: 3 },
];
const byId = Object.fromEntries(Q.map((q) => [q.id, q]));
const SECTIONS = [{ id: 'A' }, { id: 'B' }];

describe('difficultyCounts', () => {
  test('counts each level and ignores missing values', () => {
    expect(difficultyCounts([...Q, { id: 'x' }])).toEqual({ 1: 1, 2: 1, 3: 2 });
  });
});

describe('answeredIds and filterPool', () => {
  const history = [
    { items: [{ qid: 'q1' }, { qid: 'q2' }], answers: { q1: 0, q2: null } },
    { items: [{ qid: 'q3' }], answers: {} },
  ];

  test('an item left blank in an exam does not count as answered', () => {
    expect([...answeredIds(history)]).toEqual(['q1']);
  });

  test("'new' keeps never-answered questions", () => {
    expect(filterPool(Q, 'new', { history }).map((q) => q.id)).toEqual(['q2', 'q3', 'q4']);
  });

  test("'wrong' keeps questions in the wrong-answer book", () => {
    expect(filterPool(Q, 'wrong', { wrong: { q4: 2 } }).map((q) => q.id)).toEqual(['q4']);
  });

  test("'all' returns the whole bank", () => {
    expect(filterPool(Q, 'all')).toHaveLength(4);
  });
});

describe('liveStats', () => {
  test('counts only checked questions, per section and topic', () => {
    const session = {
      items: Q.map((q) => ({ qid: q.id })),
      answers: { q1: 0, q2: 0, q3: 2, q4: 0 },
      checked: { q1: true, q2: true, q3: true },
    };
    const s = liveStats(session, byId, SECTIONS);
    expect(s.total).toBe(3);
    expect(s.correct).toBe(2);
    expect(s.sections[0]).toMatchObject({ id: 'A', correct: 1, total: 2 });
    expect(s.sections[1]).toMatchObject({ id: 'B', correct: 1, total: 1 });
    expect(s.sections[1].topics.B1).toEqual({ id: 'B1', correct: 1, total: 1 });
  });
});

describe('readinessBand', () => {
  test('bands against the practice target', () => {
    expect(readinessBand(80, 75).id).toBe('ready');
    expect(readinessBand(65, 75).id).toBe('near');
    expect(readinessBand(40, 75).id).toBe('start');
  });
});

describe('term games', () => {
  const manifest = { sections: [{ id: 'A', topics: [{ id: 'A1' }] }, { id: 'B', topics: [{ id: 'B1' }] }] };
  const lessons = [
    { topic: 'A1', terms: [{ term: 'T1', vi: 'v1', def: 'd1' }, { term: 'T2', vi: 'v2', def: 'd2' }, { term: 'T3', vi: 'v3', def: 'd3' }] },
    { topic: 'B1', terms: [{ term: 't1', vi: 'dup', def: 'dup' }, { term: 'T4', vi: 'v4', def: 'd4' }, { term: 'T5', vi: 'v5', def: 'd5' }] },
  ];
  const pool = termPool(lessons, manifest);

  test('termPool dedupes by term (case-insensitive) and tags the section', () => {
    expect(pool.map((t) => t.term)).toEqual(['T1', 'T2', 'T3', 'T4', 'T5']);
    expect(pool[3].section).toBe('B');
  });

  test('guessRounds gives four distinct options including the answer, same section first', () => {
    const rounds = guessRounds(pool, 5, 7);
    expect(rounds).toHaveLength(5);
    for (const r of rounds) {
      const names = r.options.map((o) => o.term);
      expect(new Set(names).size).toBe(4);
      expect(names).toContain(r.answer.term);
      const sameSection = pool.filter((t) => t.section === r.answer.section && t.term !== r.answer.term);
      for (const t of sameSection) expect(names).toContain(t.term);
    }
  });

  test('guessRounds never asks a definition that contains its own term', () => {
    const leaky = [...pool, { term: 'Risk', vi: 'Rủi ro', def: 'Rủi ro là khả năng...', section: 'A' }];
    const asked = guessRounds(leaky, 20, 1).map((r) => r.answer.term);
    expect(asked).not.toContain('Risk');
  });

  test('matchBoard pairs the same terms on both sides', () => {
    const board = matchBoard(pool, 4, 3);
    expect(board.left).toHaveLength(4);
    expect(new Set(board.right.map((t) => t.term))).toEqual(new Set(board.left.map((t) => t.term)));
  });
});
