export default function Navbar({ shortAddress, connecting, isCorrectChain, onConnect, onDisconnect, onSwitch }) {
  return (
    <nav style={S.nav}>
      <div style={S.logo}>
        <div style={S.icon}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        </div>
        <span style={S.name}>OPN Swap</span>
        <span style={S.net}><span style={S.dot}/> OPN Testnet</span>
      </div>
      <div style={S.right}>
        <a href="https://testnet.iopn.tech" target="_blank" rel="noreferrer" style={S.link}>Explorer</a>
        <a href="https://iopn.gitbook.io/iopn" target="_blank" rel="noreferrer" style={S.link}>Docs</a>
        {shortAddress ? (
          <div style={{ display:'flex', gap:6 }}>
            {!isCorrectChain && (
              <button onClick={onSwitch} style={{ ...S.btn, background:'#FFF3CD', color:'#856404', border:'1px solid #FDEAB0' }}>
                Switch network
              </button>
            )}
            <button onClick={onDisconnect} style={S.addrBtn}>
              <span style={S.dot2}/>{shortAddress}
            </button>
          </div>
        ) : (
          <button onClick={onConnect} disabled={connecting} style={S.btn}>
            {connecting ? 'Connecting…' : 'Connect wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}

const S = {
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:64, background:'white', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:50 },
  logo: { display:'flex', alignItems:'center', gap:10 },
  icon: { width:32, height:32, borderRadius:10, background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center' },
  name: { fontSize:17, fontWeight:600, color:'var(--text)' },
  net: { display:'flex', alignItems:'center', gap:5, background:'#E8FBF6', color:'#0B8A6A', fontSize:12, fontWeight:500, padding:'4px 10px', borderRadius:999, marginLeft:4 },
  dot: { width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block' },
  dot2: { width:7, height:7, borderRadius:'50%', background:'var(--green)', display:'inline-block' },
  right: { display:'flex', alignItems:'center', gap:8 },
  link: { fontSize:14, color:'var(--text2)', textDecoration:'none', padding:'6px 10px', borderRadius:8 },
  btn: { background:'var(--purple)', color:'#fff', border:'none', borderRadius:999, padding:'9px 20px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' },
  addrBtn: { display:'flex', alignItems:'center', gap:7, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:999, padding:'7px 14px', fontSize:13, fontWeight:500, color:'var(--text)', cursor:'pointer', fontFamily:'var(--mono)' },
};
