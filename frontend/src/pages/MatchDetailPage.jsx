import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMatchById } from '../services/matchApi';
import MatchResultCard from '../components/MatchResultCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MatchDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMatchById(id);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Could not load match.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <LoadingSpinner label="Loading match analysis…" />
    </div>
  );

  if (error) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <p className="empty-state__title">{error}</p>
        <Link to="/match/history" className="btn btn--secondary mt-4">← Back to History</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <Link to="/match/history" id="btn-back-match-history" className="btn btn--secondary btn--sm mb-6" style={{ display: 'inline-flex' }}>
        ← Back to History
      </Link>
      {data && <MatchResultCard data={data} onReset={() => window.history.back()} />}
    </div>
  );
};

export default MatchDetailPage;
