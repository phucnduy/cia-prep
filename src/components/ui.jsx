// Small shared UI pieces: icons, section colors, status badge.
import { DIFFICULTY, difficultyCounts } from '../lib/practice.js';

const PATHS = {
  flag: <path d="M4 22V4m0 0h13l-2 4 2 4H4" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  calc: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h8" />
    </>
  ),
  strike: <path d="M4 12h16M7 5h10M7 19h10" />,
  left: <path d="m15 18-6-6 6-6" />,
  right: <path d="m9 18 6-6-6-6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  pause: <path d="M10 4H6v16h4zM18 4h-4v16h4z" />,
  // Section and content icons (same 24px stroke grid as the set above).
  pillars: <path d="M3 21h18M4 10h16M12 3 4 7v3h16V7zM6 10v8M10 10v8M14 10v8M18 10v8M5 18h14" />,
  scale: <path d="M12 3v18M7 21h10M5 7h14M12 5l-1-2h2zM5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z" />,
  shield: <path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6zM8.5 12l2.5 2.5 4.5-5" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M8 10.5h5M10.5 8v5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  evidence: (
    <>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h5M14 3l5 5v3M14 3v5h5M8 12h5M8 16h3" />
      <circle cx="16.5" cy="16.5" r="3" />
      <path d="m18.7 18.7 2.3 2.3" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  plan: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M7 14h3M7 17h6" />
    </>
  ),
  badge: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="m9.5 9 1.8 1.8L14.8 7.3M8.5 14 7 22l5-3 5 3-1.5-8" />
    </>
  ),
  report: (
    <>
      <path d="M6 3h9l4 4v14H6zM15 3v4h4" />
      <path d="M9 17v-3M12 17v-6M15 17v-4" />
    </>
  ),
  book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7M8 11h7" />,
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />,
  alert: <path d="M12 3 2 20h20zM12 10v4M12 17h.01" />,
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M3 15h18M10 4v16" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5v.7M12 17h.01" />
    </>
  ),
  list: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
  tag: <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9zM7.5 7.5h.01" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2h6" />
    </>
  ),
  redo: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
};

/** Icon for each syllabus section, by part. Unknown sections fall back to a book. */
const SECTION_ICONS = {
  p1: { A: 'pillars', B: 'scale', C: 'shield', D: 'search' },
  p2: { A: 'compass', B: 'evidence', C: 'team' },
  p3: { A: 'gear', B: 'plan', C: 'badge', D: 'report' },
};

/**
 * Section icon in a tinted tile, colored by the section color.
 * @param {{ manifest: { id: string, sections: { id: string }[] }, id: string, size?: number }} props
 */
export function SectionIcon({ manifest, id, size = 40 }) {
  const name = SECTION_ICONS[manifest.id]?.[id] || 'book';
  return (
    <span className="section-icon" style={{ '--sc': sectionColor(manifest, id), width: size, height: size }} aria-hidden="true">
      <Icon name={name} size={Math.round(size * 0.55)} />
    </span>
  );
}

/**
 * Donut chart of section weights; the center shows the exam length.
 * @param {{ manifest: { sections: { id: string, weight: number }[], questionCount: number } }} props
 */
export function WeightDonut({ manifest, size = 112 }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const gap = 2;
  let offset = 0;
  return (
    <svg className="weight-donut" width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Tỷ trọng các phần thi">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
      {manifest.sections.map((s) => {
        const len = (s.weight / 100) * c;
        const seg = (
          <circle
            key={s.id}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={sectionColor(manifest, s.id)}
            strokeWidth="12"
            strokeDasharray={`${Math.max(len - gap, 0)} ${c}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
          />
        );
        offset += len;
        return seg;
      })}
      <text x="50" y="49" textAnchor="middle" className="wd-val">
        {manifest.questionCount}
      </text>
      <text x="50" y="63" textAnchor="middle" className="wd-label">
        câu / đề
      </text>
    </svg>
  );
}

/**
 * Small progress ring (0-100).
 * @param {{ value: number, label: string, tone?: string, size?: number }} props
 */
export function ProgressRing({ value, label, tone = 'var(--copper)', size = 104 }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <figure className="progress-ring" style={{ width: size }}>
      <svg width={size} height={size} viewBox="0 0 76 76" aria-hidden="true">
        <circle cx="38" cy="38" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="7" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${(v / 100) * c} ${c}`}
          transform="rotate(-90 38 38)"
        />
        <text x="38" y="43" textAnchor="middle" className="pr-val">
          {Math.round(v)}%
        </text>
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

const SECTION_COLORS = ['var(--sec-a)', 'var(--sec-b)', 'var(--sec-c)', 'var(--sec-d)'];

export function sectionColor(manifest, sectionId) {
  const i = manifest.sections.findIndex((s) => s.id === sectionId);
  return SECTION_COLORS[i] || 'var(--ink-3)';
}

export function SectionChip({ manifest, id }) {
  return (
    <span className="section-chip" style={{ background: sectionColor(manifest, id) }}>
      {id}
    </span>
  );
}

export function StatusBadge({ status }) {
  return status === 'ready' ? (
    <span className="status status-ready">Sẵn sàng thi thử</span>
  ) : (
    <span className="status status-draft">Đang biên soạn</span>
  );
}

export function Blueprint({ manifest }) {
  return (
    <div className="blueprint" role="img" aria-label="Tỷ trọng các phần thi">
      {manifest.sections.map((s) => (
        <span key={s.id} style={{ width: `${s.weight}%`, background: sectionColor(manifest, s.id) }} />
      ))}
    </div>
  );
}

/** Difficulty label for one question (1 easy, 2 medium, 3 hard). */
export function DifficultyTag({ level }) {
  const d = DIFFICULTY[level];
  if (!d) return null;
  return <span className={`diff diff-${d.tone}`}>{d.label}</span>;
}

/** Difficulty mix of a question list, e.g. "Dễ 2 · Trung bình 10 · Khó 8". */
export function DifficultyMix({ questions }) {
  const counts = difficultyCounts(questions);
  return (
    <span className="diff-mix">
      {[1, 2, 3].map((lv) => (
        <span key={lv} className={`diff diff-${DIFFICULTY[lv].tone}`}>
          {DIFFICULTY[lv].label} <b className="mono">{counts[lv]}</b>
        </span>
      ))}
    </span>
  );
}

export const LETTERS = ['A', 'B', 'C', 'D'];
