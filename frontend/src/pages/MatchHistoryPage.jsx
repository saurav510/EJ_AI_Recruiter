import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMatchHistory, deleteMatch } from '../services/matchApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ScoreRing from '../components/ScoreRing';

const DECISION_BADGE = {
  'Strong Hire': 'badge--emerald',
  'Hire':        'badge--violet',
  'Maybe':       'badge--amber',
  'No Hire':     '',
};

const MatchHistoryPage = () => {
  const [matches, setMatches] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getMatchHistory(p, 10);
      setMatches(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(page); }, [fetchData, page]);

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this match analysis?')) return;
    setDeletingId(id);
    try {
      await deleteMatch(id);
      setMatches((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>🎯 Match History</h1>
          <p className="text-sm text-muted">
            {pagination ? `${pagination.total} match analyses` : 'Past candidate matches'}
          </p>
        </div>
        <Link to="/match" id="btn-new-match-link" className="btn btn--primary">
          <span>🎯</span><span>New Match</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading matches…" />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state__icon">⚠️</div>
          <p className="empty-state__title">{error}</p>
          <button className="btn btn--secondary mt-4" onClick={() => fetchData(page)}>Retry</button>
        </div>
      ) : matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <p className="empty-state__title">No matches run yet</p>
          <p className="empty-state__desc">Run your first candidate match to see results here.</p>
          <Link to="/match" className="btn btn--primary mt-6">Run a Match</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((item, idx) => {
            const score = item.matchResult?.overallScore ?? 0;
            const decision = item.matchResult?.hiringDecision || '';
            const badgeClass = DECISION_BADGE[decision] || '';

            return (
              <Link
                key={item._id}
                to={`/match/${item._id}`}
                id={`match-card-${idx}`}
                className="history-card animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-4" style={{ flex: 1, minWidth: 0 }}>
                  <ScoreRing score={score} size={56} strokeWidth={5} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="history-card__title">
                      {item.jobSnapshot?.jobTitle || 'Untitled JD'} ↔ {item.candidateSnapshot?.candidateName || 'Unknown'}
                    </p>
                    <div className="history-card__meta">
                      {decision && (
                        <span className={`badge ${badgeClass}`} style={!badgeClass ? { background: 'rgba(239,68,68,0.15)', color: 'var(--accent-danger)' } : {}}>
                          {decision}
                        </span>
                      )}
                      {item.candidateSnapshot?.currentRole && (
                        <span className="text-sm text-muted">{item.candidateSnapshot.currentRole}</span>
                      )}
                      <span className="text-sm text-muted">🕐 {formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    id={`btn-delete-match-${item._id}`}
                    className="btn btn--sm btn--danger"
                    onClick={(e) => handleDelete(e, item._id)}
                    disabled={deletingId === item._id}
                  >
                    {deletingId === item._id ? '…' : '🗑'}
                  </button>
                  <span className="history-card__arrow">›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8" style={{ flexWrap: 'wrap' }}>
          <button id="btn-match-prev" className="btn btn--secondary btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span className="text-sm text-muted">Page {pagination.page} of {pagination.pages}</span>
          <button id="btn-match-next" className="btn btn--secondary btn--sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default MatchHistoryPage;
