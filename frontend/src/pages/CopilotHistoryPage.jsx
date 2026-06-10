import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCopilotHistory, deleteCopilotSession } from '../services/copilotApi';
import LoadingSpinner from '../components/LoadingSpinner';

const CopilotHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getCopilotHistory();
      setSessions(res);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this chat session?')) return;
    setDeletingId(id);
    try {
      await deleteCopilotSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) { alert(err.message); }
    finally { setDeletingId(null); }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>💬 Copilot History</h1>
          <p className="text-sm text-muted">Past AI Recruiter chat sessions</p>
        </div>
        <Link to="/copilot" className="btn btn--primary">
          <span>💬</span><span>New Session</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading sessions…" />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state__icon">⚠️</div>
          <p className="empty-state__title">{error}</p>
          <button className="btn btn--secondary mt-4" onClick={fetchData}>Retry</button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <p className="empty-state__title">No chat sessions yet</p>
          <p className="empty-state__desc">Start your first Copilot session to see it here.</p>
          <Link to="/copilot" className="btn btn--primary mt-6">Start Session</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session, idx) => (
            <Link
              key={session._id}
              to={`/copilot/chat/${session._id}`}
              className="history-card animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-4" style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
                }}>
                  💬
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="history-card__title">
                    {session.candidateName || 'Unknown'} — {session.jobTitle || 'Untitled JD'}
                  </p>
                  <div className="history-card__meta">
                    <span className="text-sm text-muted">🕐 Last active: {formatDate(session.updatedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="btn btn--sm btn--danger"
                  onClick={(e) => handleDelete(e, session._id)}
                  disabled={deletingId === session._id}
                >
                  {deletingId === session._id ? '…' : '🗑'}
                </button>
                <span className="history-card__arrow">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CopilotHistoryPage;
