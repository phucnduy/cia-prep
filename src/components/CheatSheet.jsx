import { useMemo } from 'react';
import { Icon, SectionIcon, sectionColor } from './ui.jsx';

const POINTS_PER_TOPIC = 2;
const TRAPS_PER_TOPIC = 2;

/**
 * One dense, printable page per part built from lessons.json: per topic the
 * summary, the first key points, the terms and the common traps.
 */
export default function CheatSheet({ manifest, data }) {
  const lessons = useMemo(() => Object.fromEntries(data.lessons.map((l) => [l.topic, l])), [data.lessons]);

  return (
    <div className="cheat">
      <div className="cheat-toolbar no-print">
        <p className="subtle" style={{ margin: 0, maxWidth: '70ch' }}>
          Tóm tắt từ các bài học: ý chính, thuật ngữ và bẫy thường gặp của từng chủ đề. Dùng để ôn nhanh trước giờ thi; muốn
          hiểu sâu hãy đọc bài học đầy đủ.
        </p>
        <span className="spacer" />
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Icon name="report" size={16} /> In / lưu PDF
        </button>
      </div>

      <header className="cheat-title print-only">
        <b>
          CIA {manifest.code} · {manifest.titleVi}
        </b>
        <span>
          {manifest.questionCount} câu · {manifest.minutes} phút · {manifest.sections.map((s) => `${s.id} ${s.weight}%`).join(' · ')}
        </span>
      </header>

      {manifest.sections.map((s) => (
        <section className="cheat-section" key={s.id} style={{ '--sc': sectionColor(manifest, s.id) }}>
          <h3 className="cheat-section-head">
            <SectionIcon manifest={manifest} id={s.id} size={30} />
            <span>
              Phần {s.id} · {s.nameVi}
            </span>
            <b className="mono">{s.weight}%</b>
          </h3>
          <div className="cheat-grid">
            {s.topics.map((t) => {
              const l = lessons[t.id];
              if (!l) return null;
              return (
                <article className="cheat-card" key={t.id}>
                  <h4>
                    <code>{t.id}</code> {t.vi}
                  </h4>
                  <p className="cheat-summary">{l.summary}</p>
                  {l.points?.length > 0 && (
                    <ul>
                      {l.points.slice(0, POINTS_PER_TOPIC).map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  )}
                  {l.terms?.length > 0 && (
                    <ul className="cheat-terms">
                      {l.terms.map((term) => (
                        <li key={term.term}>
                          <b>{term.vi}</b> <i>{term.term}</i>
                        </li>
                      ))}
                    </ul>
                  )}
                  {l.traps?.length > 0 && (
                    <ul className="cheat-traps">
                      {l.traps.slice(0, TRAPS_PER_TOPIC).map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
      <p className="subtle cheat-foot">
        Tài liệu ôn tập do cộng đồng biên soạn dựa trên GIAS 2024 và syllabus CIA 2025; chưa được người có chứng chỉ CIA rà soát.
      </p>
    </div>
  );
}
