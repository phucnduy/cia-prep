import { useState } from 'react';
import { SectionChip } from './ui.jsx';

const FIELDS = [
  ['rule', 'Quy tắc', 'rule'],
  ['action', 'Cách làm đúng', ''],
  ['violation', 'Vi phạm', ''],
  ['trap', 'Bẫy đề thi', 'trap'],
  ['distinction', 'Phân biệt', ''],
];

export default function Study({ manifest, study }) {
  const [active, setActive] = useState(manifest.sections[0].id);
  const section = manifest.sections.find((s) => s.id === active);
  const cards = study.filter((c) => c.section === active);

  return (
    <div className="study-layout">
      <nav className="toc" aria-label="Các phần">
        {manifest.sections.map((s) => (
          <button key={s.id} aria-pressed={active === s.id} onClick={() => setActive(s.id)}>
            <SectionChip manifest={manifest} id={s.id} />
            <span>
              {s.nameVi}
              <span className="subtle" style={{ display: 'block' }}>
                {s.weight}% · {study.filter((c) => c.section === s.id).length} thẻ
              </span>
            </span>
          </button>
        ))}
      </nav>

      <div>
        <div className="eyebrow">
          Phần {section.id} · {section.weight}% đề thi
        </div>
        <h2 className="display" style={{ fontSize: 'var(--text-2xl)', margin: '6px 0 4px' }}>
          {section.nameVi}
        </h2>
        <p className="subtle" style={{ marginTop: 0 }}>
          {section.name}
        </p>

        <h3 style={{ fontSize: 'var(--text-sm)', margin: '20px 0 6px' }}>Nội dung syllabus</h3>
        <ul className="syllabus">
          {section.topics.map((t) => (
            <li key={t.id}>
              <code>{t.id}</code>
              <span>
                {t.vi}
                <span className="subtle" style={{ display: 'block' }}>
                  {t.en}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <h3 style={{ fontSize: 'var(--text-sm)', margin: '0 0 10px' }}>Thẻ kiến thức</h3>
        {!cards.length && <div className="empty">Chưa có thẻ kiến thức cho phần này.</div>}
        <div className="cards">
          {cards.map((c, i) => (
            <details className="card" key={c.id} open={i === 0}>
              <summary>{c.title}</summary>
              <div className="card-body">
                {FIELDS.filter(([k]) => c[k]).map(([k, label, cls]) => (
                  <div className={`kv ${cls}`} key={k}>
                    <b>{label}</b>
                    <span>{c[k]}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
