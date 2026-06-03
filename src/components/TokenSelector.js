import { useState, useRef, useEffect } from 'react';
import { TOKENS } from '../tokens';

export default function TokenSelector({ selected, exclude, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = TOKENS.filter(t =>
    t.symbol !== exclude &&
    (t.symbol.toLowerCase().includes(query.toLowerCase()) || t.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div style={{ position: 'relative', flexShrink: 0 }} ref={ref}>
      <button onClick={() => setOpen(o => !o)} style={S.trigger}>
        <span style={{ ...S.badge, background: selected.bg, color: selected.color }}>{selected.symbol.slice(0,4)}</span>
        <span style={S.sym}>{selected.symbol}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={S.dropdown}>
          <input autoFocus placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} style={S.search} />
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {filtered.map(t => (
              <button key={t.symbol} onClick={() => { onSelect(t); setOpen(false); setQuery(''); }} style={S.option}>
                <span style={{ ...S.badge, background: t.bg, color: t.color, width: 32, height: 32, fontSize: 10 }}>{t.symbol.slice(0,4)}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{t.symbol}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.name}</div>
                </div>
              </button>
            ))}
            {!filtered.length && <div style={{ padding: 16, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No tokens found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  trigger: { display: 'flex', alignItems: 'center', gap: 7, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '7px 12px 7px 7px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font)' },
  badge: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--mono)' },
  sym: { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  dropdown: { position: 'absolute', top: 'calc(100% + 8px)', left: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 10, zIndex: 200, minWidth: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  search: { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: 'var(--surface2)', color: 'var(--text)', outline: 'none', marginBottom: 6, fontFamily: 'var(--font)' },
  option: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', fontFamily: 'var(--font)' },
};
