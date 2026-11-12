import { useMemo, useState } from 'react';
import { keys, load } from '../lib/storage.js';
import { formatClock } from '../lib/exam.js';
import { LETTERS, SectionChip, sectionColor } from './ui.jsx';

const FILTERS = [
  ['wrong', 'Câu sai / bỏ trống'],
  ['flagged', 'Đã đánh dấu'],
  ['all', 'Tất cả'],
];

export default function Results({ index, manifest, data, attemptId }) {
  const attempt = useMemo(
    () => load(keys.history(manifest.id), []).find((h) => h.id === attemptId),
    [manifest.id, attemptId],
  );
  const [filter, setFilter] = useState('wrong');

  if (!attempt) {
    return <div className="empty">Không tìm thấy bài làm này (có thể đã bị xóa khỏi lịch sử).</div>;
  }

  const { score } = attempt;
  const target = index.practicePassPercent;
  const circumference = 2 * Math.PI * 70;
  const rows = attempt.items
    .map((it, i) => ({ it, i, q: data.byId[it.qid] }))
    .filter(({ q }) => q)
    .filter(({ it, q }) => {
      if (filter === 'all') return true;
      if (filter === 'flagged') return attempt.flags?.[it.qid];
      return attempt.answers[it.qid] !== q.answer;
    });

  return (
    <div>
      <section className="result-hero">
        <div className="score-ring" aria-label={`Đúng ${score.percent}%`}>
          <svg viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="var(--surface-2)" strokeWidth="12" />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={attempt.passed ? 'var(--ok)' : 'var(--bad)'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(score.percent / 100) * circumference} ${circumference}`}
            />
          </svg>
          <div className="val">
            <div>
              <b className="mono">{score.percent}%</b>
              <span>
                {score.correct}/{score.total} câu đúng
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="eyebrow">{attempt.mode === 'exam' ? 'Kết quả thi thử' : 'Kết quả luyện tập'}</div>
          <h2 className="verdict" style={{ marginTop: 6 }}>
            {attempt.passed ? 'Đạt mục tiêu luyện tập' : 'Chưa đạt mục tiêu'} ({target}%)
          </h2>
          <p className="muted" style={{ margin: '8px 0 16px' }}>
            {attempt.title} · {formatClock(attempt.durationSec)} · {score.answered}/{score.total} câu đã trả lời
            {attempt.reason === 'timeout' ? ' · hết giờ, bài tự động nộp' : ''}
          </p>
          <p className="subtle" style={{ margin: '0 0 16px', maxWidth: '70ch' }}>
            Bài thi thật chấm theo thang quy đổi {index.scoring.scaledMin}-{index.scoring.scaledMax}, đạt từ{' '}
            {index.scoring.scaledPass}. IIA không công bố cách quy đổi, nên ở đây chỉ hiện tỷ lệ đúng. Mục tiêu {target}% là
            ngưỡng luyện tập an toàn, không phải điểm đỗ chính thức.
          </p>
          <div className="row">
            <a className="btn btn-primary" href={`#/${manifest.id}`}>
              Làm bài khác
            </a>
            <a className="btn btn-ghost" href={`#/${manifest.id}/history`}>
              Lịch sử
            </a>
          </div>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel" aria-labelledby="bd-title">
          <h3 id="bd-title" style={{ marginBottom: 14 }}>
            Kết quả theo phần
          </h3>
          <div className="breakdown">
            {manifest.sections.map((s) => {
              const r = score.sections[s.id];
              if (!r) return null;
              const pct = Math.round((r.correct / r.total) * 100);
              return (
                <div className="breakdown-row" key={s.id}>
                  <SectionChip manifest={manifest} id={s.id} />
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6 }}>{s.nameVi}</div>
                    <div className="bar">
                      <span style={{ width: `${pct}%`, background: sectionColor(manifest, s.id) }} />
                      <i style={{ left: `${target}%` }} title={`Mục tiêu ${target}%`} />
                    </div>
                  </div>
                  <div className="mono" style={{ textAlign: 'right', fontSize: 'var(--text-sm)' }}>
                    <b>{pct}%</b>
                    <div className="subtle">
                      {r.correct}/{r.total}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel">
          <h3>Gợi ý ôn tập</h3>
          <ul className="muted" style={{ fontSize: 'var(--text-sm)', paddingLeft: 18, marginBottom: 0 }}>
            {manifest.sections
              .filter((s) => score.sections[s.id])
              .sort(
                (a, b) =>
                  score.sections[a.id].correct / score.sections[a.id].total -
                  score.sections[b.id].correct / score.sections[b.id].total,
              )
              .slice(0, 2)
              .map((s) => (
                <li key={s.id}>
                  Phần {s.id} ({s.nameVi}) đang yếu nhất. Đọc lại thẻ kiến thức ở mục{' '}
                  <a href={`#/${manifest.id}/study`}>Học lý thuyết</a> rồi luyện riêng phần này.
                </li>
              ))}
            <li>Các câu sai đã được thêm vào mục &quot;Ôn câu sai&quot; ở trang tổng quan.</li>
          </ul>
        </section>
      </div>

      <section style={{ marginTop: 28 }} aria-labelledby="review-title">
        <div className="bank-toolbar">
          <h3 id="review-title" style={{ marginRight: 'auto' }}>
            Xem lại đáp án
          </h3>
          <div className="chips">
            {FILTERS.map(([id, label]) => (
              <button key={id} className="chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {!rows.length && <div className="empty">Không có câu nào trong mục này.</div>}
        {rows.map(({ it, i, q }) => {
          const given = attempt.answers[it.qid];
          return (
            <article className="bank-item" key={it.qid}>
              <div className="row">
                <span className="tag">Câu {i + 1}</span>
                <span className="tag">Phần {q.section}</span>
                {given === undefined && <span className="pill pill-bad">Bỏ trống</span>}
                {given !== undefined && given !== q.answer && <span className="pill pill-bad">Sai</span>}
                {given === q.answer && <span className="pill pill-ok">Đúng</span>}
              </div>
              <p className="stem">{q.stem}</p>
              <ol>
                {it.order.map((original, pos) => (
                  <li
                    key={original}
                    className={original === q.answer ? 'correct' : ''}
                    style={
                      original === given && given !== q.answer
                        ? { background: 'var(--bad-soft)', textDecoration: 'line-through' }
                        : undefined
                    }
                  >
                    <span>
                      <b>{LETTERS[pos]}.</b> {q.options[original]}
                      {q.optionNotes && <span className="opt-note">{q.optionNotes[original]}</span>}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="explain">{q.explanation}</div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
