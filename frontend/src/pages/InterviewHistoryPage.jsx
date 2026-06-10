import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getInterviewHistory, deleteSession } from '../services/interviewApi';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORY_ICONS = { technicalQuestions: '⚙️', behavioralQuestions: '🧠', scenarioQuestions: '🎭', skillGapQuestions: '📈' };

const InterviewHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true); setError('');
    try {
      const res = await getInterviewHistory(p, 10);
      setSessions(res.data);
      setPagination(res.pagination);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(page); }, [fetchData, page]);

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this interview kit?')) return;
    setDeletingId(id);
    try {
      await deleteSession(id);
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
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>🎙️ Interview Kits</h1>
          <p className="text-sm text-muted">
            {pagination ? `${pagination.total} interview kits generated` : 'Past interview sessions'}
          </p>
        </div>
        <Link to="/interview" id="btn-new-kit" className="btn btn--primary">
          <span>🎙️</span><span>New Kit</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading kits…" />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state__icon">⚠️</div>
          <p className="empty-state__title">{error}</p>
          <button className="btn btn--secondary mt-4" onClick={() => fetchData(page)}>Retry</button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <p className="empty-state__title">No interview kits yet</p>
          <p className="empty-state__desc">Generate your first kit to see it here.</p>
          <Link to="/interview" className="btn btn--primary mt-6">Generate Kit</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session, idx) => (
            <Link
              key={session._id}
              to={`/interview/${session._id}`}
              id={`interview-card-${idx}`}
              className="history-card animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-4" style={{ flex: 1, minWidth: 0 }}>
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
                }}>
                  🎙️
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="history-card__title">
                    {session.candidateName || 'Unknown'} — {session.jobTitle || 'Untitled JD'}
                  </p>
                  <div className="history-card__meta">
                    {session.seniorityLevel && <span className="badge badge--violet">{session.seniorityLevel}</span>}
                    <span className="text-sm text-muted">📋 {session.totalQuestions || 20} questions</span>
                    <div className="flex items-center gap-1">
                      {Object.values(CATEGORY_ICONS).map((icon, i) => (
                        <span key={i} style={{ fontSize: '0.8rem' }}>{icon}</span>
                      ))}
                    </div>
                    <span className="text-sm text-muted">🕐 {formatDate(session.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  id={`btn-delete-session-${session._id}`}
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

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8" style={{ flexWrap: 'wrap' }}>
          <button id="btn-interview-prev" className="btn btn--secondary btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span className="text-sm text-muted">Page {pagination.page} of {pagination.pages}</span>
          <button id="btn-interview-next" className="btn btn--secondary btn--sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default InterviewHistoryPage;
