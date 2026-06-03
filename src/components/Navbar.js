export default function Navbar({ shortAddress, connecting, onConnect, onDisconnect }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        </div>
        <span style={styles.logoText}>OPN Swap</span>
        <span style={styles.networkBadge}>
          <span style={styles.networkDot} />
          OPN Testnet
        </span>
      </div>

      <div style={styles.right}>
        <a href="https://testnet.iopn.tech" target="_blank" rel="noreferrer" style={styles.link}>Explorer</a>
        <a href="https://iopn.gitbook.io/iopn" target="_blank" rel="noreferrer" style={styles.link}>Docs</a>
        {shortAddress ? (
          <button onClick={onDisconnect} style={styles.addressBtn}>
            <span style={styles.dot} />
            {shortAddress}
          </button>
        ) : (
          <button onClick={onConnect} disabled={connecting} style={styles.connectBtn}>
            {connecting ? 'Connecting…' : 'Connect wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 64, background: 'var(--surface)',
    borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 32, height: 32, borderRadius: 10,
    background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 17, fontWeight: 600, color: 'var(--text)' },
  networkBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'var(--green-light)', color: '#0B8A6A',
    fontSize: 12, fontWeight: 500, padding: '4px 10px',
    borderRadius: 'var(--radius-full)', marginLeft: 4,
  },
  networkDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  link: {
    fontSize: 14, color: 'var(--text2)', textDecoration: 'none',
    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
    transition: 'color 0.15s',
  },
  addressBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)', padding: '7px 14px',
    fontSize: 13, fontWeight: 500, color: 'var(--text)',
    cursor: 'pointer', fontFamily: 'var(--mono)',
  },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' },
  connectBtn: {
    background: 'var(--purple)', color: '#fff', border: 'none',
    borderRadius: 'var(--radius-full)', padding: '9px 20px',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font)', transition: 'opacity 0.15s',
  },
};
