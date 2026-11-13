import { useMemo, useRef, useState } from 'react';
import { exportProgress, importProgress, keys, load } from '../lib/storage.js';
import { parseProgressFile, progressSummary, WEAK_ACCURACY, WEAK_MIN_ANSWERED } from '../lib/progress.js';

/** "Tiến độ" tab: study path, progress by topic, weak topics, export and import. */
export default function Progress({ index, manifest, data }) {
  const [message, setMessage] = useState(null);
  const fileInput = useRef(null);

  const topicName = useMemo(
    () => Object.fromEntries(manifest.sections.flatMap((s) => s.topics.map((t) => [t.id, t.vi || t.id]))),
    [manifest],
  );
  const summary = useMemo(
    () =>
      progressSummary({
        manifest,
        questions: data.questions,
        history: load(keys.history(manifest.id), []),
        learned: load(keys.learned(manifest.id), {}),
        wrong: load(keys.wrong(manifest.id), {}),
        passPercent: index.practicePassPercent,
      }),
    [manifest, data.questions, index.practicePassPercent],
  );

  const base = `#/${manifest.id}`;
  const firstUnlearned = summary.topics.find((t) => !t.learned);
  const leastPractised = [...summary.topics].sort((a, b) => a.answered - b.answered)[0];
  const stepLink = {
    read: `${base}/study/${firstUnlearned?.id ?? ''}`,
    practice: `${base}/study/${leastPractised?.id ?? ''}`,
    review: base,
    mock: base,
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(exportProgress(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cia-prep-tien-do-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ ok: true, text: 'Đã tải tệp tiến độ. Mở trang này ở máy khác và chọn "Nhập tệp tiến độ".' });
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Tệp quá lớn (giới hạn 5 MB).');
      const values = parseProgressFile(await file.text());
      if (!window.confirm('Nhập tệp sẽ ghi đè tiến độ hiện có trong trình duyệt này. Tiếp tục?')) return;
      const n = importProgress(values);
      setMessage({ ok: true, text: `Đã nhập ${n} mục dữ liệu. Trang sẽ tải lại.` });
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  };

  return (
    <div className="progress-page">
      <section className="panel" aria-labelledby="path-h">
        <h3 id="path-h">Lộ trình học {manifest.code}</h3>
        <p className="muted">Bốn bước theo thứ tự. Tiến độ được tính từ bài học đã đánh dấu và các lần làm bài trên trình duyệt này.</p>
        <ol className="path">
          {summary.steps.map((s, i) => (
            <li key={s.id} className={s.complete ? 'done' : summary.next?.id === s.id ? 'current' : ''}>
              <span className="path-n">{s.complete ? '✓' : i + 1}</span>
              <div className="path-body">
                <b>{s.label}</b>
                <div className="bar">
                  <span style={{ width: `${Math.round((s.done / s.total) * 100)}%` }} />
                </div>
                <span className="subtle">
                  {s.total > 1 ? `${s.done}/${s.total} chủ đề` : s.complete ? 'Hoàn thành' : s.detail || 'Chưa đạt'}
                </span>
              </div>
              {summary.next?.id === s.id && (
                <a className="btn btn-accent btn-sm" href={stepLink[s.id]}>
                  Làm tiếp
                </a>
              )}
            </li>
          ))}
        </ol>
        {!summary.next && <p className="notice notice-ok">Bạn đã hoàn thành lộ trình. Tiếp tục làm đề thi thử để giữ nhịp.</p>}
      </section>

      <div className="progress-stats">
        <Stat label="Bài học đã học" value={`${summary.learned.done}/${summary.learned.total}`} />
        <Stat label="Câu hỏi đã gặp" value={`${summary.seen.done}/${summary.seen.total}`} />
        <Stat label="Câu còn sai" value={summary.wrongCount} />
        <Stat
          label="Đề thi thử đầy đủ"
          value={summary.mocks.count ? `${summary.mocks.best}%` : '-'}
          hint={summary.mocks.count ? `cao nhất, ${summary.mocks.count} lần` : 'chưa làm'}
        />
      </div>

      <section className="panel" aria-labelledby="weak-h">
        <h3 id="weak-h">Chủ đề cần ôn</h3>
        <p className="muted">
          Chủ đề đã làm từ {WEAK_MIN_ANSWERED} câu trở lên và tỷ lệ đúng dưới {WEAK_ACCURACY}%.
        </p>
        {summary.weakTopics.length ? (
          <ul className="weak-list">
            {summary.weakTopics.map((t) => (
              <li key={t.id}>
                <a href={`${base}/study/${t.id}`}>
                  <span className="mono">{t.id}</span> {topicName[t.id]}
                </a>
                <span className="pill pill-bad">{t.accuracy}%</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="subtle">Chưa có chủ đề nào dưới ngưỡng (hoặc chưa đủ số câu để đánh giá).</p>
        )}
      </section>

      <section className="panel" aria-labelledby="topics-h">
        <h3 id="topics-h">Tiến độ theo chủ đề</h3>
        <div className="compare-wrap">
          <table className="compare">
            <thead>
              <tr>
                <th>Chủ đề</th>
                <th>Đã học</th>
                <th>Số câu đã làm</th>
                <th>Tỷ lệ đúng</th>
              </tr>
            </thead>
            <tbody>
              {summary.topics.map((t) => (
                <tr key={t.id}>
                  <th>
                    <a href={`${base}/study/${t.id}`}>
                      <span className="mono">{t.id}</span> {topicName[t.id]}
                    </a>
                  </th>
                  <td>{t.learned ? '✓' : ''}</td>
                  <td className="mono">{t.answered}</td>
                  <td className="mono">{t.answered ? `${t.accuracy}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel" aria-labelledby="backup-h">
        <h3 id="backup-h">Sao lưu và chuyển máy</h3>
        <p className="muted">
          Tiến độ chỉ lưu trong trình duyệt này. Tải tệp tiến độ để sao lưu hoặc mở ở máy khác; tệp gồm tiến độ của cả ba phần thi.
        </p>
        <div className="row-actions">
          <button type="button" className="btn btn-primary" onClick={download}>
            Tải tệp tiến độ
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileInput.current?.click()}>
            Nhập tệp tiến độ
          </button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={upload} />
        </div>
        {message && <p className={`notice ${message.ok ? 'notice-ok' : 'notice-bad'}`}>{message.text}</p>}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {hint && <span className="subtle">{hint}</span>}
    </div>
  );
}
