import { useMemo, useState } from 'react';
import { guessRounds, matchBoard, termPool } from '../lib/practice.js';
import { newSeed } from '../lib/session.js';
import { Icon } from './ui.jsx';

const GUESS_ROUNDS = 10;
const MATCH_SIZE = 6;
const MIN_TERMS = 4;

/** Vocabulary games built from the `terms` of each lesson. */
export default function TermGames({ manifest, data }) {
  const all = useMemo(() => termPool(data.lessons, manifest), [data.lessons, manifest]);
  const [game, setGame] = useState('guess');
  const [section, setSection] = useState('all');
  const terms = section === 'all' ? all : all.filter((t) => t.section === section);

  return (
    <div className="games">
      <div className="games-bar">
        <div className="chips" role="group" aria-label="Trò chơi">
          <button className="chip" aria-pressed={game === 'guess'} onClick={() => setGame('guess')}>
            Đoán thuật ngữ
          </button>
          <button className="chip" aria-pressed={game === 'match'} onClick={() => setGame('match')}>
            Ghép cặp
          </button>
        </div>
        <span className="spacer" />
        <div className="chips" role="group" aria-label="Phần">
          <button className="chip" aria-pressed={section === 'all'} onClick={() => setSection('all')}>
            Tất cả ({all.length})
          </button>
          {manifest.sections.map((s) => (
            <button key={s.id} className="chip" aria-pressed={section === s.id} onClick={() => setSection(s.id)}>
              Phần {s.id} ({all.filter((t) => t.section === s.id).length})
            </button>
          ))}
        </div>
      </div>
      {terms.length < MIN_TERMS ? (
        <div className="empty">Phần này chưa đủ thuật ngữ để chơi. Hãy chọn tất cả các phần.</div>
      ) : game === 'guess' ? (
        <Guess key={`g-${section}`} terms={terms} />
      ) : (
        <Match key={`m-${section}`} terms={terms} />
      )}
    </div>
  );
}

function Guess({ terms }) {
  const [seed, setSeed] = useState(newSeed);
  const rounds = useMemo(() => guessRounds(terms, Math.min(GUESS_ROUNDS, terms.length), seed), [terms, seed]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  const restart = () => {
    setSeed(newSeed());
    setI(0);
    setPicked(null);
    setScore(0);
  };

  if (i >= rounds.length) {
    return (
      <section className="panel game-done">
        <h3>
          Đúng {score}/{rounds.length} thuật ngữ
        </h3>
        <p className="muted">Thuật ngữ nào chưa nhớ, hãy mở lại bài học của chủ đề đó để đọc định nghĩa đầy đủ.</p>
        <button className="btn btn-primary" onClick={restart}>
          <Icon name="redo" size={16} /> Chơi lượt mới
        </button>
      </section>
    );
  }

  const round = rounds[i];
  const choose = (t) => {
    if (picked) return;
    setPicked(t);
    if (t.term === round.answer.term) setScore((s) => s + 1);
  };

  return (
    <section className="panel game" aria-live="polite">
      <div className="game-meta">
        <span className="tag">
          Câu {i + 1}/{rounds.length}
        </span>
        <span className="tag">Chủ đề {round.answer.topic}</span>
        <span className="spacer" />
        <span className="mono">Điểm {score}</span>
      </div>
      <p className="game-def">{round.answer.def}</p>
      <p className="subtle" style={{ marginTop: 0 }}>
        Định nghĩa trên là của thuật ngữ nào?
      </p>
      <div className="game-options">
        {round.options.map((t) => {
          let state = '';
          if (picked) {
            if (t.term === round.answer.term) state = 'is-correct';
            else if (t.term === picked.term) state = 'is-wrong';
          }
          return (
            <button key={t.term} className={`game-option ${state}`} onClick={() => choose(t)} disabled={!!picked && !state}>
              <b>{t.vi}</b>
              <span>{t.term}</span>
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="row" style={{ marginTop: 16 }}>
          <span className={picked.term === round.answer.term ? 'pill pill-ok' : 'pill pill-bad'}>
            {picked.term === round.answer.term ? 'Chính xác' : `Đáp án: ${round.answer.vi}`}
          </span>
          <span className="spacer" />
          <button
            className="btn btn-primary"
            onClick={() => {
              setI((n) => n + 1);
              setPicked(null);
            }}
          >
            Tiếp <Icon name="right" size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

function Match({ terms }) {
  const [seed, setSeed] = useState(newSeed);
  const board = useMemo(() => matchBoard(terms, Math.min(MATCH_SIZE, terms.length), seed), [terms, seed]);
  const [left, setLeft] = useState(null);
  const [done, setDone] = useState({});
  const [miss, setMiss] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const finished = Object.keys(done).length === board.left.length;

  const restart = () => {
    setSeed(newSeed());
    setLeft(null);
    setDone({});
    setMiss(null);
    setMistakes(0);
  };

  const pickRight = (t) => {
    if (!left || done[t.term]) return;
    if (t.term === left.term) {
      setDone((d) => ({ ...d, [t.term]: true }));
      setLeft(null);
      setMiss(null);
    } else {
      setMistakes((m) => m + 1);
      setMiss(t.term);
    }
  };

  return (
    <section className="panel game">
      <div className="game-meta">
        <span className="subtle">Chọn một thuật ngữ tiếng Anh, rồi chọn tên tiếng Việt tương ứng.</span>
        <span className="spacer" />
        <span className="mono">
          {Object.keys(done).length}/{board.left.length} · sai {mistakes}
        </span>
      </div>
      <div className="match-grid">
        <div className="match-col">
          {board.left.map((t) => (
            <button
              key={t.term}
              className={`game-option ${done[t.term] ? 'is-correct' : left?.term === t.term ? 'is-active' : ''}`}
              onClick={() => !done[t.term] && setLeft(t)}
              disabled={!!done[t.term]}
              aria-pressed={left?.term === t.term}
            >
              <span>{t.term}</span>
            </button>
          ))}
        </div>
        <div className="match-col">
          {board.right.map((t) => (
            <button
              key={t.term}
              className={`game-option ${done[t.term] ? 'is-correct' : miss === t.term ? 'is-wrong' : ''}`}
              onClick={() => pickRight(t)}
              disabled={!!done[t.term]}
            >
              <b>{t.vi}</b>
            </button>
          ))}
        </div>
      </div>
      {finished && (
        <div className="row" style={{ marginTop: 16 }}>
          <span className="pill pill-ok">Hoàn thành với {mistakes} lần chọn sai</span>
          <span className="spacer" />
          <button className="btn btn-primary" onClick={restart}>
            <Icon name="redo" size={16} /> Bảng mới
          </button>
        </div>
      )}
    </section>
  );
}
