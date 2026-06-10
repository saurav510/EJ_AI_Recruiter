import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getResumeHistory, deleteResume } from '../services/resumeApi';
import LoadingSpinner from '../components/LoadingSpinner';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ResumeHistoryPage = () => {
  const [resumes, setResumes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getResumeHistory(p, 10);
      setResumes(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(page); }, [fetchHistory, page]);

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this resume analysis?')) return;
    setDeletingId(id);
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message || 'Delete failed.');
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
          <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>📁 Resume History</h1>
          <p className="text-sm text-muted">
            {pagination ? `${pagination.total} resumes parsed` : 'Past resume analyses'}
          </p>
        </div>
        <Link to="/resume" id="btn-new-resume" className="btn btn--primary">
          <span>📤</span><span>Parse New Resume</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading history…" />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state__icon">⚠️</div>
          <p className="empty-state__title">{error}</p>
          <button className="btn btn--secondary mt-4" onClick={() => fetchHistory(page)}>Retry</button>
        </div>
      ) : resumes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <p className="empty-state__title">No resumes parsed yet</p>
          <p className="empty-state__desc">Upload your first resume to see it here.</p>
          <Link to="/resume" className="btn btn--primary mt-6">Upload Resume</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {resumes.map((item, idx) => (
            <Link
              key={item._id}
              to={`/resume/${item._id}`}
              id={`resume-card-${idx}`}
              className="history-card animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-4" style={{ flex: 1, minWidth: 0 }}>
                {/* File type icon */}
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                    background: item.fileType === 'pdf' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                  }}
                >
                  {item.fileType === 'pdf' ? '📄' : '📝'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="history-card__title">
                    {item.parsedResult?.candidateName || 'Unknown Candidate'}
                  </p>
                  <div className="history-card__meta">
                    {item.parsedResult?.currentRole && (
                      <span className="badge badge--violet">{item.parsedResult.currentRole}</span>
                    )}
                    {item.parsedResult?.currentCompany && (
                      <span className="text-sm text-muted">🏢 {item.parsedResult.currentCompany}</span>
                    )}
                    {item.parsedResult?.experienceYears > 0 && (
                      <span className="text-sm text-muted">⏱ {item.parsedResult.experienceYears}y exp</span>
                    )}
                    {item.fileSize && (
                      <span className="text-sm text-muted">{formatBytes(item.fileSize)}</span>
                    )}
                    <span className="text-sm text-muted">🕐 {formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id={`btn-delete-resume-${item._id}`}
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
          <button id="btn-resume-prev" className="btn btn--secondary btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span className="text-sm text-muted">Page {pagination.page} of {pagination.pages}</span>
          <button id="btn-resume-next" className="btn btn--secondary btn--sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default ResumeHistoryPage;
