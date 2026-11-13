import { describe, expect, test } from 'vitest';
import { weakPractice } from './adaptive.js';

const manifest = { sections: [{ id: 'A', topics: [{ id: 'A1' }, { id: 'A2' }, { id: 'A3' }] }] };
const questions = ['A1', 'A2', 'A3'].flatMap((t) =>
  Array.from({ length: 20 }, (_, i) => ({ id: `${t}-${i}`, section: 'A', topic: t, answer: 0 })),
);

/** One practice attempt: `right` answered correctly, `wrong` answered wrongly. */
function attempt(right, wrong) {
  const answers = {};
  right.forEach((id) => { answers[id] = 0; });
  wrong.forEach((id) => { answers[id] = 1; });
  return { items: [...right, ...wrong].map((qid) => ({ qid })), answers };
}

describe('weakPractice', () => {
  test('includes previously missed questions and the weak topic', () => {
    // A1: 2/8 right (weak). A2: 8/8 right (strong).
    const a1 = Array.from({ length: 8 }, (_, i) => `A1-${i}`);
    const a2 = Array.from({ length: 8 }, (_, i) => `A2-${i}`);
    const history = [attempt([...a1.slice(0, 2), ...a2], a1.slice(2))];
    const wrong = Object.fromEntries(a1.slice(2).map((id) => [id, 1]));
    const { list, reason } = weakPractice({ manifest, questions, history, wrong, size: 20, seed: 1 });

    expect(list).toHaveLength(20);
    expect(new Set(list.map((q) => q.id)).size).toBe(20);
    expect(list.filter((q) => wrong[q.id]).length).toBe(6); // all 6 missed fit within 40% of 20
    expect(reason.weakTopics).toEqual(['A1']);
    expect(list.filter((q) => q.topic === 'A1').length).toBeGreaterThan(list.filter((q) => q.topic === 'A2').length);
  });

  test('without history it still returns a full set from the least practised topics', () => {
    const { list, reason } = weakPractice({ manifest, questions, history: [], wrong: {}, size: 10, seed: 2 });
    expect(list).toHaveLength(10);
    expect(reason.missed).toBe(0);
    expect(reason.weakTopics).toEqual([]);
  });

  test('never returns more questions than exist', () => {
    const small = questions.slice(0, 5);
    const { list } = weakPractice({ manifest, questions: small, history: [], wrong: {}, size: 20, seed: 3 });
    expect(list).toHaveLength(5);
  });
});
