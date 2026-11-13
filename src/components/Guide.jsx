import { useEffect, useState } from 'react';
import { loadDoc } from '../lib/data.js';
import { Blueprint, sectionColor } from './ui.jsx';

/**
 * Document page built from public/data/<source>.json: "Tìm hiểu CIA" (guide)
 * and "Khung chuẩn mực" (frameworks) share this renderer.
 */
export default function Guide({ index, source = 'guide', eyebrow = 'Dành cho người mới bắt đầu' }) {
  const [guide, setGuide] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDoc(source).then(setGuide).catch((err) => setError(err.message));
  }, [source]);

  if (error) return <div className="container notice notice-bad" style={{ marginTop: 32 }}>{error}</div>;
  if (!guide) return <div className="loading">Đang tải...</div>;

  return (
    <div className="container guide">
      <header className="guide-head">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="display">{guide.title}</h1>
        <p className="hero-lede">{guide.lede}</p>
        <p className="subtle">{guide.checked}</p>
      </header>

      <div className="guide-layout">
        <nav className="guide-toc" aria-label="Mục lục">
          {guide.sections.map((s, i) => (
            <a key={s.id} href={`#/${source}`} onClick={(e) => { e.preventDefault(); document.getElementById(`g-${s.id}`)?.scrollIntoView({ behavior: 'smooth' }); }}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span> {s.title}
            </a>
          ))}
        </nav>

        <div className="guide-body">
          {guide.sections.map((s, i) => (
            <section key={s.id} id={`g-${s.id}`} className="guide-section">
              <h2>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </h2>
              {s.blocks.map((b, j) => (
                <Block key={j} block={b} index={index} />
              ))}
            </section>
          ))}

          <section className="guide-section">
            <h2>Nguồn tham khảo</h2>
            <ul className="guide-list">
              {guide.sources.map((s) => (
                <li key={s.label}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.label}
                    </a>
                  ) : (
                    s.label
                  )}
                </li>
              ))}
            </ul>
          </section>

          <div className="guide-cta">
            <b>Sẵn sàng bắt đầu?</b>
            <span className="muted">Bắt đầu với Part 1: học lý thuyết theo chủ đề, rồi luyện câu hỏi và thi thử.</span>
            <a className="btn btn-accent" href="#/p1/study">
              Học Part 1
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ block, index }) {
  switch (block.type) {
    case 'h':
      return <h3 className="study-h3">{block.text}</h3>;
    case 'p':
      return <p className="guide-p">{block.text}</p>;
    case 'note':
      return <p className="notice notice-warn guide-note">{block.text}</p>;
    case 'list':
      return (
        <ul className="guide-list">
          {block.items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <>
          {block.title && <h3 className="study-h3">{block.title}</h3>}
          <div className="compare-wrap">
            <table className="compare">
              <thead>
                <tr>
                  {block.columns.map((c, i) => (
                    <th key={i}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (j === 0 ? <th key={j}>{cell}</th> : <td key={j}>{cell}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    case 'steps':
      return (
        <ol className="guide-steps">
          {block.items.map((s, i) => (
            <li key={i}>
              <span className="step-n">{i + 1}</span>
              <div>
                <b>{s.title}</b>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'faq':
      return (
        <div className="checks">
          {block.items.map((f, i) => (
            <details className="check" key={i}>
              <summary>
                <span className="check-n">?</span>
                {f.q}
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      );
    case 'parts':
      // Exam structure comes from the part manifests, so it never drifts from the exam data.
      return (
        <div className="guide-parts">
          {index.manifests.map((m) => (
            <a key={m.id} className="topic-card" href={`#/${m.id}`}>
              <code>{m.code}</code>
              <b>{m.titleVi}</b>
              <span className="subtle">
                {m.questionCount} câu · {m.minutes} phút
              </span>
              <Blueprint manifest={m} />
              <ul className="legend" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                {m.sections.map((s) => (
                  <li key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <i style={{ width: 8, height: 8, borderRadius: 2, background: sectionColor(m, s.id), flex: 'none' }} />
                    <span style={{ flex: 1 }}>{s.nameVi}</span>
                    <b className="mono">{s.weight}%</b>
                  </li>
                ))}
              </ul>
            </a>
          ))}
        </div>
      );
    default:
      return null;
  }
}
