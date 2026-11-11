// Small shared UI pieces: icons, section colors, status badge.

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
};

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

export const LETTERS = ['A', 'B', 'C', 'D'];
