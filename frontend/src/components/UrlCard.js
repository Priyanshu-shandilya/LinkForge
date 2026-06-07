import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteUrl, generateQR } from '../utils/api';

const BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const UrlCard = ({ url, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  const shortUrl = `${BASE}/${url.shortCode}`;
  const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl).then(() => toast.success('Copied to clipboard!'));
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this link permanently?')) return;
    setDeleting(true);
    try {
      await deleteUrl(url.shortCode);
      toast.success('Link deleted');
      onDeleted(url.shortCode);
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  const handleQR = async () => {
    try {
      const res = await generateQR(url.shortCode);
      setQrCode(res.data.qrCode);
      setQrModal(true);
    } catch {
      toast.error('Could not generate QR code');
    }
  };

  const getStatusBadge = () => {
    if (isExpired) return <span className="badge badge-danger">Expired</span>;
    if (!url.isActive) return <span className="badge badge-warning">Inactive</span>;
    return <span className="badge badge-success">Active</span>;
  };

  return (
    <>
      <div style={styles.card} className="animate-fade-in">
        <div style={styles.top}>
          <div style={styles.titleRow}>
            <span style={styles.shortCode}>/{url.shortCode}</span>
            {getStatusBadge()}
            {url.customAlias && <span className="badge badge-accent">Custom</span>}
          </div>
          <div style={styles.actions}>
            <button onClick={copyToClipboard} className="btn btn-secondary btn-sm btn-icon" title="Copy">📋</button>
            <button onClick={handleQR} className="btn btn-secondary btn-sm btn-icon" title="QR Code">📲</button>
            <Link to={`/analytics/${url.shortCode}`} className="btn btn-secondary btn-sm">📊 Analytics</Link>
            <button onClick={handleDelete} disabled={deleting} className="btn btn-danger btn-sm btn-icon" title="Delete">🗑</button>
          </div>
        </div>

        {url.title && <p style={styles.title}>{url.title}</p>}

        <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" style={styles.originalUrl} className="truncate">
          {url.originalUrl}
        </a>

        <div style={styles.meta}>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Total Clicks</span>
            <span style={styles.metaValue}>{url.totalClicks?.toLocaleString() ?? 0}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Unique</span>
            <span style={styles.metaValue}>{url.uniqueClicks?.toLocaleString() ?? 0}</span>
          </div>
          {url.expiresAt && (
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Expires</span>
              <span style={{ ...styles.metaValue, color: isExpired ? 'var(--danger)' : 'var(--text-muted)' }}>
                {new Date(url.expiresAt).toLocaleDateString()}
              </span>
            </div>
          )}
          {url.clickLimit && (
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Limit</span>
              <span style={styles.metaValue}>{url.totalClicks}/{url.clickLimit}</span>
            </div>
          )}
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Created</span>
            <span style={styles.metaValue}>{new Date(url.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {url.tags?.length > 0 && (
          <div style={styles.tags}>
            {url.tags.map(tag => (
              <span key={tag} style={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div style={styles.overlay} onClick={() => setQrModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>QR Code</h3>
            <img src={qrCode} alt="QR Code" style={{ width: '200px', height: '200px', borderRadius: '8px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '12px' }}>{shortUrl}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <a href={qrCode} download={`qr-${url.shortCode}.png`} className="btn btn-primary btn-sm">Download</a>
              <button onClick={() => setQrModal(false)} className="btn btn-secondary btn-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'border-color 0.2s',
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  shortCode: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-bright)' },
  actions: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' },
  title: { fontWeight: 500, fontSize: '0.9rem' },
  originalUrl: { color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '600px', display: 'block' },
  meta: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '4px' },
  metaItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  metaLabel: { fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  metaValue: { fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' },
  tags: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  tag: { fontSize: '0.75rem', color: 'var(--accent-bright)', background: 'rgba(108,99,255,0.1)', padding: '2px 8px', borderRadius: '100px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
};

export default UrlCard;
