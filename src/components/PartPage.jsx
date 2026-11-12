import { useCallback, useEffect, useMemo, useState } from 'react';
import { countBySection, loadPart } from '../lib/data.js';
import { buildExam, buildItems, shuffle } from '../lib/exam.js';
import { keys, load, save } from '../lib/storage.js';
import { newSeed, startSession } from '../lib/session.js';
import { SectionChip, StatusBadge, sectionColor } from './ui.jsx';
import Study from './Study.jsx';
import Bank from './Bank.jsx';
import Session from './Session.jsx';
import Results from './Results.jsx';

const TABS = [
  ['overview', 'Tổng quan'],
  ['study', 'Học lý thuyết'],
  ['bank', 'Ngân hàng câu hỏi'],
  ['history', 'Lịch sử làm bài'],
];

const PRACTICE_SIZES = [10, 20, 40];
const MINI_EXAM_SIZE = 50;

export default function PartPage({ index, manifest, route }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0); // bump to reload after import/clear

  useEffect(() => {
    loadPart(manifest)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [manifest, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  if (error) return <div className="container notice notice-bad" style={{ marginTop: 32 }}>{error}</div>;
  if (!data) return <div className="loading">Đang tải {manifest.code}...</div>;

  if (route.view === 'session') return <Session index={index} manifest={manifest} data={data} />;

  return (
    <div className="container">
      <div className="part-head">
        <div>
          <div className="eyebrow">
            {manifest.code} · {manifest.title}
          </div>
          <h1 className="display" style={{ marginTop: 8 }}>
            {manifest.titleVi}
          </h1>
          <p className="muted" style={{ margin: '8px 0 0', maxWidth: '70ch' }}>
            {manifest.summary}
          </p>
        </div>
        <StatusBadge status={manifest.status} />
      </div>

      <nav className="tabs" aria-label="Chức năng">
        {TABS.map(([id, label]) => (
          <a
            key={id}
            href={id === 'overview' ? `#/${manifest.id}` : `#/${manifest.id}/${id}`}
            aria-current={route.view === id || (route.view === 'result' && id === 'history') ? 'page' : undefined}
          >
            {label}
          </a>
        ))}
      </nav>

      {route.view === 'overview' && <Overview index={index} manifest={manifest} data={data} />}
      {route.view === 'study' && <Study manifest={manifest} data={data} topicId={route.arg} />}
      {route.view === 'bank' && <Bank manifest={manifest} data={data} onChange={reload} />}
      {route.view === 'history' && <History manifest={manifest} />}
      {route.view === 'result' && <Results index={index} manifest={manifest} data={data} attemptId={route.arg} />}
    </div>
  );
}

function Overview({ index, manifest, data }) {
  const counts = useMemo(() => countBySection(data.questions), [data.questions]);
  const active = load(keys.activeSession(manifest.id), null);
  const wrongBook = load(keys.wrong(manifest.id), {});
  const wrongIds = Object.keys(wrongBook).filter((id) => data.byId[id]);
  const fullReady = data.questions.length >= manifest.questionCount;

  const [sections, setSections] = useState(manifest.sections.map((s) => s.id));
  const [size, setSize] = useState(20);
  const practicePool = data.questions.filter((q) => sections.includes(q.section)).length;

  const toggleSection = (id) =>
    setSections((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const startExam = (count) => {
    const seed = newSeed();
    const items = buildExam({ questions: data.questions, sections: manifest.sections, count, seed });
    const minutes = Math.round((manifest.minutes * items.length) / manifest.questionCount);
    startSession(manifest, {
      id: `${Date.now()}`,
      mode: 'exam',
      title: count === manifest.questionCount ? `Đề thi thử ${manifest.code}` : `Đề rút gọn ${items.length} câu`,
      items,
      answers: {},
      flags: {},
      struck: {},
      current: 0,
      startedAt: Date.now(),
      deadline: Date.now() + minutes * 60 * 1000,
      minutes,
    });
  };

  const startPractice = () => {
    const seed = newSeed();
    const items = buildExam({
      questions: data.questions,
      sections: manifest.sections,
      count: size,
      seed,
      sectionFilter: sections,
    });
    startSession(manifest, {
      id: `${Date.now()}`,
      mode: 'practice',
      title: `Luyện tập ${items.length} câu · Phần ${sections.join(', ')}`,
      items,
      answers: {},
      flags: {},
      struck: {},
      checked: {},
      current: 0,
      startedAt: Date.now(),
      deadline: null,
    });
  };

  const startWrong = () => {
    const list = shuffle(wrongIds.map((id) => data.byId[id])).slice(0, 40);
    startSession(manifest, {
      id: `${Date.now()}`,
      mode: 'practice',
      title: `Ôn ${list.length} câu đã làm sai`,
      items: buildItems(list, newSeed()),
      answers: {},
      flags: {},
      struck: {},
      checked: {},
      current: 0,
      startedAt: Date.now(),
      deadline: null,
    });
  };

  const resume = () => {
    window.location.hash = `#/${manifest.id}/session`;
  };

  return (
    <div className="grid-2">
      <div>
        <section className="panel panel-dark" aria-labelledby="exam-title">
          <div className="eyebrow" style={{ color: 'var(--copper-soft)' }}>
            Mô phỏng phòng thi
          </div>
          <h3 id="exam-title" className="display" style={{ fontSize: 'var(--text-2xl)', marginTop: 6 }}>
            Thi thử {manifest.code}
          </h3>
          <div className="exam-facts">
            <div>
              <b className="mono">{manifest.questionCount}</b>
              <span>câu hỏi trắc nghiệm</span>
            </div>
            <div>
              <b className="mono">{manifest.minutes}</b>
              <span>phút làm bài</span>
            </div>
            <div>
              <b className="mono">{index.practicePassPercent}%</b>
              <span>mục tiêu luyện tập</span>
            </div>
          </div>
          <p className="muted" style={{ fontSize: 'var(--text-sm)', margin: '0 0 18px', maxWidth: '52ch', position: 'relative', zIndex: 1 }}>
            Câu hỏi được rút theo đúng tỷ trọng từng phần, thứ tự đáp án xáo trộn mỗi lần thi. Không hiện đáp án tới khi nộp
            bài. Có đánh dấu câu, gạch bỏ phương án, bảng câu hỏi và máy tính như phòng thi Pearson VUE.
          </p>
          <div className="row" style={{ position: 'relative', zIndex: 1 }}>
            {active ? (
              <button className="btn btn-accent" onClick={resume}>
                Tiếp tục bài đang làm
              </button>
            ) : null}
            <button
              className={active ? 'btn btn-ghost' : 'btn btn-accent'}
              onClick={() => startExam(manifest.questionCount)}
              disabled={!fullReady}
            >
              Bắt đầu đề đầy đủ
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => startExam(Math.min(MINI_EXAM_SIZE, data.questions.length))}
              disabled={data.questions.length < 10}
            >
              Đề rút gọn {Math.min(MINI_EXAM_SIZE, data.questions.length)} câu
            </button>
          </div>
          {!fullReady && (
            <p className="subtle" style={{ marginTop: 12, position: 'relative', zIndex: 1 }}>
              Ngân hàng hiện có {data.questions.length}/{manifest.questionCount} câu, chưa đủ cho một đề đầy đủ. Bạn vẫn làm
              được đề rút gọn.
            </p>
          )}
          {active && (
            <p className="subtle" style={{ marginTop: 12, position: 'relative', zIndex: 1 }}>
              Bắt đầu đề mới sẽ thay thế bài đang làm dở ({active.title}).
            </p>
          )}
        </section>

        <section className="panel" aria-labelledby="practice-title">
          <h3 id="practice-title">Luyện tập theo chuyên đề</h3>
          <p className="subtle" style={{ margin: 0 }}>
            Không giới hạn thời gian, xem đáp án và giải thích ngay sau mỗi câu.
          </p>
          <div className="form-grid">
            <div>
              <span className="field-label">Chọn phần</span>
              <div className="chips">
                {manifest.sections.map((s) => (
                  <button
                    key={s.id}
                    className="chip"
                    aria-pressed={sections.includes(s.id)}
                    onClick={() => toggleSection(s.id)}
                  >
                    {s.id}. {s.nameVi} ({counts[s.id] || 0})
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="field-label">Số câu</span>
              <div className="chips">
                {PRACTICE_SIZES.map((n) => (
                  <button key={n} className="chip" aria-pressed={size === n} onClick={() => setSize(n)}>
                    {n} câu
                  </button>
                ))}
              </div>
            </div>
            <div className="row">
              <button className="btn btn-primary" onClick={startPractice} disabled={!sections.length || !practicePool}>
                Bắt đầu luyện ({Math.min(size, practicePool)} câu)
              </button>
              <button className="btn btn-ghost" onClick={startWrong} disabled={!wrongIds.length}>
                Ôn câu sai ({wrongIds.length})
              </button>
            </div>
          </div>
        </section>
      </div>

      <aside className="panel" aria-labelledby="blueprint-title">
        <h3 id="blueprint-title">Cấu trúc đề thi</h3>
        <p className="subtle" style={{ marginTop: 0 }}>
          Tỷ trọng theo syllabus IIA 2025 và số câu hiện có trong ngân hàng.
        </p>
        {manifest.sections.map((s) => {
          const inExam = Math.round((manifest.questionCount * s.weight) / 100);
          const have = counts[s.id] || 0;
          return (
            <div className="section-row" key={s.id}>
              <SectionChip manifest={manifest} id={s.id} />
              <div>
                <div className="name">{s.nameVi}</div>
                <div className="subtle" style={{ fontSize: 'var(--text-xs)' }}>
                  {s.name}
                </div>
                <div className="bar">
                  <span style={{ width: `${Math.min(100, (have / inExam) * 100)}%`, background: sectionColor(manifest, s.id) }} />
                </div>
              </div>
              <div className="num">
                <b className="mono">{s.weight}%</b>~{inExam} câu/đề
                <br />
                {have} trong ngân hàng
              </div>
            </div>
          );
        })}
        <p className="subtle" style={{ marginBottom: 0 }}>
          {data.builtInCount} câu có sẵn
          {data.customCount ? ` + ${data.customCount} câu bạn nhập` : ''}. Thẻ kiến thức: {data.study.length}.
        </p>
      </aside>
    </div>
  );
}

function History({ manifest }) {
  const [history, setHistory] = useState(() => load(keys.history(manifest.id), []));
  if (!history.length) {
    return <div className="empty">Chưa có bài làm nào. Hãy bắt đầu một đề thi thử hoặc phiên luyện tập.</div>;
  }
  const clear = () => {
    if (window.confirm('Xóa toàn bộ lịch sử làm bài của phần này?')) {
      save(keys.history(manifest.id), []);
      setHistory([]);
    }
  };
  return (
    <section className="panel">
      <div className="row" style={{ marginBottom: 8 }}>
        <h3>Lịch sử làm bài</h3>
        <span className="spacer" />
        <button className="btn btn-sm btn-danger" onClick={clear}>
          Xóa lịch sử
        </button>
      </div>
      <table className="history">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Bài làm</th>
            <th className="hide-sm">Thời gian</th>
            <th>Kết quả</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td className="mono">{new Date(h.finishedAt).toLocaleDateString('vi-VN')}</td>
              <td>{h.title}</td>
              <td className="hide-sm mono">{Math.round(h.durationSec / 60)} phút</td>
              <td>
                <span className={`pill ${h.passed ? 'pill-ok' : 'pill-bad'}`}>
                  {h.score.correct}/{h.score.total} · {h.score.percent}%
                </span>
              </td>
              <td>
                <a href={`#/${manifest.id}/result/${h.id}`}>Xem lại</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
