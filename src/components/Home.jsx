import { useEffect, useState } from 'react';
import { loadPart } from '../lib/data.js';
import { load, keys } from '../lib/storage.js';
import { Icon, SectionIcon, StatusBadge, WeightDonut } from './ui.jsx';
import HeroArt from './HeroArt.jsx';

export default function Home({ index }) {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let alive = true;
    Promise.all(index.manifests.map((m) => loadPart(m).then((d) => [m.id, d.questions.length])))
      .then((pairs) => alive && setCounts(Object.fromEntries(pairs)))
      .catch((err) => console.error('Không đếm được câu hỏi:', err));
    return () => {
      alive = false;
    };
  }, [index]);

  const totalQuestions = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="container">
      <section className="hero" aria-labelledby="hero-title">
        <div>
          <div className="eyebrow">Chứng chỉ Kiểm toán viên nội bộ (CIA) · Đề cương 2025</div>
          <h1 id="hero-title" className="display" style={{ marginTop: 12 }}>
            Ôn đúng trọng tâm. <em>Thi như thật.</em>
          </h1>
          <p className="hero-lede">
            Luyện cả 3 phần thi CIA theo đúng cấu trúc và tỷ trọng IIA công bố. Có đề thi thử bấm giờ, luyện theo chuyên
            đề kèm giải thích và căn cứ Chuẩn mực GIAS, sổ câu sai và thẻ kiến thức.
          </p>
        </div>
        <div className="hero-side">
          <HeroArt />
          <div className="hero-facts">
          <div>
            <b className="mono">3</b>
            <span>phần thi</span>
          </div>
          <div>
            <b className="mono">{totalQuestions || '...'}</b>
            <span>câu hỏi có giải thích</span>
          </div>
          <div>
            <b className="mono">{index.scoring.scaledPass}</b>
            <span>điểm đạt / {index.scoring.scaledMax}</span>
          </div>
          </div>
        </div>
      </section>

      <a className="home-guide" href="#/guide">
        <b>Mới tìm hiểu về CIA?</b>
        <span>Điều kiện ghi danh, quy trình thi, lệ phí, cách học và kinh nghiệm đi thi, đối chiếu với thông tin chính thức của IIA.</span>
        <Icon name="arrow" />
      </a>

      <section className="parts" aria-label="Các phần thi">
        {index.manifests.map((m, i) => {
          const history = load(keys.history(m.id), []);
          const best = history.filter((h) => h.mode === 'exam').reduce((b, h) => Math.max(b, h.score.percent), 0);
          return (
            <a key={m.id} className="part-card" href={`#/${m.id}`}>
              <span className="part-no" aria-hidden="true">
                {i + 1}
              </span>
              <StatusBadge status={m.status} />
              <div>
                <div className="eyebrow">{m.code}</div>
                <h2 style={{ marginTop: 6 }}>{m.titleVi}</h2>
                <div className="subtle" style={{ marginTop: 4 }}>
                  {m.title}
                </div>
              </div>
              <div className="meta">
                <span>
                  <b className="mono">{m.questionCount}</b> câu
                </span>
                <span>
                  <b className="mono">{m.minutes}</b> phút
                </span>
                <span>
                  <b className="mono">{counts[m.id] ?? '...'}</b> câu trong ngân hàng
                </span>
              </div>
              <div className="part-blueprint">
                <WeightDonut manifest={m} size={92} />
                <div className="legend">
                  {m.sections.map((s) => (
                    <div key={s.id}>
                      <SectionIcon manifest={m} id={s.id} size={22} />
                      <span>{s.nameVi}</span>
                      <b className="mono">{s.weight}%</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="go">
                <span>{best ? `Điểm thi thử cao nhất: ${best}%` : 'Bắt đầu học'}</span>
                <Icon name="arrow" />
              </div>
            </a>
          );
        })}
      </section>

      <section className="how" aria-label="Cách học">
        {[
          ['01', 'book', 'Học lý thuyết', 'Đọc syllabus từng phần và thẻ kiến thức: quy tắc, bẫy đề thi, điểm cần phân biệt.'],
          ['02', 'target', 'Luyện chuyên đề', 'Chọn phần, làm câu hỏi và xem giải thích ngay sau mỗi câu.'],
          ['03', 'timer', 'Thi thử bấm giờ', 'Đề đủ số câu, phân bổ theo tỷ trọng, có đánh dấu, gạch đáp án, máy tính.'],
          ['04', 'redo', 'Ôn câu sai', 'Mọi câu làm sai được lưu lại để luyện tới khi làm đúng.'],
        ].map(([n, ic, t, d]) => (
          <div key={n}>
            <span className="how-icon" aria-hidden="true">
              <Icon name={ic} size={22} />
            </span>
            <span className="n">{n}</span>
            <b>{t}</b>
            <p>{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
