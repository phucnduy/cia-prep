import { useEffect, useState } from 'react';
import { loadIndex } from './lib/data.js';
import { load, save } from './lib/storage.js';
import { Icon } from './components/ui.jsx';
import Home from './components/Home.jsx';
import PartPage from './components/PartPage.jsx';

/** Hash routes: #/  #/p1  #/p1/study  #/p1/bank  #/p1/history  #/p1/session  #/p1/result/<id> */
function parseHash() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { partId: parts[0] || null, view: parts[1] || 'overview', arg: parts[2] || null };
}

function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

function ThemeToggle() {
  const [theme, setTheme] = useState(() => load('theme', null));
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme]);
  const isDark = theme
    ? theme === 'dark'
    : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    save('theme', next);
  };
  return (
    <button className="icon-btn" onClick={toggle} aria-label={isDark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}>
      <Icon name={isDark ? 'sun' : 'moon'} />
    </button>
  );
}

export default function App() {
  const route = useRoute();
  const [index, setIndex] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadIndex().then(setIndex).catch((err) => setError(err.message));
  }, []);

  const manifest = index?.manifests.find((m) => m.id === route.partId);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#/">
            <span className="brand-mark">CIA</span>
            <span>
              CIA Prep
              <small>Ôn thi Certified Internal Auditor</small>
            </span>
          </a>
          <nav className="topnav" aria-label="Phần thi">
            {index?.manifests.map((m) => (
              <a key={m.id} href={`#/${m.id}`} aria-current={route.partId === m.id ? 'page' : undefined}>
                {m.code}
              </a>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main>
        {error && (
          <div className="container" style={{ paddingTop: 40 }}>
            <div className="notice notice-bad">
              Không tải được dữ liệu: {error}. Hãy chạy qua máy chủ web (npm run dev / npm run preview), không mở trực tiếp file.
            </div>
          </div>
        )}
        {!index && !error && <div className="loading">Đang tải dữ liệu...</div>}
        {index && !route.partId && <Home index={index} />}
        {index && route.partId && manifest && <PartPage key={manifest.id} index={index} manifest={manifest} route={route} />}
        {index && route.partId && !manifest && (
          <div className="container empty">
            Không tìm thấy phần thi này. <a href="#/">Về trang chủ</a>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <span>
            Bộ câu hỏi do cộng đồng biên soạn để luyện tập, không phải câu hỏi thi thật. Không liên kết với The Institute of
            Internal Auditors (IIA). CIA® là nhãn hiệu của IIA.
          </span>
          {index && (
            <span>
              Cấu trúc đề theo{' '}
              <a href={index.source} target="_blank" rel="noreferrer">
                {index.syllabusVersion} syllabus
              </a>
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
