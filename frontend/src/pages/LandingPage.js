import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createUrl } from '../utils/api';

const LandingPage = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url.trim()) return toast.error('Enter a URL first');
    setLoading(true);
    try {
      const res = await createUrl({ originalUrl: url.trim() });
      setResult(res.data.data);
      setUrl('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(`${BASE}/${result.shortCode}`);
    toast.success('Copied!');
  };

  return (
    <div style={styles.page}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroGlow} />
        <div style={styles.heroBadge}>
          <span style={styles.badgeDot} />
          Free to use · No signup required for basic links
        </div>
        <h1 style={styles.heroTitle}>
          Short links,<br />
          <span style={styles.heroGradient}>big results.</span>
        </h1>
        <p style={styles.heroSub}>
          Create branded, trackable short URLs with analytics, custom aliases,<br />
          and expiration controls — all in one place.
        </p>

        {/* Quick shorten form */}
        <form onSubmit={handleShorten} style={styles.quickForm}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            style={styles.quickInput}
          />
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flexShrink: 0 }}>
            {loading ? <span className="spinner" /> : '⚡ Shorten it'}
          </button>
        </form>

        {result && (
          <div style={styles.resultBox} className="animate-fade-in">
            <div style={styles.resultLeft}>
              <span style={styles.resultLabel}>Your short link</span>
              <a href={`${BASE}/${result.shortCode}`} target="_blank" rel="noopener noreferrer" style={styles.resultUrl}>
                {BASE}/{result.shortCode}
              </a>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={copy} className="btn btn-primary btn-sm">📋 Copy</button>
              <button onClick={() => navigate('/register')} className="btn btn-secondary btn-sm">Track clicks →</button>
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section style={styles.features}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Everything you need</h2>
          <p style={styles.sectionSub}>Powerful features for individuals and teams</p>
          <div style={styles.featureGrid}>
            {features.map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={styles.featureName}>{f.name}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div style={styles.ctaInner}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '12px' }}>
            Ready to level up your links?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Sign up free and unlock analytics, custom aliases & more.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">Create free account →</Link>
        </div>
      </section>
    </div>
  );
};

const features = [
  { icon: '⚡', name: 'Instant Shortening', desc: 'Generate short URLs in milliseconds with our optimized hashing algorithm.' },
  { icon: '🎯', name: 'Custom Aliases', desc: 'Create memorable branded links like yourdomain.com/promo.' },
  { icon: '📊', name: 'Click Analytics', desc: 'Track clicks, devices, browsers, referrers and geographic data.' },
  { icon: '⏱', name: 'Expiry Controls', desc: 'Set automatic expiration dates or click limits on your links.' },
  { icon: '📲', name: 'QR Codes', desc: 'Auto-generate QR codes for any short link, ready to download.' },
  { icon: '🏷', name: 'Tag & Organize', desc: 'Group links with tags and search through your link library.' },
];

const styles = {
  page: { minHeight: '100vh' },
  hero: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '80px 24px 60px',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: '-100px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '800px',
    height: '500px',
    background: 'radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '100px',
    background: 'rgba(108,99,255,0.1)',
    border: '1px solid rgba(108,99,255,0.3)',
    color: 'var(--accent-bright)',
    fontSize: '0.8rem',
    marginBottom: '28px',
  },
  badgeDot: {
    width: '6px', height: '6px',
    borderRadius: '50%',
    background: 'var(--success)',
    display: 'inline-block',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: '20px',
    letterSpacing: '-0.03em',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #6c63ff 0%, #ff6b9d 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: { color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '560px', marginBottom: '36px', lineHeight: 1.7 },
  quickForm: { display: 'flex', gap: '12px', width: '100%', maxWidth: '680px', marginBottom: '20px' },
  quickInput: {
    flex: 1,
    padding: '14px 18px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontSize: '1rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  resultBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    width: '100%',
    maxWidth: '680px',
    padding: '16px 20px',
    background: 'var(--bg-card)',
    border: '1px solid rgba(108,99,255,0.4)',
    borderRadius: 'var(--radius)',
    flexWrap: 'wrap',
  },
  resultLeft: { display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' },
  resultLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  resultUrl: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-bright)' },
  features: { padding: '80px 0', background: 'rgba(15,15,26,0.5)' },
  sectionTitle: { textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '8px' },
  sectionSub: { textAlign: 'center', color: 'var(--text-muted)', marginBottom: '48px' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' },
  featureCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
    transition: 'border-color 0.2s, transform 0.2s',
  },
  featureIcon: { fontSize: '2rem', marginBottom: '12px' },
  featureName: { fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '8px' },
  featureDesc: { color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 },
  cta: { padding: '80px 24px', textAlign: 'center' },
  ctaInner: { maxWidth: '600px', margin: '0 auto' },
};

export default LandingPage;
