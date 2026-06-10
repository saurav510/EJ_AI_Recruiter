import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getOutreachHistory, deleteOutreach } from '../services/outreachApi';
import LoadingSpinner from '../components/LoadingSpinner';

const ScoreDot = ({ score }) => {
  const color = score >= 70 ? '#06d6a0' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.78rem', fontWeight: 700, color,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {score}/100
    </span>
  );
};

const OutreachHistoryPage = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getOutreachHistory(p, 10);
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(page); }, [fetchData, page]);

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this outreach kit?')) return;
    setDeletingId(id);
    try {
      await deleteOutreach(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) { alert(err.message); }
    finally { setDeletingId(null); }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>✉️ Outreach History</h1>
          <p className="text-sm text-muted">
            {pagination ? `${pagination.total} outreach kits generated` : 'Past outreach campaigns'}
          </p>
        </div>
        <Link to="/outreach" id="btn-new-outreach-link" className="btn btn--primary">
          <span>✉️</span><span>New Outreach Kit</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading outreach history…" />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state__icon">⚠️</div>
          <p className="empty-state__title">{error}</p>
          <button className="btn btn--secondary mt-4" onClick={() => fetchData(page)}>Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <p className="empty-state__title">No outreach kits yet</p>
          <p className="empty-state__desc">Generate your first personalised outreach to see it here.</p>
          <Link to="/outreach" className="btn btn--primary mt-6">Generate Outreach</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => (
            <Link
              key={item._id}
              to={`/outreach/${item._id}`}
              id={`outreach-card-${idx}`}
              className="history-card animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-4" style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', flexShrink: 0,
                }}>
                  ✉️
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="history-card__title">
                    {item.candidateName} — {item.jobTitle}
                  </p>
                  <div className="history-card__meta">
                    <span className="badge badge--violet">{item.companyName}</span>
                    {item.matchScore > 0 && <ScoreDot score={item.matchScore} />}
                    {item.hiringDecision && (
                      <span className="text-sm text-muted">{item.hiringDecision}</span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      💬 📧 🔄
                    </span>
                    <span className="text-sm text-muted">🕐 {formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  id={`btn-delete-outreach-${item._id}`}
                  className="btn btn--sm btn--danger"
                  onClick={(e) => handleDelete(e, item._id)}
                  disabled={deletingId === item._id}
                >
                  {deletingId === item._id ? '…' : '🗑'}
                </button>
                <span className="history-card__arrow">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8" style={{ flexWrap: 'wrap' }}>
          <button id="btn-outreach-prev" className="btn btn--secondary btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span className="text-sm text-muted">Page {pagination.page} of {pagination.pages}</span>
          <button id="btn-outreach-next" className="btn btn--secondary btn--sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default OutreachHistoryPage;
