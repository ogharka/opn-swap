import { useState, useCallback } from 'react';
import TokenSelector from './TokenSelector';
import { TOKENS } from '../tokens';

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];

export default function SwapCard({ account, onConnect }) {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [swapping, setSwapping] = useState(false);
  const [swapDone, setSwapDone] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('swap');

  const rate = fromToken.price / toToken.price;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * rate).toFixed(6) : '';
  const fromUsd = fromAmount ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : null;
  const toUsd = toAmount ? (parseFloat(toAmount) * toToken.price).toFixed(2) : null;
  const minReceived = toAmount ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6) : null;
  const hasAmount = parseFloat(fromAmount) > 0;

  const flip = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
  }, [fromToken, toToken]);

  const handleSwap = useCallback(async () => {
    if (!account) { onConnect(); return; }
    setSwapping(true);
    await new Promise(r => setTimeout(r, 1400));
    setSwapping(false);
    setSwapDone(true);
    setFromAmount('');
    setTimeout(() => setSwapDone(false), 2200);
  }, [account, onConnect]);

  const btnLabel = swapDone ? '✓ Swapped!' : swapping ? 'Confirming…' : !account ? 'Connect wallet' : !hasAmount ? 'Enter an amount' : `Swap ${fromToken.symbol} → ${toToken.symbol}`;
  const btnDisabled = swapping || swapDone || (account && !hasAmount);

  return (
    <div style={styles.card}>
      {/* Tabs */}
      <div style={styles.tabs}>
        {['swap', 'limit', 'bridge'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button onClick={() => setShowSettings(s => !s)} style={{ ...styles.tab, marginLeft: 'auto', padding: '6px 10px' }} title="Settings">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div style={styles.settings}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 10 }}>Slippage tolerance</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {SLIPPAGE_OPTIONS.map(s => (
              <button key={s} onClick={() => setSlippage(s)} style={{ ...styles.slipBtn, ...(slippage === s ? styles.slipActive : {}) }}>{s}%</button>
            ))}
          </div>
        </div>
      )}

      {/* From */}
      <div style={styles.panel}>
        <div style={styles.panelLabel}>
          <span>You pay</span>
          <span style={{ color: 'var(--text3)' }}>Balance: {fromToken.balance.toFixed(2)} <span onClick={() => setFromAmount(String(fromToken.balance))} style={{ color: 'var(--purple)', cursor: 'pointer', fontWeight: 500 }}>Max</span></span>
        </div>
        <div style={styles.inputRow}>
          <TokenSelector selected={fromToken} exclude={toToken.symbol} onSelect={setFromToken} />
          <input
            type="number" placeholder="0.00" value={fromAmount}
            onChange={e => setFromAmount(e.target.value)}
            style={styles.amountInput}
          />
        </div>
        {fromUsd && <div style={styles.usdHint}>≈ ${fromUsd}</div>}
      </div>

      {/* Flip */}
      <div style={styles.flipWrap}>
        <button onClick={flip} style={styles.flipBtn} title="Flip tokens">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
        </button>
      </div>

      {/* To */}
      <div style={{ ...styles.panel, marginTop: 0 }}>
        <div style={styles.panelLabel}>
          <span>You receive</span>
          <span style={{ color: 'var(--text3)' }}>Balance: {toToken.balance.toFixed(2)}</span>
        </div>
        <div style={styles.inputRow}>
          <TokenSelector selected={toToken} exclude={fromToken.symbol} onSelect={setToToken} />
          <input
            type="number" placeholder="0.00" value={toAmount} readOnly
            style={{ ...styles.amountInput, color: 'var(--text2)' }}
          />
        </div>
        {toUsd && <div style={styles.usdHint}>≈ ${toUsd}</div>}
      </div>

      {/* Route details */}
      {hasAmount && (
        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span style={styles.detailKey}>Rate</span>
            <span style={styles.detailVal}>1 {fromToken.symbol} = {rate.toFixed(4)} {toToken.symbol}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailKey}>Price impact</span>
            <span style={{ ...styles.detailVal, color: 'var(--green)' }}>&lt; 0.01%</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailKey}>Min received</span>
            <span style={styles.detailVal}>{minReceived} {toToken.symbol}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailKey}>Network fee</span>
            <span style={styles.detailVal}>~0.002 OPN</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailKey}>Route</span>
            <span style={{ ...styles.detailVal, ...styles.routeBadge }}>{fromToken.symbol} → {toToken.symbol}</span>
          </div>
        </div>
      )}

      {/* Swap button */}
      <button
        onClick={handleSwap}
        disabled={btnDisabled}
        style={{
          ...styles.swapBtn,
          ...(swapDone ? styles.swapBtnDone : {}),
          ...(btnDisabled && !swapping && !swapDone ? styles.swapBtnDisabled : {}),
        }}
      >
        {swapping ? <span style={styles.spinner} /> : null}
        {btnLabel}
      </button>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
    padding: 20, boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border)',
  },
  tabs: { display: 'flex', gap: 4, marginBottom: 20, alignItems: 'center' },
  tab: {
    background: 'none', border: 'none', borderRadius: 'var(--radius-sm)',
    padding: '7px 14px', fontSize: 14, fontWeight: 500,
    color: 'var(--text3)', cursor: 'pointer', transition: 'var(--transition)',
    fontFamily: 'var(--font)',
  },
  tabActive: { background: 'var(--surface2)', color: 'var(--text)' },
  settings: {
    background: 'var(--surface2)', borderRadius: 'var(--radius-md)',
    padding: '14px 16px', marginBottom: 16, border: '1px solid var(--border)',
  },
  slipBtn: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '6px 14px',
    fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--text2)',
    fontFamily: 'var(--font)', transition: 'var(--transition)',
  },
  slipActive: { background: 'var(--purple-light)', color: 'var(--purple)', borderColor: 'var(--purple-mid)' },
  panel: {
    background: 'var(--surface2)', borderRadius: 'var(--radius-lg)',
    padding: '14px 16px', marginBottom: 4,
    border: '1.5px solid transparent', transition: 'border-color 0.15s',
  },
  panelLabel: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 13, color: 'var(--text2)', marginBottom: 12,
  },
  inputRow: { display: 'flex', alignItems: 'center', gap: 10 },
  amountInput: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    fontSize: 26, fontWeight: 500, color: 'var(--text)',
    textAlign: 'right', fontFamily: 'var(--mono)', width: 0,
  },
  usdHint: { fontSize: 12, color: 'var(--text3)', textAlign: 'right', marginTop: 6 },
  flipWrap: { display: 'flex', justifyContent: 'center', margin: '2px 0', zIndex: 1, position: 'relative' },
  flipBtn: {
    width: 34, height: 34, borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)', border: '1px solid var(--border)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text2)', transition: 'var(--transition)',
  },
  details: {
    background: 'var(--surface2)', borderRadius: 'var(--radius-md)',
    padding: '12px 14px', margin: '14px 0 4px', border: '1px solid var(--border)',
  },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' },
  detailKey: { fontSize: 13, color: 'var(--text3)' },
  detailVal: { fontSize: 13, fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--mono)' },
  routeBadge: {
    background: 'var(--purple-light)', color: 'var(--purple)',
    borderRadius: 'var(--radius-full)', padding: '2px 10px',
    fontSize: 12, fontFamily: 'var(--font)',
  },
  swapBtn: {
    width: '100%', marginTop: 14, padding: '15px',
    background: 'var(--purple)', color: '#fff',
    border: 'none', borderRadius: 'var(--radius-lg)',
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: 'var(--font)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  swapBtnDisabled: { background: 'var(--surface2)', color: 'var(--text3)', cursor: 'default' },
  swapBtnDone: { background: 'var(--green)' },
  spinner: {
    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite', display: 'inline-block',
  },
};
