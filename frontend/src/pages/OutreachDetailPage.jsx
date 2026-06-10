import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOutreachById } from '../services/outreachApi';
import OutreachCard from '../components/OutreachCard';
import LoadingSpinner from '../components/LoadingSpinner';

const OutreachDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOutreachById(id);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Could not load outreach kit.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <LoadingSpinner label="Loading outreach kit…" />
    </div>
  );

  if (error) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <p className="empty-state__title">{error}</p>
        <Link to="/outreach/history" className="btn btn--secondary mt-4">← Back to History</Link>
      </div>
    </div>
  );

  // Shape the data to match what OutreachCard expects
  const cardData = data ? {
    id: data._id,
    candidateName: data.candidateName,
    jobTitle: data.jobTitle,
    companyName: data.companyName,
    matchScore: data.matchScore,
    whatsappMessage: data.whatsappMessage,
    followUpMessage: data.followUpMessage,
    emailMessage: data.emailMessage,
    createdAt: data.createdAt,
  } : null;

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <Link to="/outreach/history" id="btn-back-outreach-history" className="btn btn--secondary btn--sm mb-6" style={{ display: 'inline-flex' }}>
        ← Back to History
      </Link>
      {cardData && <OutreachCard data={cardData} onReset={() => window.history.back()} />}
    </div>
  );
};

export default OutreachDetailPage;
