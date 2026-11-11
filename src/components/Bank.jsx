import { useMemo, useState } from 'react';
import { keys, load, save } from '../lib/storage.js';
import { validateImport } from '../lib/validate.js';
import { LETTERS } from './ui.jsx';

const PAGE_SIZE = 15;

const SAMPLE = `[
  {
    "id": "MY-001",
    "section": "A",
    "difficulty": 2,
    "stem": "Nội dung câu hỏi...",
    "options": ["Phương án 1", "Phương án 2", "Phương án 3", "Phương án 4"],
    "answer": 0,
    "explanation": "Giải thích vì sao phương án 1 đúng...",
    "refs": ["GIAS 6.2"]
  }
]`;

function download(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Bank({ manifest, data, onChange }) {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('ALL');
  const [page, setPage] = useState(1);
  const [reveal, setReveal] = useState(true);
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState(null);
  const sectionIds = manifest.sections.map((s) => s.id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.questions.filter((item) => {
      if (section !== 'ALL' && item.section !== section) return false;
      if (!q) return true;
      return [item.id, item.stem, item.explanation, ...item.options].join(' ').toLowerCase().includes(q);
    });
  }, [data.questions, query, section]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const applyImport = (text) => {
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (err) {
      setStatus({ type: 'bad', message: `JSON không hợp lệ: ${err.message}` });
      return;
    }
    const { valid, errors } = validateImport(payload, sectionIds);
    if (valid.length) {
      const existing = load(keys.custom(manifest.id), []);
      const merged = Object.values(Object.fromEntries([...existing, ...valid].map((q) => [q.id, q])));
      if (!save(keys.custom(manifest.id), merged)) {
        setStatus({ type: 'bad', message: 'Trình duyệt không cho lưu dữ liệu (chế độ ẩn danh hoặc đã chặn lưu trữ).' });
        return;
      }
      onChange();
    }
    setStatus({
      type: errors.length ? 'warn' : 'ok',
      message: `Đã nhập ${valid.length} câu.${errors.length ? ` Bỏ qua ${errors.length} câu lỗi:\n${errors.slice(0, 8).join('\n')}` : ''}`,
    });
    if (valid.length) setImportText('');
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(applyImport);
    e.target.value = '';
  };

  const clearCustom = () => {
    if (window.confirm(`Xóa ${data.customCount} câu bạn đã nhập cho ${manifest.code}?`)) {
      save(keys.custom(manifest.id), []);
      setStatus({ type: 'ok', message: 'Đã xóa các câu tự nhập.' });
      onChange();
    }
  };

  return (
    <div>
      <div className="bank-toolbar">
        <input
          className="input"
          type="search"
          placeholder="Tìm theo nội dung, mã câu..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          aria-label="Tìm câu hỏi"
        />
        <div className="chips">
          {['ALL', ...sectionIds].map((id) => (
            <button
              key={id}
              className="chip"
              aria-pressed={section === id}
              onClick={() => {
                setSection(id);
                setPage(1);
              }}
            >
              {id === 'ALL' ? 'Tất cả' : `Phần ${id}`}
            </button>
          ))}
        </div>
        <span className="spacer" />
        <label className="row subtle" style={{ gap: 6 }}>
          <input type="checkbox" checked={reveal} onChange={(e) => setReveal(e.target.checked)} /> Hiện đáp án
        </label>
      </div>
      <p className="subtle" style={{ marginTop: 0 }}>
        {filtered.length} câu
      </p>

      {shown.map((q) => (
        <article className="bank-item" key={q.id}>
          <div className="row">
            <span className="tag">{q.id}</span>
            <span className="tag">Phần {q.section}</span>
            {q.source === 'custom' && <span className="tag">Tự nhập</span>}
            {q.refs?.map((r) => (
              <span className="tag" key={r}>
                {r}
              </span>
            ))}
          </div>
          <p className="stem">{q.stem}</p>
          <ol>
            {q.options.map((o, i) => (
              <li key={i} className={reveal && i === q.answer ? 'correct' : ''}>
                <b>{LETTERS[i]}.</b> {o}
              </li>
            ))}
          </ol>
          {reveal && <div className="explain">{q.explanation}</div>}
        </article>
      ))}
      {!shown.length && <div className="empty">Không tìm thấy câu hỏi phù hợp.</div>}

      {pages > 1 && (
        <div className="pager">
          <button className="btn btn-ghost btn-sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
            Trước
          </button>
          <span className="mono">
            {current}/{pages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={current === pages} onClick={() => setPage(current + 1)}>
            Sau
          </button>
        </div>
      )}

      <section className="panel" style={{ marginTop: 32 }} aria-labelledby="import-title">
        <h3 id="import-title">Nhập / xuất câu hỏi (JSON)</h3>
        <p className="subtle" style={{ marginTop: 0 }}>
          Câu bạn nhập chỉ lưu trong trình duyệt này. Để thêm vĩnh viễn cho mọi người, đưa vào file
          <code> public/data/{manifest.id}/questions-*.json</code> trong repo. Mỗi câu cần đúng 4 phương án,
          <code> answer</code> là vị trí đáp án đúng (0-3), <code>section</code> là một trong {sectionIds.join(', ')}.
        </p>
        <textarea
          className="input"
          placeholder={SAMPLE}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          aria-label="Dán JSON câu hỏi"
        />
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" onClick={() => applyImport(importText)} disabled={!importText.trim()}>
            Nhập từ ô trên
          </button>
          <label className="btn btn-ghost">
            Chọn file .json
            <input type="file" accept="application/json,.json" onChange={onFile} hidden />
          </label>
          <button
            className="btn btn-ghost"
            onClick={() =>
              download(`cia-${manifest.id}-${data.questions.length}-cau.json`, JSON.stringify(data.questions, null, 2))
            }
          >
            Xuất toàn bộ ({data.questions.length})
          </button>
          {data.customCount > 0 && (
            <button className="btn btn-danger" onClick={clearCustom}>
              Xóa {data.customCount} câu tự nhập
            </button>
          )}
        </div>
        {status && (
          <div className={`notice notice-${status.type}`} style={{ marginTop: 12, whiteSpace: 'pre-line' }} role="status">
            {status.message}
          </div>
        )}
      </section>
    </div>
  );
}
