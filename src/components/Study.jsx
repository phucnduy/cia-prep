import { useMemo, useState } from 'react';
import { buildItems, shuffle } from '../lib/exam.js';
import { keys, load, save } from '../lib/storage.js';
import { newSeed, practiceSession, startSession, topicStats } from '../lib/session.js';
import { SectionChip, sectionColor } from './ui.jsx';

const TOPIC_PRACTICE_SIZE = 10;

const CARD_FIELDS = [
  ['rule', 'Quy tắc', 'rule'],
  ['action', 'Cách làm đúng', ''],
  ['violation', 'Vi phạm', ''],
  ['trap', 'Bẫy đề thi', 'trap'],
  ['distinction', 'Phân biệt', ''],
];

/**
 * Route arg: a section id ("A") shows the section overview,
 * a topic id ("A3") shows that topic's lesson. No arg = first section.
 */
export default function Study({ manifest, data, topicId }) {
  const topics = useMemo(
    () => manifest.sections.flatMap((s) => s.topics.map((t) => ({ ...t, section: s }))),
    [manifest],
  );
  const lessons = useMemo(() => Object.fromEntries(data.lessons.map((l) => [l.topic, l])), [data.lessons]);
  const questionsByTopic = useMemo(() => {
    const map = {};
    for (const q of data.questions) if (q.topic) (map[q.topic] ||= []).push(q);
    return map;
  }, [data.questions]);
  const stats = useMemo(() => topicStats(load(keys.history(manifest.id), []), data.byId), [manifest.id, data.byId]);
  const [learned, setLearned] = useState(() => load(keys.learned(manifest.id), {}));

  const topic = topics.find((t) => t.id === topicId);
  const section = topic?.section || manifest.sections.find((s) => s.id === topicId) || manifest.sections[0];

  const toggleLearned = (id) => {
    const next = { ...learned, [id]: !learned[id] };
    if (!next[id]) delete next[id];
    setLearned(next);
    save(keys.learned(manifest.id), next);
  };

  const practiceTopic = (t) => {
    const pool = shuffle(questionsByTopic[t.id] || []).slice(0, TOPIC_PRACTICE_SIZE);
    if (!pool.length) return;
    startSession(manifest, practiceSession(`Luyện chủ đề ${t.id} · ${t.vi}`, buildItems(pool, newSeed())));
  };

  const learnedCount = topics.filter((t) => learned[t.id]).length;

  return (
    <div className="study-layout">
      <nav className="toc" aria-label="Các phần và chủ đề">
        <div className="toc-progress">
          <span>
            Đã học <b className="mono">{learnedCount}</b>/{topics.length} chủ đề
          </span>
          <div className="bar">
            <span style={{ width: `${(learnedCount / topics.length) * 100}%` }} />
          </div>
        </div>
        {manifest.sections.map((s) => (
          <div className="toc-group" key={s.id}>
            <a
              className="toc-section"
              href={`#/${manifest.id}/study/${s.id}`}
              aria-current={!topic && section.id === s.id ? 'page' : undefined}
            >
              <SectionChip manifest={manifest} id={s.id} />
              <span>
                {s.nameVi}
                <span className="subtle" style={{ display: 'block' }}>
                  {s.weight}% đề thi
                </span>
              </span>
            </a>
            {(section.id === s.id || topic?.section.id === s.id) && (
              <ul className="toc-topics">
                {s.topics.map((t) => (
                  <li key={t.id}>
                    <a href={`#/${manifest.id}/study/${t.id}`} aria-current={topic?.id === t.id ? 'page' : undefined}>
                      <code>{t.id}</code>
                      <span className="toc-topic-name">{t.vi}</span>
                      {learned[t.id] && <span className="learned-dot" title="Đã học" aria-label="Đã học" />}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <div className="study-main">
        {topic ? (
          <Lesson
            manifest={manifest}
            topic={topic}
            lesson={lessons[topic.id]}
            questionCount={(questionsByTopic[topic.id] || []).length}
            stat={stats[topic.id]}
            learned={!!learned[topic.id]}
            onToggleLearned={() => toggleLearned(topic.id)}
            onPractice={() => practiceTopic(topic)}
            prev={topics[topics.indexOf(topic) - 1]}
            next={topics[topics.indexOf(topic) + 1]}
          />
        ) : (
          <SectionOverview
            manifest={manifest}
            section={section}
            lessons={lessons}
            questionsByTopic={questionsByTopic}
            stats={stats}
            learned={learned}
            cards={data.study.filter((c) => c.section === section.id)}
          />
        )}
      </div>
    </div>
  );
}

function accuracyLabel(stat) {
  if (!stat?.answered) return 'Chưa làm câu nào';
  return `Đã làm ${stat.answered} lượt, đúng ${Math.round((stat.correct / stat.answered) * 100)}%`;
}

function SectionOverview({ manifest, section, lessons, questionsByTopic, stats, learned, cards }) {
  return (
    <>
      <div className="eyebrow">
        Phần {section.id} · {section.weight}% đề thi
      </div>
      <h2 className="display study-title">{section.nameVi}</h2>
      <p className="subtle" style={{ marginTop: 0 }}>
        {section.name}
      </p>

      <div className="topic-grid">
        {section.topics.map((t) => {
          const stat = stats[t.id];
          const pct = stat?.answered ? Math.round((stat.correct / stat.answered) * 100) : null;
          return (
            <a key={t.id} className="topic-card" href={`#/${manifest.id}/study/${t.id}`}>
              <div className="row" style={{ gap: 8 }}>
                <code style={{ color: sectionColor(manifest, section.id) }}>{t.id}</code>
                {learned[t.id] && <span className="pill pill-ok">Đã học</span>}
                {!lessons[t.id] && <span className="pill pill-muted">Đang soạn</span>}
              </div>
              <b>{t.vi}</b>
              <span className="subtle">{t.en}</span>
              <span className="topic-meta">
                {(questionsByTopic[t.id] || []).length} câu hỏi
                {pct !== null && <> · đúng {pct}%</>}
              </span>
            </a>
          );
        })}
      </div>

      {cards.length > 0 && (
        <>
          <h3 className="study-h3">Thẻ kiến thức của phần {section.id}</h3>
          <div className="cards">
            {cards.map((c) => (
              <details className="card" key={c.id}>
                <summary>{c.title}</summary>
                <div className="card-body">
                  {CARD_FIELDS.filter(([k]) => c[k]).map(([k, label, cls]) => (
                    <div className={`kv ${cls}`} key={k}>
                      <b>{label}</b>
                      <span>{c[k]}</span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Lesson({ manifest, topic, lesson, questionCount, stat, learned, onToggleLearned, onPractice, prev, next }) {
  return (
    <article className="lesson">
      <div className="eyebrow">
        Phần {topic.section.id} · {topic.section.nameVi} · {topic.id}
      </div>
      <h2 className="display study-title">{topic.vi}</h2>
      <p className="subtle" style={{ marginTop: 0 }}>
        {topic.en}
      </p>

      <div className="lesson-actions">
        <div>
          <b>{questionCount} câu hỏi</b> về chủ đề này
          <span className="subtle" style={{ display: 'block' }}>
            {accuracyLabel(stat)}
          </span>
        </div>
        <span className="spacer" />
        <button className="btn btn-ghost" aria-pressed={learned} onClick={onToggleLearned}>
          {learned ? 'Đã học' : 'Đánh dấu đã học'}
        </button>
        <button className="btn btn-primary" onClick={onPractice} disabled={!questionCount}>
          Luyện {Math.min(TOPIC_PRACTICE_SIZE, questionCount)} câu
        </button>
      </div>

      {!lesson ? (
        <div className="empty">Bài học cho chủ đề này đang được biên soạn. Bạn vẫn có thể luyện câu hỏi.</div>
      ) : (
        <>
          <p className="lesson-summary">{lesson.summary}</p>

          {lesson.details?.length > 0 && (
            <>
              <h3 className="study-h3">Giải thích chi tiết</h3>
              <div className="lesson-details">
                {lesson.details.map((d) => (
                  <section key={d.heading}>
                    <h4>{d.heading}</h4>
                    {d.body.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </section>
                ))}
              </div>
            </>
          )}

          {lesson.compare && (
            <>
              <h3 className="study-h3">{lesson.compare.title}</h3>
              <div className="compare-wrap">
                <table className="compare">
                  <thead>
                    <tr>
                      {lesson.compare.columns.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lesson.compare.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (j === 0 ? <th key={j}>{cell}</th> : <td key={j}>{cell}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {lesson.example && (
            <aside className="lesson-example">
              <div className="eyebrow">Ví dụ tình huống</div>
              <h4>{lesson.example.title}</h4>
              <p>{lesson.example.scenario}</p>
              <p className="analysis">
                <b>Phân tích: </b>
                {lesson.example.analysis}
              </p>
            </aside>
          )}

          <h3 className="study-h3">Ý chính cần nhớ</h3>
          <ol className="lesson-points">
            {lesson.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>

          {lesson.terms?.length > 0 && (
            <>
              <h3 className="study-h3">Thuật ngữ</h3>
              <dl className="terms">
                {lesson.terms.map((t) => (
                  <div key={t.term}>
                    <dt>
                      {t.vi} <span className="subtle">({t.term})</span>
                    </dt>
                    <dd>{t.def}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {lesson.traps?.length > 0 && (
            <>
              <h3 className="study-h3">Bẫy thường gặp khi thi</h3>
              <ul className="traps">
                {lesson.traps.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </>
          )}

          {lesson.checks?.length > 0 && (
            <>
              <h3 className="study-h3">Tự kiểm tra</h3>
              <div className="checks">
                {lesson.checks.map((c, i) => (
                  <details className="check" key={i}>
                    <summary>
                      <span className="check-n">{i + 1}</span>
                      {c.q}
                    </summary>
                    <p>{c.a}</p>
                  </details>
                ))}
              </div>
            </>
          )}

          {lesson.refs?.length > 0 && (
            <div className="refs" style={{ marginTop: 20 }}>
              <span className="subtle">Căn cứ:</span>
              {lesson.refs.map((r) => (
                <span className="tag" key={r}>
                  {r}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <nav className="lesson-nav" aria-label="Chuyển chủ đề">
        {prev ? (
          <a className="btn btn-ghost" href={`#/${manifest.id}/study/${prev.id}`}>
            Trước: {prev.id}
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a className="btn btn-ghost" href={`#/${manifest.id}/study/${next.id}`}>
            Tiếp: {next.id} {next.vi}
          </a>
        )}
      </nav>
    </article>
  );
}
