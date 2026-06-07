import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createUrl } from '../utils/api';

const CreateUrlForm = ({ onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState({
    originalUrl: '',
    customAlias: '',
    title: '',
    expiresAt: '',
    clickLimit: '',
    tags: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.originalUrl.trim()) {
      return toast.error('Please enter a URL');
    }

    setLoading(true);

    try {
      const payload = {
        originalUrl: form.originalUrl.trim(),
        customAlias: form.customAlias.trim() || undefined,
        title: form.title.trim() || undefined,
        expiresAt: form.expiresAt || undefined,
        clickLimit: form.clickLimit ? parseInt(form.clickLimit) : undefined,
        tags: form.tags
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const res = await createUrl(payload);

      toast.success('Short link created!');
      onCreated(res.data.data);

      setForm({
        originalUrl: '',
        customAlias: '',
        title: '',
        expiresAt: '',
        clickLimit: '',
        tags: '',
      });

      setShowAdvanced(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-url-card">
      <div className="create-url-header">
        <h2 className="create-url-title">Shorten a URL</h2>
        <p className="create-url-subtitle">
          Create trackable, branded short links in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="create-url-form">
        <input
          name="originalUrl"
          value={form.originalUrl}
          onChange={handleChange}
          placeholder="https://your-long-url.com/paste/here"
          className="input create-url-input"
          autoComplete="off"
        />

        <button
          type="submit"
          className="btn btn-primary btn-lg create-url-button"
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : '⚡ Shorten'}
        </button>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="advanced-toggle"
        >
          {showAdvanced ? '▲' : '▼'} Advanced options
        </button>

        {showAdvanced && (
          <div className="advanced-grid animate-fade-in">
            <div className="input-group">
              <label className="input-label">Custom Alias</label>
              <div className="alias-row">
                <span className="alias-prefix">lnkfrg.io/</span>
                <input
                  name="customAlias"
                  value={form.customAlias}
                  onChange={handleChange}
                  placeholder="my-link"
                  className="input alias-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Link Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Summer Campaign"
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Expiry Date</label>
              <input
                name="expiresAt"
                value={form.expiresAt}
                onChange={handleChange}
                type="datetime-local"
                className="input"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Click Limit</label>
              <input
                name="clickLimit"
                value={form.clickLimit}
                onChange={handleChange}
                type="number"
                placeholder="e.g. 1000"
                className="input"
                min="1"
              />
            </div>

            <div className="input-group advanced-full">
              <label className="input-label">Tags</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="marketing, campaign, q4"
                className="input"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateUrlForm;