import { describe, expect, test } from 'vitest';
import { allocateBySection, buildExam, buildItems, createRng, formatClock, scoreAttempt } from './exam.js';
import { validateImport } from './validate.js';

const SECTIONS = [
  { id: 'A', weight: 35 },
  { id: 'B', weight: 20 },
  { id: 'C', weight: 30 },
  { id: 'D', weight: 15 },
];

function makeQuestions(counts) {
  return Object.entries(counts).flatMap(([section, n]) =>
    Array.from({ length: n }, (_, i) => ({
      id: `${section}-${i}`,
      section,
      options: ['a', 'b', 'c', 'd'],
      answer: i % 4,
    })),
  );
}

describe('allocateBySection', () => {
  test('splits 125 questions by the Part 1 blueprint weights', () => {
    const alloc = allocateBySection(SECTIONS, { A: 99, B: 99, C: 99, D: 99 }, 125);
    expect(alloc).toEqual({ A: 44, B: 25, C: 37, D: 19 });
    expect(Object.values(alloc).reduce((a, b) => a + b)).toBe(125);
  });

  test('redistributes the shortfall when a section has too few questions', () => {
    const alloc = allocateBySection(SECTIONS, { A: 10, B: 99, C: 99, D: 99 }, 100);
    expect(alloc.A).toBe(10);
    expect(Object.values(alloc).reduce((a, b) => a + b)).toBe(100);
  });

  test('returns fewer than requested when the whole bank is too small', () => {
    const alloc = allocateBySection(SECTIONS, { A: 2, B: 2, C: 2, D: 2 }, 125);
    expect(Object.values(alloc).reduce((a, b) => a + b)).toBe(8);
  });
});

describe('buildExam', () => {
  const questions = makeQuestions({ A: 60, B: 40, C: 50, D: 30 });

  test('draws the requested count with no duplicate questions', () => {
    const items = buildExam({ questions, sections: SECTIONS, count: 125, seed: 42 });
    expect(items).toHaveLength(125);
    expect(new Set(items.map((i) => i.qid)).size).toBe(125);
  });

  test('is deterministic for a given seed', () => {
    const a = buildExam({ questions, sections: SECTIONS, count: 50, seed: 7 });
    const b = buildExam({ questions, sections: SECTIONS, count: 50, seed: 7 });
    expect(a).toEqual(b);
  });

  test('every item has a permutation of the 4 option indexes', () => {
    const items = buildExam({ questions, sections: SECTIONS, count: 40, seed: 1 });
    for (const item of items) expect([...item.order].sort()).toEqual([0, 1, 2, 3]);
  });

  test('respects a section filter', () => {
    const items = buildExam({ questions, sections: SECTIONS, count: 20, seed: 3, sectionFilter: ['D'] });
    expect(items.every((i) => i.qid.startsWith('D-'))).toBe(true);
  });

  test('spreads the correct answer across display positions', () => {
    const items = buildItems(makeQuestions({ A: 400 }).map((q) => ({ ...q, answer: 0 })), 99);
    const positions = [0, 0, 0, 0];
    for (const item of items) positions[item.order.indexOf(0)] += 1;
    for (const p of positions) expect(p).toBeGreaterThan(60);
  });
});

describe('scoreAttempt', () => {
  test('scores totals and per-section breakdown; unanswered counts as wrong', () => {
    const questions = makeQuestions({ A: 2, B: 2 });
    const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
    const items = questions.map((q) => ({ qid: q.id, order: [0, 1, 2, 3] }));
    const answers = { 'A-0': 0, 'A-1': 3, 'B-0': 0 };
    const result = scoreAttempt(items, answers, byId);
    expect(result).toMatchObject({ correct: 2, answered: 3, total: 4, percent: 50 });
    expect(result.sections).toEqual({ A: { correct: 1, total: 2 }, B: { correct: 1, total: 2 } });
  });
});

describe('helpers', () => {
  test('formatClock', () => {
    expect(formatClock(9000)).toBe('2:30:00');
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(-5)).toBe('00:00');
  });

  test('createRng yields values in [0,1)', () => {
    const rng = createRng(5);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('validateImport', () => {
  const good = {
    id: 'X-1',
    section: 'A',
    stem: 'Câu hỏi mẫu đủ dài?',
    options: ['a', 'b', 'c', 'd'],
    answer: 1,
    explanation: 'Giải thích đủ dài.',
  };

  test('accepts a valid question and tags it as custom', () => {
    const { valid, errors } = validateImport([good], ['A', 'B']);
    expect(errors).toEqual([]);
    expect(valid[0]).toMatchObject({ id: 'X-1', source: 'custom', difficulty: 2 });
  });

  test('rejects bad shapes with a reason per question', () => {
    const { valid, errors } = validateImport(
      [{ ...good, answer: 4 }, { ...good, id: 'X-2', options: ['a', 'b'] }, { ...good, section: 'Z' }],
      ['A', 'B'],
    );
    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(3);
  });

  test('keeps valid optionNotes and rejects a wrong count', () => {
    const notes = ['a sai', 'b đúng', 'c sai', 'd sai'];
    expect(validateImport([{ ...good, optionNotes: notes }], ['A']).valid[0].optionNotes).toEqual(notes);
    expect(validateImport([{ ...good, optionNotes: notes.slice(0, 3) }], ['A']).errors).toHaveLength(1);
  });

  test('rejects duplicate ids and non-array payloads', () => {
    expect(validateImport([good, good], ['A']).errors).toHaveLength(1);
    expect(validateImport({}, ['A']).errors).toHaveLength(1);
  });
});
