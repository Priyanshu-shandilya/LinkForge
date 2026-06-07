import React from 'react';

const StatsGrid = ({ stats }) => (
  <div style={styles.grid}>
    {stats.map((s, i) => (
      <div key={i} style={{ ...styles.card, '--accent-color': s.color || 'var(--accent)' }}>
        <div style={styles.icon}>{s.icon}</div>
        <div>
          <div style={styles.value}>{s.value}</div>
          <div style={styles.label}>{s.label}</div>
        </div>
      </div>
    ))}
  </div>
);

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  icon: { fontSize: '1.8rem', minWidth: '40px', textAlign: 'center' },
  value: { fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 },
  label: { fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' },
};

export default StatsGrid;
