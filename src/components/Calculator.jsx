import { useState } from 'react';
import { Icon } from './ui.jsx';

// Basic immediate-execution calculator, like the one on the Pearson VUE screen.
const OPS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => (b === 0 ? NaN : a / b),
};

function fmt(n) {
  if (!Number.isFinite(n)) return 'Lỗi';
  return String(Math.round(n * 1e10) / 1e10);
}

export default function Calculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  const digit = (d) => {
    if (fresh || display === '0' || display === 'Lỗi') setDisplay(d === '.' ? '0.' : d);
    else if (!(d === '.' && display.includes('.'))) setDisplay(display + d);
    setFresh(false);
  };
  const operate = (next) => {
    const cur = parseFloat(display);
    if (op && acc !== null && !fresh) {
      const r = OPS[op](acc, cur);
      setAcc(r);
      setDisplay(fmt(r));
    } else {
      setAcc(cur);
    }
    setOp(next);
    setFresh(true);
  };
  const equals = () => {
    if (!op || acc === null) return;
    const r = OPS[op](acc, parseFloat(display));
    setDisplay(fmt(r));
    setAcc(null);
    setOp(null);
    setFresh(true);
  };
  const clear = () => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setFresh(true);
  };
  const back = () => setDisplay((d) => (d.length > 1 && !fresh ? d.slice(0, -1) : '0'));
  const negate = () => setDisplay((d) => fmt(-parseFloat(d)));
  const percent = () => setDisplay((d) => fmt(parseFloat(d) / 100));

  const keys = [
    ['C', clear, 'op'], ['+/-', negate, 'op'], ['%', percent, 'op'], ['/', () => operate('/'), 'op'],
    ['7', () => digit('7')], ['8', () => digit('8')], ['9', () => digit('9')], ['x', () => operate('*'), 'op'],
    ['4', () => digit('4')], ['5', () => digit('5')], ['6', () => digit('6')], ['-', () => operate('-'), 'op'],
    ['1', () => digit('1')], ['2', () => digit('2')], ['3', () => digit('3')], ['+', () => operate('+'), 'op'],
    ['0', () => digit('0')], ['.', () => digit('.')], ['DEL', back, 'op'], ['=', equals, 'eq'],
  ];

  return (
    <div className="calc" role="dialog" aria-label="Máy tính">
      <div className="row" style={{ marginBottom: 8 }}>
        <b style={{ fontSize: 'var(--text-sm)' }}>Máy tính</b>
        <span className="spacer" />
        <button className="strike-btn" onClick={onClose} aria-label="Đóng máy tính">
          <Icon name="close" size={15} />
        </button>
      </div>
      <div className="calc-screen" aria-live="polite">
        {display}
      </div>
      <div className="calc-keys">
        {keys.map(([label, fn, cls]) => (
          <button key={label} className={cls || ''} onClick={fn}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
