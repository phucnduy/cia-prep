import { useCallback, useEffect, useRef, useState } from 'react';
import { formatClock, scoreAttempt } from '../lib/exam.js';
import { keys, load, pushHistory, save, updateWrongBook } from '../lib/storage.js';
import { Icon, LETTERS } from './ui.jsx';
import Calculator from './Calculator.jsx';

const LOW_TIME_SECONDS = 5 * 60;

/** Drop items whose question was removed from the bank since the session started. */
function loadSession(manifest, byId) {
  const saved = load(keys.activeSession(manifest.id), null);
  if (!saved) return null;
  const items = saved.items.filter((it) => byId[it.qid]);
  if (!items.length) return null;
  return { ...saved, items, current: Math.min(saved.current, items.length - 1) };
}

export default function Session({ index, manifest, data }) {
  const [session, setSession] = useState(() => loadSession(manifest, data.byId));
  const [now, setNow] = useState(Date.now());
  const [sheet, setSheet] = useState(null); // 'nav' | 'review' | null
  const [showCalc, setShowCalc] = useState(false);
  const submittedRef = useRef(false);

  // Persist every change so a reload or closed tab resumes where the user left off.
  useEffect(() => {
    if (session) save(keys.activeSession(manifest.id), session);
  }, [session, manifest.id]);

  const isExam = session?.mode === 'exam';
  const remaining = isExam ? Math.round((session.deadline - now) / 1000) : null;

  const finish = useCallback(
    (reason) => {
      if (!session || submittedRef.current) return;
      submittedRef.current = true;
      const items = isExam ? session.items : session.items.filter((it) => session.checked?.[it.qid]);
      save(keys.activeSession(manifest.id), null);
      if (!items.length) {
        window.location.hash = `#/${manifest.id}`;
        return;
      }
      const score = scoreAttempt(items, session.answers, data.byId);
      const attempt = {
        id: session.id,
        mode: session.mode,
        title: session.title,
        reason,
        finishedAt: Date.now(),
        durationSec: Math.round((Date.now() - session.startedAt) / 1000),
        items,
        answers: session.answers,
        flags: session.flags,
        score,
        passed: score.percent >= index.practicePassPercent,
      };
      pushHistory(manifest.id, attempt);
      updateWrongBook(
        manifest.id,
        items.map((it) => ({ qid: it.qid, correct: session.answers[it.qid] === data.byId[it.qid]?.answer })),
      );
      window.location.hash = `#/${manifest.id}/result/${attempt.id}`;
    },
    [session, isExam, data.byId, index.practicePassPercent, manifest.id],
  );

  useEffect(() => {
    if (!isExam) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isExam]);

  useEffect(() => {
    if (isExam && remaining !== null && remaining <= 0) finish('timeout');
  }, [isExam, remaining, finish]);

  const item = session?.items[session.current];
  const question = item ? data.byId[item.qid] : null;
  const checked = !isExam && session?.checked?.[item?.qid];

  const update = (patch) => setSession((s) => ({ ...s, ...patch(s) }));
  const go = (i) => update((s) => ({ current: Math.max(0, Math.min(s.items.length - 1, i)) }));
  const choose = (original) => {
    if (checked) return;
    update((s) => ({ answers: { ...s.answers, [item.qid]: original } }));
  };
  const toggleFlag = () => update((s) => ({ flags: { ...s.flags, [item.qid]: !s.flags[item.qid] } }));
  const toggleStrike = (original) =>
    update((s) => {
      const cur = s.struck[item.qid] || [];
      const next = cur.includes(original) ? cur.filter((x) => x !== original) : [...cur, original];
      return { struck: { ...s.struck, [item.qid]: next } };
    });
  const check = () => update((s) => ({ checked: { ...s.checked, [item.qid]: true } }));

  // Keyboard: 1-4 / A-D choose, arrows navigate, F flag, Enter check (practice).
  useEffect(() => {
    if (!item || sheet) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, .calc') || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const pos = ['1', '2', '3', '4'].indexOf(k) >= 0 ? Number(k) - 1 : ['a', 'b', 'c', 'd'].indexOf(k);
      if (pos >= 0) choose(item.order[pos]);
      else if (k === 'arrowright') go(session.current + 1);
      else if (k === 'arrowleft') go(session.current - 1);
      else if (k === 'f') toggleFlag();
      else if (k === 'enter' && !isExam && !checked && session.answers[item.qid] !== undefined) check();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!session || !question) {
    return (
      <div className="container empty">
        Không có bài đang làm. <a href={`#/${manifest.id}`}>Quay lại {manifest.code}</a>
      </div>
    );
  }

  const answeredCount = session.items.filter((it) => session.answers[it.qid] !== undefined).length;
  const flaggedCount = session.items.filter((it) => session.flags[it.qid]).length;
  const selected = session.answers[item.qid];
  const struck = session.struck[item.qid] || [];
  const isLast = session.current === session.items.length - 1;
  const sectionMeta = manifest.sections.find((s) => s.id === question.section);

  const exitPractice = () => {
    window.location.hash = `#/${manifest.id}`;
  };

  return (
    <div className="console" role="application" aria-label={session.title}>
      <div className="console-top" style={{ position: 'relative' }}>
        <div className="title">
          {manifest.code} · {session.title}
          <small>
            Câu {session.current + 1}/{session.items.length} · đã trả lời {answeredCount}
          </small>
        </div>
        <div className="tools">
          {isExam && (
            <span className={`timer ${remaining <= LOW_TIME_SECONDS ? 'low' : ''}`} role="timer" aria-label="Thời gian còn lại">
              {formatClock(remaining)}
            </span>
          )}
          <button className="tool" aria-pressed={!!session.flags[item.qid]} onClick={toggleFlag} title="Đánh dấu (F)">
            <Icon name="flag" size={15} />
            <span className="lbl">Đánh dấu</span>
          </button>
          <button className="tool" aria-pressed={showCalc} onClick={() => setShowCalc((v) => !v)} title="Máy tính">
            <Icon name="calc" size={15} />
            <span className="lbl">Máy tính</span>
          </button>
          <button className="tool" onClick={() => setSheet('nav')} title="Bảng câu hỏi">
            <Icon name="grid" size={15} />
            <span className="lbl">Bảng câu</span>
          </button>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div
            style={{
              height: '100%',
              width: `${(answeredCount / session.items.length) * 100}%`,
              background: 'var(--copper)',
              transition: 'width 300ms',
            }}
          />
        </div>
      </div>

      <div className="console-body">
        <div className="question-wrap">
          <div className="q-head">
            <span className="q-num">Câu {session.current + 1}</span>
            {!isExam && <span className="tag">Phần {question.section} · {sectionMeta?.nameVi}</span>}
            {session.flags[item.qid] && <span className="tag" style={{ background: 'var(--flag-soft)', color: 'var(--flag)' }}>Đã đánh dấu</span>}
          </div>
          <p className="q-stem">{question.stem}</p>

          <ol className="options" role="radiogroup" aria-label="Các phương án">
            {item.order.map((original, pos) => {
              const isSel = selected === original;
              let state = '';
              if (checked) {
                if (original === question.answer) state = 'is-correct';
                else if (isSel) state = 'is-wrong';
              }
              return (
                <li key={original}>
                  <div
                    className={`option ${isSel && !checked ? 'selected' : ''} ${struck.includes(original) ? 'struck' : ''} ${state}`}
                    role="radio"
                    aria-checked={isSel}
                    tabIndex={0}
                    onClick={() => choose(original)}
                    onKeyDown={(e) => {
                      if (e.key === ' ') {
                        e.preventDefault();
                        choose(original);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleStrike(original);
                    }}
                  >
                    <span className="letter">{LETTERS[pos]}</span>
                    <span className="text">
                      {question.options[original]}
                      {checked && question.optionNotes && (
                        <span className="opt-note">{question.optionNotes[original]}</span>
                      )}
                    </span>
                    <button
                      className="strike-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStrike(original);
                      }}
                      aria-label={`Gạch bỏ phương án ${LETTERS[pos]}`}
                      title="Gạch bỏ phương án (hoặc chuột phải)"
                    >
                      <Icon name="strike" size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>

          {checked && (
            <div className={`feedback ${selected === question.answer ? 'ok' : 'bad'}`} role="status">
              <h4>
                {selected === question.answer
                  ? 'Chính xác'
                  : `Chưa đúng. Đáp án đúng: ${LETTERS[item.order.indexOf(question.answer)]}`}
              </h4>
              <p>{question.explanation}</p>
              {question.refs?.length > 0 && (
                <div className="refs">
                  {question.refs.map((r) => (
                    <span className="tag" key={r}>
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="console-bottom">
        <button className="btn btn-ghost" onClick={() => go(session.current - 1)} disabled={session.current === 0}>
          <Icon name="left" size={16} /> Trước
        </button>
        <span className="count mono">
          {answeredCount}/{session.items.length} đã trả lời · {flaggedCount} đánh dấu
        </span>
        <span className="spacer" />
        {!isExam && (
          <button className="btn btn-ghost" onClick={exitPractice} title="Lưu tiến độ và thoát">
            Lưu &amp; thoát
          </button>
        )}
        {!isExam && !checked && (
          <button className="btn btn-primary" onClick={check} disabled={selected === undefined}>
            Kiểm tra
          </button>
        )}
        {isLast ? (
          <button className="btn btn-accent" onClick={() => setSheet('review')}>
            {isExam ? 'Xem lại & nộp bài' : 'Kết thúc'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => go(session.current + 1)}>
            Tiếp <Icon name="right" size={16} />
          </button>
        )}
      </div>

      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}

      {sheet && (
        <Sheet
          kind={sheet}
          session={session}
          data={data}
          isExam={isExam}
          onClose={() => setSheet(null)}
          onJump={(i) => {
            go(i);
            setSheet(null);
          }}
          onSubmit={() => finish('submitted')}
          onReview={() => setSheet('review')}
        />
      )}
    </div>
  );
}

function Sheet({ kind, session, data, isExam, onClose, onJump, onSubmit, onReview }) {
  const [filter, setFilter] = useState('all');
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const cells = session.items
    .map((it, i) => {
      const answered = session.answers[it.qid] !== undefined;
      const flagged = !!session.flags[it.qid];
      const checked = session.checked?.[it.qid];
      const right = checked && session.answers[it.qid] === data.byId[it.qid]?.answer;
      return { i, answered, flagged, checked, right };
    })
    .filter((c) => filter === 'all' || (filter === 'flagged' && c.flagged) || (filter === 'unanswered' && !c.answered));

  const answered = session.items.filter((it) => session.answers[it.qid] !== undefined).length;
  const flagged = session.items.filter((it) => session.flags[it.qid]).length;
  const unanswered = session.items.length - answered;

  return (
    <div className="navigator" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={kind === 'review' ? 'Xem lại bài làm' : 'Bảng câu hỏi'}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        ref={ref}
      >
        <div className="row">
          <h3>{kind === 'review' ? 'Xem lại trước khi nộp' : 'Bảng câu hỏi'}</h3>
          <span className="spacer" />
          <button className="icon-btn" onClick={onClose} aria-label="Đóng">
            <Icon name="close" />
          </button>
        </div>
        <div className="review-stats" style={{ marginTop: 14 }}>
          <div>
            <b className="mono">{answered}</b>đã trả lời
          </div>
          <div>
            <b className="mono" style={{ color: unanswered ? 'var(--bad)' : undefined }}>
              {unanswered}
            </b>
            chưa trả lời
          </div>
          <div>
            <b className="mono" style={{ color: 'var(--flag)' }}>
              {flagged}
            </b>
            đánh dấu
          </div>
        </div>
        <div className="chips" style={{ marginTop: 16 }}>
          {[
            ['all', 'Tất cả'],
            ['flagged', 'Đã đánh dấu'],
            ['unanswered', 'Chưa trả lời'],
          ].map(([id, label]) => (
            <button key={id} className="chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="nav-grid">
          {cells.map((c) => (
            <button
              key={c.i}
              className={[
                'nav-cell',
                c.checked ? (c.right ? 'right' : 'wrong') : c.answered ? 'answered' : '',
                c.flagged ? 'flagged' : '',
                c.i === session.current ? 'current' : '',
              ].join(' ')}
              onClick={() => onJump(c.i)}
              aria-label={`Câu ${c.i + 1}${c.answered ? ', đã trả lời' : ''}${c.flagged ? ', đã đánh dấu' : ''}`}
            >
              {c.i + 1}
            </button>
          ))}
          {!cells.length && <span className="subtle">Không có câu nào.</span>}
        </div>
        {kind === 'review' ? (
          <>
            {isExam && unanswered > 0 && (
              <div className="notice notice-warn" style={{ marginBottom: 14 }}>
                Còn {unanswered} câu chưa trả lời. Câu bỏ trống được tính là sai, giống bài thi thật.
              </div>
            )}
            <div className="row">
              <button className="btn btn-ghost" onClick={onClose}>
                Quay lại làm bài
              </button>
              <span className="spacer" />
              <button className="btn btn-accent" onClick={onSubmit}>
                {isExam ? 'Nộp bài' : 'Kết thúc & xem kết quả'}
              </button>
            </div>
          </>
        ) : (
          <div className="row">
            <span className="subtle">Bấm số câu để chuyển tới câu đó.</span>
            <span className="spacer" />
            <button className="btn btn-accent" onClick={onReview}>
              {isExam ? 'Xem lại & nộp bài' : 'Kết thúc'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
