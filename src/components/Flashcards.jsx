import { useMemo, useState } from 'react';
import { keys, load, save } from '../lib/storage.js';
import { buildDeck, dueQueue, INTERVAL_DAYS, NEW_PER_DAY, rateCard } from '../lib/srs.js';

const GRADES = [
  ['again', 'Quên', 'btn-danger'],
  ['hard', 'Khó', 'btn-ghost'],
  ['good', 'Nhớ', 'btn-primary'],
  ['easy', 'Dễ', 'btn-accent'],
];
const KIND_LABEL = { term: 'Thuật ngữ', check: 'Tự kiểm tra', rule: 'Thẻ kiến thức' };
const today = () => new Date().toISOString().slice(0, 10);

/** Human-readable wait until the next review. */
function waitLabel(ms) {
  const days = Math.round(ms / 86400000);
  return days >= 1 ? `${days} ngày` : '10 phút';
}

/** "Thẻ ghi nhớ" tab: flashcards from lessons and knowledge cards, reviewed with spaced repetition. */
export default function Flashcards({ manifest, data }) {
  const deck = useMemo(() => buildDeck(data.lessons || [], data.study || []), [data]);
  const [section, setSection] = useState('all');
  const [states, setStates] = useState(() => load(keys.cards(manifest.id), {}));
  const [dayInfo, setDayInfo] = useState(() => {
    const d = load(keys.cardsDay(manifest.id), null);
    return d?.day === today() ? d : { day: today(), newCount: 0 };
  });
  const [queue, setQueue] = useState(null);
  const [shown, setShown] = useState(false);

  const filtered = useMemo(
    () => (section === 'all' ? deck : deck.filter((c) => c.topic.startsWith(section))),
    [deck, section],
  );
  const now = Date.now();
  const dueCount = filtered.filter((c) => states[c.id] && states[c.id].due <= now).length;
  const learnedCount = filtered.filter((c) => states[c.id]?.box >= 1).length;
  const newLeft = Math.max(0, NEW_PER_DAY - dayInfo.newCount);

  const start = () => {
    setQueue(dueQueue(filtered, states, Date.now(), dayInfo.newCount));
    setShown(false);
  };

  const rate = (grade) => {
    const card = queue[0];
    const isNew = !states[card.id];
    const next = rateCard(states[card.id], grade, Date.now());
    const nextStates = { ...states, [card.id]: next };
    setStates(nextStates);
    save(keys.cards(manifest.id), nextStates);
    if (isNew) {
      const d = { day: today(), newCount: dayInfo.newCount + 1 };
      setDayInfo(d);
      save(keys.cardsDay(manifest.id), d);
    }
    // A forgotten card comes back at the end of this session.
    setQueue([...queue.slice(1), ...(grade === 'again' ? [card] : [])]);
    setShown(false);
  };

  const card = queue?.[0];

  return (
    <div className="cards-page">
      <section className="panel">
        <h3>Thẻ ghi nhớ {manifest.code}</h3>
        <p className="muted">
          {deck.length} thẻ từ thuật ngữ, câu tự kiểm tra trong bài học và thẻ kiến thức. Thẻ bạn nhớ tốt sẽ quay lại sau
          khoảng cách tăng dần ({INTERVAL_DAYS.slice(1).join(', ')} ngày); thẻ quên sẽ quay lại ngay trong phiên.
        </p>
        <div className="chips">
          {[['all', 'Tất cả'], ...manifest.sections.map((s) => [s.id, `Phần ${s.id}`])].map(([id, label]) => (
            <button key={id} className="chip" aria-pressed={section === id} onClick={() => { setSection(id); setQueue(null); }}>
              {label}
            </button>
          ))}
        </div>
        <div className="progress-stats cards-stats">
          <div className="stat-card"><span className="stat-value">{dueCount}</span><span className="stat-label">Thẻ đến hạn ôn</span></div>
          <div className="stat-card"><span className="stat-value">{newLeft}</span><span className="stat-label">Thẻ mới còn lại hôm nay</span></div>
          <div className="stat-card"><span className="stat-value">{learnedCount}/{filtered.length}</span><span className="stat-label">Thẻ đã thuộc</span></div>
        </div>
        {!queue && (
          <button type="button" className="btn btn-accent" onClick={start} disabled={!dueCount && !newLeft}>
            Bắt đầu ôn ({dueCount + Math.min(newLeft, filtered.filter((c) => !states[c.id]).length)} thẻ)
          </button>
        )}
      </section>

      {queue && !card && (
        <p className="notice notice-ok">Đã ôn xong các thẻ của hôm nay. Quay lại vào ngày mai để ôn các thẻ đến hạn.</p>
      )}

      {card && (
        <section className="panel flashcard" aria-live="polite">
          <div className="flashcard-meta">
            <span className="pill">{KIND_LABEL[card.kind]}</span>
            <span className="mono subtle">{card.topic}</span>
            <span className="subtle">Còn {queue.length} thẻ</span>
          </div>
          <div className="flashcard-front">{card.front}</div>
          {shown ? (
            <>
              <div className="flashcard-back">{card.back}</div>
              <div className="flashcard-grades">
                {GRADES.map(([grade, label, cls]) => (
                  <button key={grade} type="button" className={`btn ${cls}`} onClick={() => rate(grade)}>
                    {label}
                    <small>{waitLabel(rateCard(states[card.id], grade, 0).due)}</small>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setShown(true)}>
              Hiện đáp án
            </button>
          )}
        </section>
      )}
    </div>
  );
}
