import { useState, useRef, useEffect } from 'react';
import { TOKENS } from '../tokens';

export default function TokenSelector({ selected, exclude, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = TOKENS.filter(t =>
    t.symbol !== exclude &&
    (t.symbol.toLowerCase().includes(query.toLowerCase()) || t.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button onClick={() => setOpen(o => !o)} style={styles.trigger}>
        <span style={{ ...styles.badge, background: selected.bg, color: selected.color }}>{selected.symbol.slice(0,4)}</span>
        <span style={styles.sym}>{selected.symbol}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div style={styles.dropdown}>
          <input
            autoFocus
            placeholder="Search tokens…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={styles.search}
          />
          <div style={styles.list}>
            {filtered.map(t => (
              <button key={t.symbol} onClick={() => { onSelect(t); setOpen(false); setQuery(''); }} style={styles.option}>
                <span style={{ ...styles.badge, background: t.bg, color: t.color, width: 32, height: 32, fontSize: 10 }}>{t.symbol.slice(0,4)}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{t.symbol}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{t.name}</div>
                </div>
                {t.balance > 0 && <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{t.balance.toFixed(2)}</span>}
              </button>
            ))}
            {filtered.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No tokens found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  trigger: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)', padding: '7px 12px 7px 7px',
    cursor: 'pointer', transition: 'var(--transition)',
    whiteSpace: 'nowrap',
  },
  badge: {
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 600, fontFamily: 'var(--mono)',
    flexShrink: 0,
  },
  sym: { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: 12, zIndex: 100,
    minWidth: 240, boxShadow: 'var(--shadow-lg)',
  },
  search: {
    width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    padding: '8px 12px', fontSize: 14, background: 'var(--surface2)',
    color: 'var(--text)', outline: 'none', marginBottom: 8, fontFamily: 'var(--font)',
  },
  list: { maxHeight: 260, overflowY: 'auto' },
  option: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    background: 'none', border: 'none', borderRadius: 'var(--radius-sm)',
    padding: '8px', cursor: 'pointer', transition: 'background 0.12s',
  },
};
