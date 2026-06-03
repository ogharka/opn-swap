import { useWallet } from './hooks/useWallet';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import SwapCard from './components/SwapCard';

export default function App() {
  const { account, shortAddress, connecting, connect, disconnect } = useWallet();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        a:hover { color: var(--text) !important; }
        button:not(:disabled):hover { opacity: 0.85; }
      `}</style>

      <Navbar
        shortAddress={shortAddress}
        connecting={connecting}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <StatsBar />

      <main style={styles.main}>
        <div style={styles.hero}>
          <h1 style={styles.h1}>Swap any token</h1>
          <p style={styles.sub}>Best rates on OPN Testnet. Fast, cheap, smooth.</p>
        </div>

        <div style={styles.cardWrap}>
          <SwapCard account={account} onConnect={connect} />
        </div>

        <div style={styles.footer}>
          <span>Powered by IOPN · Chain ID 984 · </span>
          <a href="https://testnet-rpc.iopn.tech" target="_blank" rel="noreferrer" style={{ color: 'var(--purple)', textDecoration: 'none' }}>RPC</a>
          <span> · </span>
          <a href="https://testnet.iopn.tech" target="_blank" rel="noreferrer" style={{ color: 'var(--purple)', textDecoration: 'none' }}>Explorer</a>
        </div>
      </main>
    </div>
  );
}

const styles = {
  main: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '48px 20px 80px',
  },
  hero: { textAlign: 'center', marginBottom: 32 },
  h1: { fontSize: 36, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 8 },
  sub: { fontSize: 16, color: 'var(--text2)', fontWeight: 300 },
  cardWrap: { width: '100%', maxWidth: 460 },
  footer: { marginTop: 40, fontSize: 13, color: 'var(--text3)', textAlign: 'center' },
};
