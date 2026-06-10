import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSessionById } from '../services/interviewApi';
import InterviewPanel from '../components/InterviewPanel';
import LoadingSpinner from '../components/LoadingSpinner';

const InterviewDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSessionById(id);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Could not load interview kit.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <LoadingSpinner label="Loading interview kit…" />
    </div>
  );

  if (error) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <p className="empty-state__title">{error}</p>
        <Link to="/interview/history" className="btn btn--secondary mt-4">← Back to History</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <Link to="/interview/history" id="btn-back-interview-history" className="btn btn--secondary btn--sm mb-6" style={{ display: 'inline-flex' }}>
        ← Back to History
      </Link>
      {data && <InterviewPanel data={data} onReset={() => window.history.back()} />}
    </div>
  );
};

export default InterviewDetailPage;
