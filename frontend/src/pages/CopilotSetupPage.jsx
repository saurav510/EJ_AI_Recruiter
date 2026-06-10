import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMatchList } from '../services/outreachApi'; // Reusing match fetching
import { startCopilotSession } from '../services/copilotApi';
import LoadingSpinner from '../components/LoadingSpinner';

const CopilotSetupPage = () => {
  const [matchList, setMatchList] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatchList(50).then((list) => {
      setMatchList(list);
      setFetching(false);
    });
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;
    setLoading(true);
    setError('');
    try {
      const res = await startCopilotSession(selectedMatch);
      navigate(`/copilot/chat/${res.data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to start Copilot session.');
      setLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: 80 }}><LoadingSpinner label="Initializing Copilot..." /></div>;

  return (
    <div>
      <div className="hero">
        <div className="hero__eyebrow">
          <span>💬</span>
          <span>Recruiter Copilot</span>
        </div>
        <h1 className="hero__title">Chat with Context</h1>
        <p className="hero__subtitle">
          Select a Candidate Match to spin up an AI Recruiter Copilot. Ask about skill gaps, why they scored what they did, or have it generate custom interview questions.
        </p>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        {fetching ? (
          <LoadingSpinner label="Loading match contexts..." />
        ) : (
          <div className="card" style={{ padding: 32, maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>💬 Start Session</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 28 }}>
              Pick an existing match analysis to seed the Copilot's knowledge.
            </p>

            <form onSubmit={handleStart}>
              <div className="form-group">
                <label className="form-label">🎯 Select Match Context</label>
                <select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: `1px solid ${selectedMatch ? 'var(--border-accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: selectedMatch ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    padding: '12px 40px 12px 16px',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                  }}
                >
                  <option value="">Select a match analysis...</option>
                  {matchList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.jobSnapshot?.jobTitle || 'JD'} ↔ {m.candidateSnapshot?.candidateName || 'Candidate'} ({m.matchResult?.overallScore || 0}/100)
                    </option>
                  ))}
                </select>
              </div>

              {matchList.length === 0 && (
                <div style={{ marginTop: 20, padding: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--accent-warning)' }}>
                  ⚠️ You need at least one Match Analysis to use the Copilot. Please run a Match first.
                </div>
              )}

              {error && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)', fontSize: '0.875rem', display: 'flex', gap: 8 }}>
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={!selectedMatch}
                >
                  <span>💬</span>
                  <span>Start Chat</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopilotSetupPage;
