import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysisById } from '../services/api';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';

const AnalysisDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAnalysisById(id);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Could not load analysis.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="container" style={{ padding: '60px 24px' }}><LoadingSpinner label="Loading analysis…" /></div>;

  if (error) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <p className="empty-state__title">{error}</p>
        <Link to="/history" className="btn btn--secondary mt-4">← Back to History</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <Link
        to="/history"
        id="btn-back-history"
        className="btn btn--secondary btn--sm mb-6"
        style={{ display: 'inline-flex' }}
      >
        ← Back to History
      </Link>
      {data && (
        <ResultCard
          data={data.parsedResult}
          wordCount={data.wordCount}
          createdAt={data.createdAt}
          onReset={() => window.history.back()}
        />
      )}
    </div>
  );
};

export default AnalysisDetailPage;
