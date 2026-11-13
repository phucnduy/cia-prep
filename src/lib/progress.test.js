import { describe, expect, test } from 'vitest';
import { parseProgressFile, progressSummary, WEAK_MIN_ANSWERED } from './progress.js';

const manifest = {
  id: 'p1',
  questionCount: 4,
  sections: [
    { id: 'A', topics: [{ id: 'A1' }, { id: 'A2' }] },
    { id: 'B', topics: [{ id: 'B1' }] },
  ],
};

function q(id, topic, answer = 0) {
  return { id, section: topic[0], topic, answer, options: ['a', 'b', 'c', 'd'] };
}

// 6 questions on A1, 1 on A2, 1 on B1
const questions = [
  ...Array.from({ length: 6 }, (_, i) => q(`A1-${i}`, 'A1')),
  q('A2-0', 'A2'),
  q('B1-0', 'B1'),
];

function attempt({ mode = 'practice', answers, percent = 0 }) {
  return {
    mode,
    items: Object.keys(answers).map((qid) => ({ qid })),
    answers,
    score: { percent },
  };
}

describe('progressSummary', () => {
  test('counts learned lessons and seen questions', () => {
    const history = [attempt({ answers: { 'A1-0': 0, 'A1-1': 1 } })];
    const s = progressSummary({ manifest, questions, history, learned: { A1: true }, wrong: {}, passPercent: 75 });
    expect(s.learned).toEqual({ done: 1, total: 3 });
    expect(s.seen).toEqual({ done: 2, total: 8 });
  });

  test('flags a topic as weak only after enough answers and low accuracy', () => {
    const answers = {};
    for (let i = 0; i < WEAK_MIN_ANSWERED; i += 1) answers[`A1-${i}`] = i === 0 ? 0 : 1; // 1 right, rest wrong
    const s = progressSummary({ manifest, questions, history: [attempt({ answers })], learned: {}, wrong: {}, passPercent: 75 });
    expect(s.weakTopics.map((t) => t.id)).toEqual(['A1']);
    expect(s.topics.find((t) => t.id === 'A2').answered).toBe(0);
  });

  test('suggests reading lessons first, then the next unfinished step', () => {
    const empty = progressSummary({ manifest, questions, history: [], learned: {}, wrong: {}, passPercent: 75 });
    expect(empty.next.id).toBe('read');

    const allLearned = { A1: true, A2: true, B1: true };
    const afterReading = progressSummary({ manifest, questions, history: [], learned: allLearned, wrong: {}, passPercent: 75 });
    expect(afterReading.next.id).toBe('practice');
  });

  test('only full-length exam attempts count as mock exams', () => {
    const full = attempt({ mode: 'exam', answers: { 'A1-0': 0, 'A1-1': 0, 'A2-0': 0, 'B1-0': 0 }, percent: 80 });
    const short = attempt({ mode: 'exam', answers: { 'A1-0': 0 }, percent: 100 });
    const s = progressSummary({ manifest, questions, history: [short, full], learned: {}, wrong: {}, passPercent: 75 });
    expect(s.mocks).toEqual({ count: 1, best: 80, last: 80 });
  });
});

describe('parseProgressFile', () => {
  test('accepts a file exported by the app', () => {
    const file = JSON.stringify({ app: 'cia-prep', version: 1, data: { 'cia:v2:p1:learned': '{"A1":true}' } });
    expect(parseProgressFile(file)).toEqual({ 'cia:v2:p1:learned': '{"A1":true}' });
  });

  test('rejects files from other apps or with foreign keys', () => {
    expect(() => parseProgressFile('{"app":"other","version":1,"data":{}}')).toThrow();
    const foreign = JSON.stringify({ app: 'cia-prep', version: 1, data: { 'evil:key': '1' } });
    expect(() => parseProgressFile(foreign)).toThrow();
    expect(() => parseProgressFile('not json')).toThrow();
  });

  test('rejects values that are not valid JSON strings', () => {
    const bad = JSON.stringify({ app: 'cia-prep', version: 1, data: { 'cia:v2:p1:learned': '{broken' } });
    expect(() => parseProgressFile(bad)).toThrow();
  });
});
