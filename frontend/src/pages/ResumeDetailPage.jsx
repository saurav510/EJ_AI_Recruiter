import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResumeById } from '../services/resumeApi';
import ResumeResultCard from '../components/ResumeResultCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ResumeDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getResumeById(id);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Could not load resume.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container" style={{ padding: '60px 24px' }}><LoadingSpinner label="Loading resume…" /></div>;

  if (error) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <p className="empty-state__title">{error}</p>
        <Link to="/resume/history" className="btn btn--secondary mt-4">← Back to History</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <Link to="/resume/history" id="btn-back-resume-history" className="btn btn--secondary btn--sm mb-6" style={{ display: 'inline-flex' }}>
        ← Back to History
      </Link>
      {data && (
        <ResumeResultCard
          data={data.parsedResult}
          fileName={data.originalFileName}
          fileType={data.fileType}
          createdAt={data.createdAt}
          onReset={() => window.history.back()}
        />
      )}
    </div>
  );
};

export default ResumeDetailPage;
