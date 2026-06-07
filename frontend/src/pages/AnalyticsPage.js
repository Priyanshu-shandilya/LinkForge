import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import toast from 'react-hot-toast';
import { getUrlAnalytics } from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_COLORS = ['#6c63ff', '#ff6b9d', '#22d3a5', '#f59e0b', '#3b82f6', '#ec4899'];

const chartDefaults = {
  responsive: true,
  plugins: { legend: { labels: { color: '#7070a0', font: { size: 12 } } }, tooltip: { backgroundColor: '#161625', borderColor: '#2e2e55', borderWidth: 1, titleColor: '#f0f0ff', bodyColor: '#7070a0' } },
  scales: {
    x: { ticks: { color: '#4a4a6a' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#4a4a6a' }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
};

const AnalyticsPage = () => {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    getUrlAnalytics(code, days)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [code, days]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" />
    </div>
  );

  if (!data) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>No data found.</div>;

  const lineData = {
    labels: data.dailyClicks.map(d => d.date),
    datasets: [{
      label: 'Clicks',
      data: data.dailyClicks.map(d => d.count),
      borderColor: '#6c63ff',
      backgroundColor: 'rgba(108,99,255,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#6c63ff',
    }],
  };

  const makeDonut = (items, label) => ({
    labels: items.slice(0, 6).map(i => i.name),
    datasets: [{ data: items.slice(0, 6).map(i => i.count), backgroundColor: CHART_COLORS, borderWidth: 0 }],
  });

  const makeBar = (items) => ({
    labels: items.slice(0, 8).map(i => i.name),
    datasets: [{
      label: 'Clicks',
      data: items.slice(0, 8).map(i => i.count),
      backgroundColor: 'rgba(108,99,255,0.7)',
      borderRadius: 6,
    }],
  });

  const donutOpts = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { color: '#7070a0', padding: 16, font: { size: 11 } } },
      tooltip: chartDefaults.plugins.tooltip,
    },
  };

  return (
    <div style={styles.page}>
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <Link to="/dashboard" style={styles.back}>← Back to Dashboard</Link>
            <h1 style={styles.title}>/{code}</h1>
            <a href={data.originalUrl} target="_blank" rel="noopener noreferrer" style={styles.origUrl} className="truncate">
              {data.originalUrl}
            </a>
          </div>
          <div style={styles.dayPicker}>
            {[7, 14, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)} className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-secondary'}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Clicks', value: data.totalClicks, icon: '👆' },
            { label: 'Unique Clicks', value: data.uniqueClicks, icon: '👥' },
            { label: `Clicks (${days}d)`, value: data.clicksInPeriod, icon: '📅' },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={styles.statValue}>{s.value.toLocaleString()}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Line Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Clicks Over Time</h3>
          {data.dailyClicks.length === 0 ? (
            <div className="empty-state"><p>No click data in this period</p></div>
          ) : (
            <Line data={lineData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
          )}
        </div>

        {/* Donut Charts Row */}
        <div style={styles.doubleRow}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Devices</h3>
            {data.devices.length > 0 ? (
              <Doughnut data={makeDonut(data.devices)} options={donutOpts} />
            ) : <div className="empty-state"><p>No data</p></div>}
          </div>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Browsers</h3>
            {data.browsers.length > 0 ? (
              <Doughnut data={makeDonut(data.browsers)} options={donutOpts} />
            ) : <div className="empty-state"><p>No data</p></div>}
          </div>
        </div>

        {/* OS Bar */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Operating Systems</h3>
          {data.operatingSystems.length > 0 ? (
            <Bar data={makeBar(data.operatingSystems)} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
          ) : <div className="empty-state"><p>No data</p></div>}
        </div>

        {/* Referers */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Top Referrers</h3>
          {data.referers.length === 0 ? (
            <div className="empty-state"><p>No referrer data</p></div>
          ) : (
            <div style={styles.refTable}>
              {data.referers.slice(0, 10).map((r, i) => (
                <div key={i} style={styles.refRow}>
                  <span style={styles.refName}>{r.name}</span>
                  <div style={styles.refBarWrap}>
                    <div style={{ ...styles.refBar, width: `${(r.count / data.referers[0].count) * 100}%` }} />
                  </div>
                  <span style={styles.refCount}>{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: 'calc(100vh - 60px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  back: { color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '8px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--accent-bright)' },
  origUrl: { color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '500px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dayPicker: { display: 'flex', gap: '6px', alignItems: 'center' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' },
  statIcon: { fontSize: '1.5rem', marginBottom: '8px' },
  statValue: { fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 },
  statLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' },
  chartCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '20px' },
  chartTitle: { fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '20px', color: 'var(--text)' },
  doubleRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  refTable: { display: 'flex', flexDirection: 'column', gap: '10px' },
  refRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  refName: { width: '160px', fontSize: '0.85rem', color: 'var(--text)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  refBarWrap: { flex: 1, height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' },
  refBar: { height: '100%', background: 'var(--accent)', borderRadius: '4px', transition: 'width 0.6s ease' },
  refCount: { width: '40px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 },
};

export default AnalyticsPage;
