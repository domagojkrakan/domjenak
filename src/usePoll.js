import { useEffect } from 'react';

// Osvježavanje podataka: odmah, pa svakih `ms` — ali samo dok je kartica vidljiva.
// Kad se korisnik vrati na karticu, odmah povuci svježe podatke.
export default function usePoll(fn, ms = 45000, deps = [], enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    fn();
    const tick = () => {
      if (!document.hidden) fn();
    };
    const id = setInterval(tick, ms);
    const onVisible = () => {
      if (!document.hidden) fn();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ms, enabled, ...deps]);
}
