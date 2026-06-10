import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getHistory, deleteAnalysis } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const HistoryPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getHistory(p, 10);
      setAnalyses(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(page);
  }, [fetchHistory, page]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📂 Analysis History</h1>
          <p className="text-sm text-muted">
            {pagination ? `${pagination.total} total analyses` : 'Browse past JD analyses'}
          </p>
        </div>
        <Link to="/" id="btn-new-analysis" className="btn btn--primary">
          <span>✨</span>
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading history…" />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state__icon">⚠️</div>
          <p className="empty-state__title">{error}</p>
          <button className="btn btn--secondary mt-4" onClick={() => fetchHistory(page)}>
            Retry
          </button>
        </div>
      ) : analyses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <p className="empty-state__title">No analyses yet</p>
          <p className="empty-state__desc">
            Analyze your first job description to see it here.
          </p>
          <Link to="/" className="btn btn--primary mt-6">
            Get Started
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {analyses.map((item, idx) => (
            <Link
              key={item._id}
              to={`/history/${item._id}`}
              id={`history-card-${idx}`}
              className="history-card animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="history-card__title">
                  {item.parsedResult?.jobTitle || 'Untitled Position'}
                </p>
                <div className="history-card__meta">
                  {item.parsedResult?.seniorityLevel && (
                    <span className="badge badge--violet">
                      {item.parsedResult.seniorityLevel}
                    </span>
                  )}
                  {item.parsedResult?.location && (
                    <span className="text-sm text-muted">
                      📍 {item.parsedResult.location}
                    </span>
                  )}
                  {item.wordCount && (
                    <span className="text-sm text-muted">
                      📄 {item.wordCount} words
                    </span>
                  )}
                  <span className="text-sm text-muted">
                    🕐 {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id={`btn-delete-${item._id}`}
                  className="btn btn--sm btn--danger"
                  onClick={(e) => handleDelete(e, item._id)}
                  disabled={deletingId === item._id}
                  aria-label="Delete analysis"
                >
                  {deletingId === item._id ? '…' : '🗑'}
                </button>
                <span className="history-card__arrow">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div
          className="flex items-center justify-center gap-3 mt-8"
          style={{ flexWrap: 'wrap' }}
        >
          <button
            id="btn-prev-page"
            className="btn btn--secondary btn--sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>
          <span className="text-sm text-muted">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            id="btn-next-page"
            className="btn btn--secondary btn--sm"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
