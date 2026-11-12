// Shared question-schema validation, used by the in-app JSON import
// and by scripts/validate.mjs at build time.

export const OPTION_COUNT = 4;

/** Returns a list of human-readable problems; empty list means valid. */
export function questionProblems(q, sectionIds) {
  const problems = [];
  if (!q || typeof q !== 'object') return ['không phải object'];
  if (typeof q.id !== 'string' || !q.id.trim()) problems.push('thiếu "id" (chuỗi)');
  if (!sectionIds.includes(q.section)) problems.push(`"section" phải là một trong ${sectionIds.join(', ')}`);
  if (typeof q.stem !== 'string' || q.stem.trim().length < 10) problems.push('"stem" quá ngắn hoặc thiếu');
  if (!Array.isArray(q.options) || q.options.length !== OPTION_COUNT) {
    problems.push(`"options" phải có đúng ${OPTION_COUNT} lựa chọn`);
  } else if (q.options.some((o) => typeof o !== 'string' || !o.trim())) {
    problems.push('có lựa chọn rỗng');
  } else if (new Set(q.options.map((o) => o.trim())).size !== OPTION_COUNT) {
    problems.push('có lựa chọn trùng nhau');
  }
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= OPTION_COUNT) {
    problems.push('"answer" phải là số nguyên 0-3');
  }
  if (typeof q.explanation !== 'string' || q.explanation.trim().length < 10) {
    problems.push('"explanation" quá ngắn hoặc thiếu');
  }
  if (q.refs !== undefined && !Array.isArray(q.refs)) problems.push('"refs" phải là mảng');
  if (
    q.optionNotes !== undefined &&
    (!Array.isArray(q.optionNotes) ||
      q.optionNotes.length !== OPTION_COUNT ||
      q.optionNotes.some((n) => typeof n !== 'string' || !n.trim()))
  ) {
    problems.push(`"optionNotes" (nếu có) phải gồm đúng ${OPTION_COUNT} giải thích, theo thứ tự "options"`);
  }
  return problems;
}

/**
 * Validate an imported payload (array of questions).
 * Returns { valid: Question[], errors: string[] }.
 */
export function validateImport(payload, sectionIds) {
  if (!Array.isArray(payload)) return { valid: [], errors: ['Dữ liệu phải là một mảng JSON [ ... ]'] };
  const valid = [];
  const errors = [];
  const seen = new Set();
  payload.forEach((q, i) => {
    const problems = questionProblems(q, sectionIds);
    if (!problems.length && seen.has(q.id.trim())) problems.push(`id "${q.id}" bị trùng trong file`);
    if (problems.length) {
      errors.push(`Câu #${i + 1}${q?.id ? ` (${q.id})` : ''}: ${problems.join('; ')}`);
      return;
    }
    seen.add(q.id.trim());
    valid.push({
      id: q.id.trim(),
      section: q.section,
      difficulty: [1, 2, 3].includes(q.difficulty) ? q.difficulty : 2,
      stem: q.stem.trim(),
      options: q.options.map((o) => o.trim()),
      answer: q.answer,
      explanation: q.explanation.trim(),
      ...(q.optionNotes ? { optionNotes: q.optionNotes.map((n) => n.trim()) } : {}),
      refs: Array.isArray(q.refs) ? q.refs.filter((r) => typeof r === 'string') : [],
      source: 'custom',
    });
  });
  return { valid, errors };
}
