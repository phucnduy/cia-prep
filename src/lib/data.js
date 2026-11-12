// Loads the static JSON data (public/data). Paths are relative so the site
// works under any base path (GitHub Pages subfolder, custom domain, etc.).
import { load, keys } from './storage.js';

const cache = new Map();

async function getJson(path) {
  if (cache.has(path)) return cache.get(path);
  const promise = fetch(path, { cache: 'no-cache' }).then((res) => {
    if (!res.ok) throw new Error(`Không tải được ${path} (HTTP ${res.status})`);
    return res.json();
  });
  cache.set(path, promise);
  promise.catch(() => cache.delete(path));
  return promise;
}

export async function loadIndex() {
  const index = await getJson('data/parts.json');
  const manifests = await Promise.all(index.parts.map((p) => getJson(`${p.path}/manifest.json`)));
  return { ...index, manifests };
}

export function loadGuide() {
  return getJson('data/guide.json');
}

export async function loadPart(manifest) {
  const base = `data/${manifest.id}`;
  const [sectionFiles, study, lessons] = await Promise.all([
    Promise.all(manifest.sections.map((s) => getJson(`${base}/questions-${s.id}.json`).catch(() => []))),
    getJson(`${base}/study.json`).catch(() => []),
    getJson(`${base}/lessons.json`).catch(() => []),
  ]);
  const builtIn = sectionFiles.flat();
  const custom = load(keys.custom(manifest.id), []);
  const byId = {};
  for (const q of builtIn) byId[q.id] = q;
  for (const q of custom) byId[q.id] = q; // imported questions may override by id
  const questions = Object.values(byId);
  return { questions, byId, study, lessons, builtInCount: builtIn.length, customCount: custom.length };
}

export function countBySection(questions) {
  return questions.reduce((acc, q) => {
    acc[q.section] = (acc[q.section] || 0) + 1;
    return acc;
  }, {});
}
