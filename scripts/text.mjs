// Normalize typographic characters to plain ASCII equivalents so the data
// stays consistent regardless of where questions were authored.
const REPLACEMENTS = [
  [/[\u2013\u2014]/g, '-'],
  [/\u2026/g, '...'],
  [/[\u201C\u201D]/g, '"'],
  [/[\u2018\u2019]/g, "'"],
  [/[\u00A0\u2009]/g, ' '],
  [/\u200B/g, ''],
  [/\u2022/g, '-'],
  [/\u2192/g, '->'],
  [/\u2190/g, '<-'],
  [/\u00D7/g, 'x'],
  [/\u00F7/g, '/'],
];

export const TYPOGRAPHIC = /[\u2013\u2014\u2026\u201C\u201D\u2018\u2019\u00A0\u2009\u200B\u2022\u2192\u2190\u00D7\u00F7]/;

export function normalizeText(value) {
  if (typeof value !== 'string') return value;
  return REPLACEMENTS.reduce((s, [re, rep]) => s.replace(re, rep), value).trim();
}
