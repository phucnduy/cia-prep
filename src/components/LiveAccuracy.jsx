import { liveStats } from '../lib/practice.js';
import { sectionColor } from './ui.jsx';

const pct = (c, t) => (t ? Math.round((c / t) * 100) : 0);

/**
 * Accuracy so far in a practice session, by section and topic. Practice only:
 * exams stay feedback-free until submission, like the real test.
 */
export default function LiveAccuracy({ manifest, session, byId }) {
  const stats = liveStats(session, byId, manifest.sections);
  const topicName = Object.fromEntries(manifest.sections.flatMap((s) => s.topics.map((t) => [t.id, t.vi])));

  return (
    <aside className="live-acc" aria-label="Độ chính xác trong phiên này">
      <div className="live-acc-head">
        <span>Phiên này</span>
        <b className="mono">{stats.total ? `${pct(stats.correct, stats.total)}%` : '-'}</b>
      </div>
      <p className="subtle live-acc-sub">
        {stats.total ? `${stats.correct}/${stats.total} câu đúng sau khi kiểm tra` : 'Kiểm tra câu đầu tiên để xem độ chính xác.'}
      </p>
      {stats.sections
        .filter((s) => s.total > 0)
        .map((s) => (
          <div className="live-acc-sec" key={s.id}>
            <div className="live-acc-row">
              <span>Phần {s.id}</span>
              <span className="mono">
                {s.correct}/{s.total} · {pct(s.correct, s.total)}%
              </span>
            </div>
            <div className="bar">
              <span style={{ width: `${pct(s.correct, s.total)}%`, background: sectionColor(manifest, s.id) }} />
            </div>
            <ul>
              {Object.values(s.topics).map((t) => (
                <li key={t.id} title={topicName[t.id]}>
                  <span>
                    {t.id} {topicName[t.id]}
                  </span>
                  <span className={`mono ${t.correct < t.total ? 'is-miss' : ''}`}>
                    {t.correct}/{t.total}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </aside>
  );
}
