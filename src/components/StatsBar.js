export default function StatsBar() {
  const stats = [
    { label: '24h Volume', value: '$1.24M' },
    { label: 'Total Swaps', value: '8,491' },
    { label: 'Liquidity', value: '$3.8M' },
    { label: 'Avg Gas', value: '0.002 OPN' },
  ];
  return (
    <div style={styles.bar}>
      {stats.map((s, i) => (
        <div key={i} style={styles.stat}>
          <span style={styles.label}>{s.label}</span>
          <span style={styles.value}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex', justifyContent: 'center', gap: 0,
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  stat: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 28px', borderRight: '1px solid var(--border)',
    fontSize: 13,
  },
  label: { color: 'var(--text3)' },
  value: { color: 'var(--text)', fontWeight: 600, fontFamily: 'var(--mono)' },
};
