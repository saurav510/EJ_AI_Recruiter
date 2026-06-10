import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getStats, getHistory, deleteAnalysis } from '../services/api';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalJDs: 0,
    totalResumes: 0,
    totalMatches: 0,
    totalOutreach: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        getStats(),
        getHistory(1, 5)
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (historyRes.success && historyRes.data) {
        setHistoryList(historyRes.data);
      }
    } catch (err) {
      console.error('[Dashboard Data Fetch Error]:', err);
    } finally {
      setStatsLoading(false);
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectHistory = (id) => {
    navigate('/pipeline', { state: { preloadedJdId: id } });
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this job analysis?')) return;
    try {
      const res = await deleteAnalysis(id);
      if (res.success) {
        toast.success('Job analysis deleted.');
        // Refresh local data
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete job analysis.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
      
      {/* 1. WELCOME HERO */}
      <div className="hero" style={{ padding: '48px 32px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="hero__eyebrow">
          <span>⚡</span>
          <span>Recruiter Workspace</span>
        </div>
        <h1 className="hero__title" style={{ fontSize: '2.4rem' }}>
          Welcome back, {user?.name || 'Recruiter'}!
        </h1>
        <p className="hero__subtitle" style={{ maxWidth: '650px', margin: 0 }}>
          Manage your job requirements, compare candidate profiles, and automate direct WhatsApp invitation outreach in one simple unified workspace.
        </p>
      </div>

      {/* 2. STATS GRID */}
      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>📊 Sourcing Operations Summary</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {/* Card 1: JDs */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(124, 58, 237, 0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Descriptions</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {statsLoading ? '...' : stats.totalJDs}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Analyzed and parsed</span>
          </div>

          {/* Card 2: Resumes */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(6, 214, 160, 0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidates Parsed</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {statsLoading ? '...' : stats.totalResumes}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Structured profiles</span>
          </div>

          {/* Card 3: Matches */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(239, 68, 68, 0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scorecards Generated</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {statsLoading ? '...' : stats.totalMatches}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Compatibility checks</span>
          </div>

          {/* Card 4: Outreach */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(245, 158, 11, 0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outreach Invitations</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {statsLoading ? '...' : stats.totalOutreach}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Drafts prepared</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '24px'
      }} className="responsive-home-columns">
        
        {/* 3. PRIMARY ACTION WIZARD CARD */}
        <div className="card card--glow" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Launch Recruitment Pipeline</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Upload your Job Description, parse candidate resumes, compare them instantly against requirements, and review generated scorecards & pre-populated WhatsApp messages.
            </p>
          </div>
          <button 
            className="btn btn--primary" 
            onClick={() => navigate('/pipeline')}
            style={{ padding: '12px 24px', fontSize: '0.95rem', fontWeight: 700 }}
          >
            🚀 Start Sourcing Wizard
          </button>
        </div>

        {/* 4. SEARCH HISTORY PANEL */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📂</span> Recent Job Analyses (Search History)
          </h3>
          
          {historyLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--accent-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : historyList.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
              No past job analyses found.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {historyList.map((item) => (
                <div 
                  key={item._id}
                  onClick={() => handleSelectHistory(item._id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.01)';
                  }}
                >
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.parsedResult?.jobTitle || 'Untitled Job'}
                    </h4>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.parsedResult?.seniorityLevel || 'N/A'} &bull; {item.parsedResult?.location || 'N/A'}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn--sm btn--primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectHistory(item._id);
                      }}
                      style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>⚡</span> Load
                    </button>
                    <button
                      className="btn btn--sm btn--secondary"
                      onClick={(e) => handleDeleteHistory(item._id, e)}
                      style={{ padding: '6px 8px', fontSize: '0.76rem', color: 'var(--accent-danger)' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Responsive columns layout style */}
      <style>{`
        @media (max-width: 800px) {
          .responsive-home-columns {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
