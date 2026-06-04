import { useState, useEffect, useCallback } from 'react';
import TokenSelector from './TokenSelector';
import { TOKENS } from '../tokens';
import { useSwap } from '../hooks/useSwap';
import { ethers } from 'ethers';

const SLIPPAGE = [0.1, 0.5, 1.0];

export default function SwapCard({ account, onConnect }) {
  const [fromToken, setFromToken] = useState(TOKENS[1]);
  const [toToken, setToToken] = useState(TOKENS[2]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('swap');
  const [fromBal, setFromBal] = useState('0');
  const [toBal, setToBal] = useState('0');
  const [quoting, setQuoting] = useState(false);
  const [priceImpact, setPriceImpact] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [lastTx, setLastTx] = useState(null);
  const [swapError, setSwapError] = useState(null);

  const { executeSwap, getQuote, getBalance, claimFaucet } = useSwap(account);

  useEffect(() => {
    if (!account) return;
    if (fromToken.address && fromToken.address !== 'NATIVE')
      getBalance(fromToken.address, account, fromToken.decimals).then(setFromBal);
    if (toToken.address && toToken.address !== 'NATIVE')
      getBalance(toToken.address, account, toToken.decimals).then(setToBal);
  }, [account, fromToken, toToken, getBalance, status]);

  useEffect(() => {
    if (!fromAmount || !parseFloat(fromAmount)) { setToAmount(''); setPriceImpact(null); return; }
    if (!fromToken.address || !toToken.address || fromToken.address === 'NATIVE' || toToken.address === 'NATIVE') {
      setToAmount((parseFloat(fromAmount) * fromToken.price / toToken.price).toFixed(6));
      return;
    }
    setQuoting(true);
    const t = setTimeout(async () => {
      const result = await getQuote(fromToken.address, toToken.address, fromAmount, fromToken.decimals);
      if (result) {
        setToAmount(ethers.formatUnits(result.amountOut, toToken.decimals));
        setPriceImpact((Number(result.priceImpact) / 100).toFixed(2));
      } else {
        setToAmount((parseFloat(fromAmount) * fromToken.price / toToken.price).toFixed(6));
      }
      setQuoting(false);
    }, 400);
    return () => clearTimeout(t);
  }, [fromAmount, fromToken, toToken, getQuote]);

  const flip = () => {
    setFromToken(toToken); setToToken(fromToken);
    setFromAmount(''); setToAmount('');
  };

  const handleSwap = async () => {
    if (!account) { onConnect(); return; }
    setStatus('loading');
    setSwapError(null);
    setLastTx(null);
    try {
      const hash = await executeSwap({
        tokenIn: fromToken, tokenOut: toToken,
        amountIn: fromAmount, slippageBps: Math.round(slippage * 100)
      });
      setLastTx(hash);
      setFromAmount(''); setToAmount('');
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch(e) {
      setSwapError(e.reason || e.message || 'Swap failed');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const hasAmount = parseFloat(fromAmount) > 0;
  const fromUsd = hasAmount ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : null;
  const toUsd = toAmount ? (parseFloat(toAmount) * toToken.price).toFixed(2) : null;
  const minOut = toAmount ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6) : null;

  const btnLabel = status === 'loading' ? 'Confirming…'
    : status === 'done' ? '✓ Swapped!'
    : !account ? 'Connect wallet'
    : !hasAmount ? 'Enter an amount'
    : `Swap ${fromToken.symbol} → ${toToken.symbol}`;

  const btnDisabled = status === 'loading' || status === 'done' || (account && !hasAmount);

  return (
    <div style={S.card}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .flip-btn:hover{background:var(--surface2)!important} .swap-btn:not(:disabled):hover{filter:brightness(0.93)}`}</style>

      <div style={S.tabs}>
        {['swap','limit','bridge'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{...S.tab,...(activeTab===t?S.tabActive:{})}}>
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
        <button onClick={() => setShowSettings(s=>!s)} style={{...S.tab,marginLeft:'auto',padding:'6px 8px',color:showSettings?'var(--purple)':'var(--text3)'}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>

      {showSettings && (
        <div style={S.settingsBox}>
          <div style={{fontSize:12,color:'var(--text2)',marginBottom:8,fontWeight:500}}>Slippage tolerance</div>
          <div style={{display:'flex',gap:6}}>
            {SLIPPAGE.map(s => (
              <button key={s} onClick={() => setSlippage(s)} style={{...S.slipBtn,...(slippage===s?S.slipActive:{})}}>{s}%</button>
            ))}
          </div>
        </div>
      )}

      {account && fromToken.address && fromToken.address !== 'NATIVE' && parseFloat(fromBal) < 1 && (
        <div style={S.faucet}>
          <span style={{fontSize:13,color:'var(--text2)'}}>Need {fromToken.symbol}?</span>
          <button onClick={() => claimFaucet(fromToken.address, fromToken.decimals)} style={S.faucetBtn}>Claim from faucet</button>
        </div>
      )}

      <div style={S.panel}>
        <div style={S.panelTop}>
          <span style={S.panelLabel}>You pay</span>
          <span style={S.panelBal}>
            Balance: <span style={{fontFamily:'var(--mono)',fontWeight:500}}>{parseFloat(fromBal).toFixed(4)}</span>
            {parseFloat(fromBal) > 0 && <span onClick={() => setFromAmount(fromBal)} style={S.maxBtn}>Max</span>}
          </span>
        </div>
        <div style={S.inputRow}>
          <TokenSelector selected={fromToken} exclude={toToken.symbol} onSelect={t => { setFromToken(t); setFromAmount(''); }} />
          <input type="number" placeholder="0.00" value={fromAmount} onChange={e => setFromAmount(e.target.value)} style={S.amtInput} />
        </div>
        {fromUsd && <div style={S.usdHint}>≈ ${fromUsd}</div>}
      </div>

      <div style={S.flipWrap}>
        <button className="flip-btn" onClick={flip} style={S.flipBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
        </button>
      </div>

      <div style={S.panel}>
        <div style={S.panelTop}>
          <span style={S.panelLabel}>You receive</span>
          <span style={S.panelBal}>Balance: <span style={{fontFamily:'var(--mono)',fontWeight:500}}>{parseFloat(toBal).toFixed(4)}</span></span>
        </div>
        <div style={S.inputRow}>
          <TokenSelector selected={toToken} exclude={fromToken.symbol} onSelect={t => { setToToken(t); setToAmount(''); }} />
          <input type="number" placeholder={quoting ? '…' : '0.00'} value={toAmount} readOnly style={{...S.amtInput,color:'var(--text2)'}} />
        </div>
        {toUsd && <div style={S.usdHint}>≈ ${toUsd}</div>}
      </div>

      {hasAmount && toAmount && (
        <div style={S.details}>
          <Row label="Rate" value={`1 ${fromToken.symbol} = ${(fromToken.price/toToken.price).toFixed(4)} ${toToken.symbol}`} />
          <Row label="Price impact" value={priceImpact ? `${priceImpact}%` : '< 0.01%'} valueColor={parseFloat(priceImpact) > 3 ? 'var(--red)' : 'var(--green)'} />
          <Row label="Min received" value={`${minOut} ${toToken.symbol}`} />
          <Row label="Swap fee" value="0.001 OPN" />
          <Row label="Route" value={`${fromToken.symbol} → ${toToken.symbol}`} badge />
        </div>
      )}

      {status === 'error' && swapError && <div style={S.errorBox}>{swapError}</div>}
      {status === 'done' && lastTx && (
        <a href={`https://testnet.iopn.tech/tx/${lastTx}`} target="_blank" rel="noreferrer" style={S.txLink}>View on explorer ↗</a>
      )}

      <button className="swap-btn" onClick={handleSwap} disabled={btnDisabled} style={{
        ...S.swapBtn,
        ...(status==='done'?S.swapBtnDone:{}),
        ...(btnDisabled&&status!=='loading'&&status!=='done'?S.swapBtnOff:{})
      }}>
        {status === 'loading' && <span style={S.spinner} />}
        {btnLabel}
      </button>
    </div>
  );
}

function Row({ label, value, valueColor, badge }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0'}}>
      <span style={{fontSize:13,color:'var(--text3)'}}>{label}</span>
      {badge
        ? <span style={{background:'var(--purple-light)',color:'var(--purple)',borderRadius:99,padding:'2px 10px',fontSize:12,fontWeight:500}}>{value}</span>
        : <span style={{fontSize:13,fontWeight:500,color:valueColor||'var(--text)',fontFamily:'var(--mono)'}}>{value}</span>
      }
    </div>
  );
}

