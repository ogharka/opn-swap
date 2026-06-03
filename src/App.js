import { useWallet } from './hooks/useWallet';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import SwapCard from './components/SwapCard';

export default function App() {
  const { account, shortAddress, connecting, isCorrectChain, connect, disconnect, switchToOPN } = useWallet();
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Navbar shortAddress={shortAddress} connecting={connecting} isCorrectChain={isCorrectChain} onConnect={connect} onDisconnect={disconnect} onSwitch={switchToOPN} />
      <StatsBar />
      <main style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'48px 20px 80px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <h1 style={{ fontSize:36, fontWeight:600, color:'var(--text)', letterSpacing:'-0.5px', marginBottom:8 }}>Swap any token</h1>
          <p style={{ fontSize:16, color:'var(--text2)', fontWeight:300 }}>Best rates on OPN Testnet. Fast, cheap, smooth.</p>
        </div>
        <div style={{ width:'100%', maxWidth:460 }}>
          <SwapCard account={account} onConnect={connect} />
        </div>
        <div style={{ marginTop:40, fontSize:13, color:'var(--text3)', textAlign:'center' }}>
          Powered by IOPN · Chain ID 984 ·{' '}
          <a href="https://testnet-rpc.iopn.tech" target="_blank" rel="noreferrer" style={{ color:'var(--purple)', textDecoration:'none' }}>RPC</a>
          {' · '}
          <a href="https://testnet.iopn.tech" target="_blank" rel="noreferrer" style={{ color:'var(--purple)', textDecoration:'none' }}>Explorer</a>
        </div>
      </main>
    </div>
  );
}
