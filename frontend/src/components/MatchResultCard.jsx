import ScoreRing from './ScoreRing';

const DECISION_CONFIG = {
  'Strong Hire': { color: '#06d6a0', bg: 'rgba(6,214,160,0.12)', border: 'rgba(6,214,160,0.25)', icon: '🚀' },
  'Hire':        { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)', icon: '✅' },
  'Maybe':       { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: '🤔' },
  'No Hire':     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: '❌' },
};

const ListSection = ({ icon, title, items, color }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="result-section" style={{ padding: '16px 20px' }}>
      <div className="result-section__header" style={{ marginBottom: 12 }}>
        <span className="result-section__icon">{icon}</span>
        <h4 className="result-section__title">{title}</h4>
      </div>
      <ul className="result-section__list">
        {items.map((item, i) => (
          <li key={i} style={{ color: color || 'var(--text-secondary)' }}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const ScoreBar = ({ label, score }) => {
  const color = score >= 70 ? '#06d6a0' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.85rem', color, fontWeight: 700 }}>{score}/100</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          borderRadius: 999,
          width: `${score}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 8px ${color}66`,
          transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
};

const MatchResultCard = ({ data, onReset }) => {
  const { jobSnapshot, candidateSnapshot, matchResult, createdAt } = data;
  const {
    overallScore, skillMatchScore, experienceMatchScore, educationMatchScore,
    strengths, skillGaps, risks, recommendation, hiringDecision,
  } = matchResult;

  const decisionCfg = DECISION_CONFIG[hiringDecision] || DECISION_CONFIG['Maybe'];

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div className="animate-fade-in">

      {/* ── Hiring Decision Banner ── */}
      <div
        style={{
          marginBottom: 24,
          padding: '20px 28px',
          borderRadius: 'var(--radius-lg)',
          background: decisionCfg.bg,
          border: `1px solid ${decisionCfg.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '2rem' }}>{decisionCfg.icon}</span>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
              Hiring Decision
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: decisionCfg.color }}>
              {hiringDecision}
            </p>
          </div>
        </div>
        <button id="btn-new-match" className="btn btn--secondary" onClick={onReset}>
          ← New Match
        </button>
      </div>

      {/* ── Header card — Job vs Candidate ── */}
      <div className="card card--glow" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 24,
            alignItems: 'center',
          }}
        >
          {/* Job */}
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Job Description
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {jobSnapshot.jobTitle || 'Untitled Position'}
            </p>
            <div className="flex flex-wrap gap-2">
              {jobSnapshot.seniorityLevel && <span className="badge badge--violet">{jobSnapshot.seniorityLevel}</span>}
              {jobSnapshot.industry && <span className="badge badge--emerald">{jobSnapshot.industry}</span>}
              {jobSnapshot.experienceRequired && <span className="text-sm text-muted">⏱ {jobSnapshot.experienceRequired}</span>}
            </div>
          </div>

          {/* VS */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)',
          }}>
            VS
          </div>

          {/* Candidate */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Candidate
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {candidateSnapshot.candidateName || 'Unknown Candidate'}
            </p>
            <div className="flex flex-wrap gap-2" style={{ justifyContent: 'flex-end' }}>
              {candidateSnapshot.currentRole && <span className="badge badge--amber">{candidateSnapshot.currentRole}</span>}
              {candidateSnapshot.experienceYears > 0 && <span className="text-sm text-muted">⏱ {candidateSnapshot.experienceYears}y exp</span>}
            </div>
          </div>
        </div>

        {formattedDate && (
          <p className="text-sm text-muted" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            🕐 Analyzed {formattedDate}
          </p>
        )}
      </div>

      {/* ── Score Rings ── */}
      <div
        className="card"
        style={{
          padding: '28px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        <ScoreRing score={overallScore} size={120} strokeWidth={10} label="Overall" />
        <ScoreRing score={skillMatchScore} size={88} strokeWidth={8} label="Skills" />
        <ScoreRing score={experienceMatchScore} size={88} strokeWidth={8} label="Experience" />
        <ScoreRing score={educationMatchScore} size={88} strokeWidth={8} label="Education" />
      </div>

      {/* ── Score Bars ── */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20, fontSize: '0.95rem' }}>📊 Score Breakdown</h3>
        <ScoreBar label="Skill Match (50% weight)" score={skillMatchScore} />
        <ScoreBar label="Experience Match (30% weight)" score={experienceMatchScore} />
        <ScoreBar label="Education Match (20% weight)" score={educationMatchScore} />
      </div>

      {/* ── Analysis sections ── */}
      <div className="result-grid" style={{ marginBottom: 16 }}>
        <ListSection icon="💪" title="Strengths" items={strengths} color="var(--accent-secondary)" />
        <ListSection icon="⚠️" title="Skill Gaps" items={skillGaps} color="var(--accent-warning)" />
        {risks && risks.length > 0 && (
          <ListSection icon="🚨" title="Risks" items={risks} color="var(--accent-danger)" />
        )}
      </div>

      {/* ── Recommendation ── */}
      {recommendation && (
        <div
          style={{
            marginBottom: 24,
            padding: '20px 24px',
            background: 'rgba(124,58,237,0.06)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--accent-primary)',
          }}
        >
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
            💡 Recommendation
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            {recommendation}
          </p>
        </div>
      )}

      {/* ── Raw JSON ── */}
      <details style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, userSelect: 'none' }}>
          🔍 View raw JSON response
        </summary>
        <pre id="match-raw-json" className="font-mono" style={{ marginTop: 12, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--accent-light)', overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(matchResult, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default MatchResultCard;
