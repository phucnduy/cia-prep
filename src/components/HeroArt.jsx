// Decorative hero illustration: an audit working paper with tick marks, a
// magnifier over a finding, and a score ring. Colors come from theme tokens
// so it follows light and dark mode.
export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 420 300" aria-hidden="true" focusable="false">
      {/* back sheet */}
      <g className="ha-sheet ha-back">
        <rect x="150" y="18" width="210" height="250" rx="14" />
        <path d="M176 60h150M176 84h120M176 108h140" />
      </g>
      {/* front working paper */}
      <g className="ha-sheet ha-front">
        <rect x="70" y="40" width="230" height="240" rx="14" />
        <rect className="ha-head" x="70" y="40" width="230" height="44" rx="14" />
        <rect className="ha-head" x="70" y="64" width="230" height="20" />
        <text x="92" y="68" className="ha-title">
          WP-14 · Kiểm tra kiểm soát
        </text>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(0 ${i * 36})`}>
            <path className="ha-line" d={`M126 ${116}h${i === 2 ? 110 : 140}`} />
            <path className="ha-line ha-line-soft" d={`M126 ${128}h${i === 2 ? 70 : 96}`} />
            {i === 2 ? (
              <g className="ha-x">
                <circle cx="102" cy="120" r="11" />
                <path d="m97 115 10 10m0-10-10 10" />
              </g>
            ) : (
              <g className="ha-tick">
                <circle cx="102" cy="120" r="11" />
                <path d="m96.5 120 4 4 7-8" />
              </g>
            )}
          </g>
        ))}
      </g>
      {/* magnifier over the finding */}
      <g className="ha-lens">
        <circle cx="262" cy="190" r="34" />
        <path d="m287 215 30 30" />
      </g>
      {/* score ring */}
      <g className="ha-ring" transform="translate(340 236)">
        <circle r="34" className="ha-ring-bg" />
        <circle r="34" className="ha-ring-fg" strokeDasharray="160 214" transform="rotate(-90)" />
        <text y="6" textAnchor="middle" className="ha-ring-val">
          75%
        </text>
      </g>
      {/* ledger tab */}
      <g className="ha-tab">
        <rect x="24" y="200" width="92" height="56" rx="10" />
        <text x="40" y="224" className="ha-tab-k">
          GIAS
        </text>
        <text x="40" y="244" className="ha-tab-v">
          52 chuẩn mực
        </text>
      </g>
    </svg>
  );
}
