// localStorage wrapper. Every access is guarded: storage can be disabled
// (private mode, blocked site data), and the app must still work without it.

const PREFIX = 'cia:v2:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    if (value === undefined || value === null) localStorage.removeItem(PREFIX + key);
    else localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn('Không lưu được dữ liệu vào trình duyệt:', err);
    return false;
  }
}

export const keys = {
  activeSession: (part) => `${part}:session`,
  history: (part) => `${part}:history`,
  wrong: (part) => `${part}:wrong`,
  custom: (part) => `${part}:custom`,
  bookmarks: (part) => `${part}:bookmarks`,
  learned: (part) => `${part}:learned`,
};

const HISTORY_LIMIT = 30;

export function pushHistory(part, attempt) {
  const next = [attempt, ...load(keys.history(part), [])].slice(0, HISTORY_LIMIT);
  save(keys.history(part), next);
  return next;
}

/** Track questions answered wrong; a later correct answer clears the entry. */
export function updateWrongBook(part, results) {
  const book = { ...load(keys.wrong(part), {}) };
  for (const { qid, correct } of results) {
    if (correct) delete book[qid];
    else book[qid] = (book[qid] || 0) + 1;
  }
  save(keys.wrong(part), book);
  return book;
}
