import CheatSheet from './CheatSheet.jsx';
import TermGames from './TermGames.jsx';

const MODES = [
  ['sheet', 'Bảng tóm tắt'],
  ['games', 'Trò chơi thuật ngữ'],
];

/** "Ôn nhanh" tab: printable cheat sheet and vocabulary games. Route: #/pX/review/<mode>. */
export default function QuickReview({ manifest, data, mode }) {
  const current = MODES.some(([id]) => id === mode) ? mode : 'sheet';
  return (
    <div>
      <nav className="subnav no-print" aria-label="Ôn nhanh">
        {MODES.map(([id, label]) => (
          <a key={id} href={`#/${manifest.id}/review/${id}`} aria-current={current === id ? 'page' : undefined}>
            {label}
          </a>
        ))}
      </nav>
      {current === 'sheet' ? <CheatSheet manifest={manifest} data={data} /> : <TermGames manifest={manifest} data={data} />}
    </div>
  );
}
