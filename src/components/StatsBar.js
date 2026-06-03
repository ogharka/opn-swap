export default function StatsBar() {
  const stats = [
    { label: '24h Volume', value: '$1.24M' },
    { label: 'Total Swaps', value: '8,491' },
    { label: 'Liquidity', value: '$3.8M' },
    { label: 'Avg Gas', value: '0.002 OPN' },
  ];
  return (
    <div style={{ display:'flex', justifyContent:'center', borderBottom:'1px solid var(--border)', background:'white' }}>
      {stats.map((s,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 24px', borderRight:'1px solid var(--border)', fontSize:13 }}>
          <span style={{ color:'var(--text3)' }}>{s.label}</span>
          <span style={{ color:'var(--text)', fontWeight:600, fontFamily:'var(--mono)' }}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}
