import { buildExam } from '../lib/exam.js';
import { DIAGNOSTIC_SECONDS_PER_QUESTION, DIAGNOSTIC_SIZE, answeredIds } from '../lib/practice.js';
import { newSeed, startSession } from '../lib/session.js';
import { keys, load } from '../lib/storage.js';
import { Icon, WeightDonut } from './ui.jsx';

/** Start a short timed quiz drawn by blueprint weight, unanswered questions first. */
export function startDiagnostic(manifest, data) {
  const seen = answeredIds(load(keys.history(manifest.id), []));
  const items = buildExam({
    questions: data.questions,
    sections: manifest.sections,
    count: DIAGNOSTIC_SIZE,
    seed: newSeed(),
    seen,
  });
  const minutes = Math.round((items.length * DIAGNOSTIC_SECONDS_PER_QUESTION) / 60);
  startSession(manifest, {
    id: `${Date.now()}`,
    mode: 'diagnostic',
    title: `Bài chẩn đoán ${items.length} câu`,
    items,
    answers: {},
    flags: {},
    struck: {},
    current: 0,
    startedAt: Date.now(),
    deadline: Date.now() + minutes * 60 * 1000,
    minutes,
  });
}

export default function Diagnostic({ index, manifest, data }) {
  const minutes = Math.round((DIAGNOSTIC_SIZE * DIAGNOSTIC_SECONDS_PER_QUESTION) / 60);
  return (
    <section className="panel diag-intro" aria-labelledby="diag-title">
      <div className="diag-art">
        <WeightDonut manifest={manifest} size={132} />
      </div>
      <div>
        <div className="eyebrow">Bắt đầu từ đâu?</div>
        <h2 id="diag-title" className="display" style={{ marginTop: 6 }}>
          Bài chẩn đoán {manifest.code}
        </h2>
        <p className="muted" style={{ maxWidth: '62ch' }}>
          {DIAGNOSTIC_SIZE} câu rút theo tỷ trọng từng phần của {manifest.code}, làm trong {minutes} phút (cùng nhịp 72 giây mỗi câu
          như bài thi thật). Đáp án chỉ hiện sau khi nộp. Kết quả cho biết nên bắt đầu học từ phần nào.
        </p>
        <ul className="diag-facts">
          <li>
            <Icon name="target" size={16} /> {DIAGNOSTIC_SIZE} câu, đủ các phần
          </li>
          <li>
            <Icon name="timer" size={16} /> {minutes} phút
          </li>
          <li>
            <Icon name="report" size={16} /> Gợi ý phần cần học trước
          </li>
        </ul>
        <p className="subtle" style={{ maxWidth: '62ch' }}>
          12 câu là mẫu nhỏ, nên kết quả chỉ để định hướng, không dự đoán điểm thi. Mục tiêu luyện tập của trang là{' '}
          {index.practicePassPercent}% số câu đúng.
        </p>
        <button
          className="btn btn-accent"
          onClick={() => startDiagnostic(manifest, data)}
          disabled={data.questions.length < DIAGNOSTIC_SIZE}
        >
          Bắt đầu bài chẩn đoán
        </button>
      </div>
    </section>
  );
}
