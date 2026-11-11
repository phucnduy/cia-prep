// Pure exam logic: weighted draws, option shuffling, scoring.
// No DOM or storage access so it can be unit-tested directly.

/** Mulberry32: small seeded PRNG so an exam can be rebuilt from its seed. */
export function createRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, rng = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Split `total` across sections by weight (largest-remainder method),
 * capped by how many questions each section actually has. Any shortfall
 * is redistributed to sections that still have spare questions.
 */
export function allocateBySection(sections, available, total) {
  const weightSum = sections.reduce((s, x) => s + x.weight, 0) || 1;
  const raw = sections.map((s) => ({ id: s.id, exact: (total * s.weight) / weightSum }));
  const alloc = Object.fromEntries(raw.map((r) => [r.id, Math.floor(r.exact)]));
  let remaining = total - Object.values(alloc).reduce((a, b) => a + b, 0);
  const byRemainder = [...raw].sort((a, b) => (b.exact % 1) - (a.exact % 1));
  for (let i = 0; remaining > 0 && i < byRemainder.length; i++, remaining--) {
    alloc[byRemainder[i].id] += 1;
  }

  // Cap by availability, then hand the overflow to sections with spare capacity.
  let overflow = 0;
  for (const s of sections) {
    const cap = available[s.id] || 0;
    if (alloc[s.id] > cap) {
      overflow += alloc[s.id] - cap;
      alloc[s.id] = cap;
    }
  }
  const bySpare = [...sections].sort((a, b) => b.weight - a.weight);
  while (overflow > 0) {
    const target = bySpare.find((s) => (available[s.id] || 0) > alloc[s.id]);
    if (!target) break;
    alloc[target.id] += 1;
    overflow -= 1;
  }
  return alloc;
}

/**
 * Build an exam: pick questions per section by blueprint weight, mix them,
 * and give every item its own option order so the answer position can't be memorized.
 */
export function buildExam({ questions, sections, count, seed, sectionFilter }) {
  const rng = createRng(seed);
  const activeSections = sectionFilter?.length
    ? sections.filter((s) => sectionFilter.includes(s.id))
    : sections;
  const pools = Object.fromEntries(
    activeSections.map((s) => [s.id, shuffle(questions.filter((q) => q.section === s.id), rng)]),
  );
  const available = Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, v.length]));
  const alloc = allocateBySection(activeSections, available, count);
  const picked = activeSections.flatMap((s) => pools[s.id].slice(0, alloc[s.id]));
  return shuffle(picked, rng).map((q) => ({
    qid: q.id,
    order: shuffle(q.options.map((_, i) => i), rng),
  }));
}

/** Build items for an explicit list of questions (practice / retry-wrong). */
export function buildItems(questionList, seed) {
  const rng = createRng(seed);
  return questionList.map((q) => ({ qid: q.id, order: shuffle(q.options.map((_, i) => i), rng) }));
}

/**
 * answers: { [qid]: originalOptionIndex }
 * Returns totals plus a per-section breakdown keyed by section id.
 */
export function scoreAttempt(items, answers, byId) {
  const sections = {};
  let correct = 0;
  let answered = 0;
  for (const item of items) {
    const q = byId[item.qid];
    if (!q) continue;
    const s = (sections[q.section] ||= { correct: 0, total: 0 });
    s.total += 1;
    const given = answers[item.qid];
    if (given !== undefined && given !== null) answered += 1;
    if (given === q.answer) {
      correct += 1;
      s.correct += 1;
    }
  }
  const total = items.length;
  return {
    correct,
    answered,
    total,
    percent: total ? Math.round((correct / total) * 1000) / 10 : 0,
    sections,
  };
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}
