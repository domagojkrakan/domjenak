import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Potvrda u stilu aplikacije umjesto window.confirm.
// Upotreba: if (await ask({ title, text, ok: 'Otkaži vožnju', danger: true })) …
let open = null;
export function ask(opts) {
  if (!open) return Promise.resolve(window.confirm(opts.text || opts.title));
  return new Promise((resolve) => open({ ...opts, resolve }));
}

export default function ConfirmHost() {
  const [q, setQ] = useState(null);
  const okRef = useRef(null);

  useEffect(() => {
    open = setQ;
    return () => {
      open = null;
    };
  }, []);

  const close = (answer) => {
    q?.resolve(answer);
    setQ(null);
  };

  useEffect(() => {
    if (!q) return undefined;
    okRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return createPortal(
    <AnimatePresence>
      {q && (
        <motion.div
          key="confirm"
          className="trip-overlay confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => close(false)}
        >
          <motion.div
            className="trip-modal confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ scale: 0.85, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-snow" aria-hidden="true" />
            <span className="confirm-icon" aria-hidden="true">
              {q.icon || '🎄'}
            </span>
            <h2 id="confirm-title">{q.title}</h2>
            {q.text && <p className="muted">{q.text}</p>}
            <div className="confirm-actions">
              <button type="button" className="btn-ghost" onClick={() => close(false)}>
                {q.cancel || 'Odustani'}
              </button>
              <button
                ref={okRef}
                type="button"
                className={q.danger ? 'btn-danger' : 'btn-primary'}
                onClick={() => close(true)}
              >
                {q.ok || 'Da'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
