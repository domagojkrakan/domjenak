import { useCallback, useEffect, useState } from 'react';
import ZadarScene from './components/ZadarScene.jsx';
import Snow from './components/Snow.jsx';
import Sleigh from './components/Sleigh.jsx';
import Ornaments from './components/Ornaments.jsx';
import Logo from './components/Logo.jsx';
import Music from './components/Music.jsx';
import RapSanta from './components/RapSanta.jsx';
import BabaMraz from './components/BabaMraz.jsx';
import CancelDialog from './components/CancelDialog.jsx';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home.jsx';
import Attendees from './pages/Attendees.jsx';
import Smjestaj from './pages/Smjestaj.jsx';
import Prijevoz from './pages/Prijevoz.jsx';
import SubNav from './components/SubNav.jsx';
import { fetchAttendees } from './api.js';

function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const on = () => setPath(window.location.pathname);
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  const navigate = useCallback((to) => {
    if (to !== window.location.pathname) window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return [path, navigate];
}

export default function App() {
  const [path, navigate] = usePath();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const page = ['/popis', '/smjestaj', '/prijevoz'].find((p) => path.startsWith(p)) || '/';
  const isList = page !== '/';

  const load = useCallback(async () => {
    try {
      setAttendees(await fetchAttendees());
    } catch {
      /* tiho – pokušat ćemo opet */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  const [cancelFor, setCancelFor] = useState(null);
  const onCancelled = (slug) => setAttendees((list) => list.filter((a) => a.slug !== slug));

  const onRegistered = (entry) =>
    setAttendees((list) => (list.some((a) => a.slug === entry.slug) ? list : [...list, entry]));

  return (
    <>
      <div className={`backdrop ${isList ? 'backdrop-dim' : ''}`}>
        <ZadarScene />
        <Sleigh className="sky-sleigh" />
        <Snow />
      </div>
      <Ornaments />
      <RapSanta />
      <BabaMraz />

      <nav className="topbar">
        <a
          href="/"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          <Logo className="brand-logo" />
          <span className="brand-sub">božićni domjenak</span>
        </a>
        <div className="topbar-actions">
          <Music />
          {isList && (
            <button className="nav-pill" onClick={() => navigate('/')}>
              ← Prijava
            </button>
          )}
        </div>
      </nav>

      {page === '/popis' ? (
        <Attendees attendees={attendees} loading={loading} navigate={navigate} onCancel={setCancelFor} subnav={<SubNav path={path} navigate={navigate} />} />
      ) : page === '/smjestaj' ? (
        <Smjestaj attendees={attendees} path={path} navigate={navigate} />
      ) : page === '/prijevoz' ? (
        <Prijevoz attendees={attendees} path={path} navigate={navigate} />
      ) : (
        <Home attendees={attendees} onRegistered={onRegistered} navigate={navigate} onCancel={setCancelFor} />
      )}

      <AnimatePresence>
        {cancelFor && (
          <CancelDialog key="cancel" person={cancelFor} onCancelled={onCancelled} onClose={() => setCancelFor(null)} />
        )}
      </AnimatePresence>

      <footer className="foot">Sretan Božić i uspješnu Novu godinu! ✦ Rentlio tim</footer>
    </>
  );
}