const S = {
  card:{background:'var(--surface)',borderRadius:'var(--radius-xl)',padding:20,boxShadow:'var(--shadow-lg)',border:'1px solid var(--border)'},
  tabs:{display:'flex',gap:4,marginBottom:18,alignItems:'center'},
  tab:{background:'none',border:'none',borderRadius:8,padding:'7px 13px',fontSize:14,fontWeight:500,color:'var(--text3)',cursor:'pointer',fontFamily:'var(--font)'},
  tabActive:{background:'var(--surface2)',color:'var(--text)'},
  settingsBox:{background:'var(--surface2)',borderRadius:12,padding:'12px 14px',marginBottom:14,border:'1px solid var(--border)'},
  slipBtn:{background:'white',border:'1px solid var(--border)',borderRadius:8,padding:'6px 13px',fontSize:13,fontWeight:500,cursor:'pointer',color:'var(--text2)',fontFamily:'var(--font)'},
  slipActive:{background:'var(--purple-light)',color:'var(--purple)',borderColor:'#A29BFE'},
  faucet:{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#FFF9EC',border:'1px solid #FDEAB0',borderRadius:10,padding:'9px 14px',marginBottom:12},
  faucetBtn:{background:'var(--amber)',color:'#7A5200',border:'none',borderRadius:8,padding:'5px 12px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)'},
  panel:{background:'var(--surface2)',borderRadius:'var(--radius-lg)',padding:'13px 15px',marginBottom:3,border:'1.5px solid transparent'},
  panelTop:{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--text2)',marginBottom:11},
  panelLabel:{fontWeight:500},
  panelBal:{color:'var(--text3)',fontSize:12},
  maxBtn:{color:'var(--purple)',cursor:'pointer',fontWeight:600,marginLeft:5,fontSize:12},
  inputRow:{display:'flex',alignItems:'center',gap:10},
  amtInput:{flex:1,background:'none',border:'none',outline:'none',fontSize:26,fontWeight:500,color:'var(--text)',textAlign:'right',fontFamily:'var(--mono)',width:0,minWidth:0},
  usdHint:{fontSize:12,color:'var(--text3)',textAlign:'right',marginTop:5},
  flipWrap:{display:'flex',justifyContent:'center',margin:'2px 0'},
  flipBtn:{width:34,height:34,borderRadius:9,background:'white',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',transition:'background 0.15s'},
  details:{background:'var(--surface2)',borderRadius:12,padding:'11px 13px',margin:'12px 0 2px',border:'1px solid var(--border)'},
  errorBox:{background:'var(--red-light)',color:'var(--red)',borderRadius:10,padding:'9px 14px',fontSize:13,marginTop:10,border:'1px solid #FFCDD2'},
  txLink:{display:'block',textAlign:'center',fontSize:13,color:'var(--purple)',marginTop:8,textDecoration:'none'},
  swapBtn:{width:'100%',marginTop:12,padding:15,background:'var(--purple)',color:'#fff',border:'none',borderRadius:'var(--radius-lg)',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all 0.15s'},
  swapBtnOff:{background:'var(--surface2)',color:'var(--text3)',cursor:'default'},
  swapBtnDone:{background:'var(--green)'},
  spinner:{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'},
};
