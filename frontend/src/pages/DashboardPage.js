import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getMyUrls, getOverview } from '../utils/api';
import CreateUrlForm from '../components/CreateUrlForm';
import UrlCard from '../components/UrlCard';
import StatsGrid from '../components/StatsGrid';

const DashboardPage = () => {
  const [urls, setUrls] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchUrls = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyUrls({ page, limit: 10, search });
      setUrls(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchOverview = async () => {
    try {
      const res = await getOverview();
      setOverview(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchUrls();
    fetchOverview();
  }, [fetchUrls]);

  const handleCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
    fetchOverview();
  };

  const handleDeleted = (code) => {
    setUrls((prev) => prev.filter((u) => u.shortCode !== code));
    fetchOverview();
  };

  const stats = overview
    ? [
        {
          icon: '🔗',
          label: 'Total Links',
          value: overview.totalUrls.toLocaleString(),
        },
        {
          icon: '✅',
          label: 'Active Links',
          value: overview.activeUrls.toLocaleString(),
        },
        {
          icon: '👆',
          label: 'Total Clicks',
          value: overview.totalClicks.toLocaleString(),
        },
        {
          icon: '👥',
          label: 'Unique Clicks',
          value: overview.uniqueClicks.toLocaleString(),
        },
      ]
    : [];

  return (
    <main className="dashboard-page">
      <div className="container dashboard-container">
        <section className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage and track all your short links
            </p>
          </div>
        </section>

        {overview && <StatsGrid stats={stats} />}

        <section className="shortener-section">
          <CreateUrlForm onCreated={handleCreated} />
        </section>

        <section className="links-section">
          <div className="links-header">
            <h2 className="links-title">Your Links</h2>

            <div className="links-search">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search links..."
                className="input search-input"
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : urls.length === 0 ? (
            <div className="empty-state">
              <h3>{search ? 'No links match your search' : 'No links yet'}</h3>
              <p>
                {search
                  ? 'Try a different search term'
                  : 'Create your first short link above!'}
              </p>
            </div>
          ) : (
            <div className="url-list">
              {urls.map((url) => (
                <UrlCard
                  key={url._id}
                  url={url}
                  onDeleted={handleDeleted}
                />
              ))}
            </div>
          )}
        </section>

        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
            >
              ← Prev
            </button>

            <span className="pagination-text">
              Page {page} of {pagination.pages}
            </span>

            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.pages, p + 1))
              }
              disabled={page === pagination.pages}
              className="btn btn-secondary btn-sm"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default DashboardPage;