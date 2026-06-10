import { useState, useEffect } from 'react';
import { generateOutreach, fetchMatchList } from '../services/outreachApi';
import OutreachCard from '../components/OutreachCard';
import LoadingSpinner from '../components/LoadingSpinner';

const InputField = ({ id, label, value, onChange, placeholder, type = 'text', optional }) => (
  <div className="form-group">
    <label htmlFor={id} className="form-label">
      {label}
      {optional && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>(optional)</span>}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        background: 'var(--bg-input)',
        border: `1px solid ${value ? 'var(--border-accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontFamily: 'inherit',
        fontSize: '0.9rem',
        padding: '12px 16px',
        outline: 'none',
        transition: 'var(--transition)',
      }}
    />
  </div>
);

const OutreachPage = () => {
  const [form, setForm] = useState({
    candidateName: '',
    jobTitle: '',
    companyName: '',
    matchScore: '',
    matchId: '',
  });
  const [matchList, setMatchList] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    fetchMatchList().then((list) => {
      setMatchList(list);
      setFetching(false);
    });
  }, []);

  // Auto-fill from match selection
  const handleMatchSelect = (matchId) => {
    set('matchId')(matchId);
    if (!matchId) return;
    const match = matchList.find((m) => m._id === matchId);
    if (!match) return;
    if (match.candidateSnapshot?.candidateName) set('candidateName')(match.candidateSnapshot.candidateName);
    if (match.jobSnapshot?.jobTitle) set('jobTitle')(match.jobSnapshot.jobTitle);
    if (match.matchResult?.overallScore != null) set('matchScore')(String(match.matchResult.overallScore));
  };

  const canGenerate = form.candidateName.trim() && form.jobTitle.trim() && form.companyName.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        candidateName: form.candidateName.trim(),
        jobTitle: form.jobTitle.trim(),
        companyName: form.companyName.trim(),
        matchScore: Number(form.matchScore) || 0,
        ...(form.matchId ? { matchId: form.matchId } : {}),
      };
      const res = await generateOutreach(payload);
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 80 }}>
        <LoadingSpinner label="Crafting personalised outreach messages…" />
        <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 8 }}>
          Generating WhatsApp, Email & Follow-Up for {form.candidateName || 'candidate'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {!result && (
        <div className="hero">
          <div className="hero__eyebrow">
            <span>✉️</span>
            <span>Outreach Generator</span>
          </div>
          <h1 className="hero__title">
            Craft Personalised<br />Candidate Outreach
          </h1>
          <p className="hero__subtitle">
            Enter the candidate and role details — Gemini generates a complete
            WhatsApp + Email + Follow-Up sequence engineered for high response rates.
          </p>
          <div className="stat-strip">
            <div className="stat-item">
              <div className="stat-item__value">3</div>
              <div className="stat-item__label">Channels</div>
            </div>
            <div className="stat-item">
              <div className="stat-item__value">Pro Tone</div>
              <div className="stat-item__label">Recruitment-Grade</div>
            </div>
            <div className="stat-item">
              <div className="stat-item__value">1-Click</div>
              <div className="stat-item__label">Copy to Clipboard</div>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingBottom: 80 }}>
        {result ? (
          <OutreachCard data={result} onReset={() => setResult(null)} />
        ) : (
          <div className="card" style={{ padding: 32, maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>✉️ Configure Outreach</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 28 }}>
              Fill in the details below or select an existing match to auto-populate.
            </p>

            <form onSubmit={handleSubmit} id="outreach-form">

              {/* Optional: auto-fill from match */}
              {!fetching && matchList.length > 0 && (
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">
                    🎯 Auto-fill from Match Analysis
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>(optional)</span>
                  </label>
                  <select
                    id="outreach-select-match"
                    value={form.matchId}
                    onChange={(e) => handleMatchSelect(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: `1px solid ${form.matchId ? 'var(--border-accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      color: form.matchId ? 'var(--text-primary)' : 'var(--text-muted)',
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
                    <option value="">Select a match to auto-populate fields…</option>
                    {matchList.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.jobSnapshot?.jobTitle || 'JD'} ↔ {m.candidateSnapshot?.candidateName || 'Candidate'} ({m.matchResult?.overallScore || 0}/100)
                      </option>
                    ))}
                  </select>
                  {form.matchId && (
                    <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--accent-secondary)' }}>
                      ✅ Fields auto-populated — edit below if needed
                    </p>
                  )}
                </div>
              )}

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 24px' }} />

              <div className="flex flex-col gap-4">
                <InputField
                  id="outreach-candidate-name"
                  label="👤 Candidate Name"
                  value={form.candidateName}
                  onChange={set('candidateName')}
                  placeholder="e.g. Priya Sharma"
                />
                <InputField
                  id="outreach-job-title"
                  label="💼 Job Title"
                  value={form.jobTitle}
                  onChange={set('jobTitle')}
                  placeholder="e.g. Senior Backend Engineer"
                />
                <InputField
                  id="outreach-company-name"
                  label="🏢 Company Name"
                  value={form.companyName}
                  onChange={set('companyName')}
                  placeholder="e.g. Zepto"
                />
                <InputField
                  id="outreach-match-score"
                  label="🎯 Match Score"
                  value={form.matchScore}
                  onChange={set('matchScore')}
                  placeholder="e.g. 82"
                  type="number"
                  optional
                />
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)', fontSize: '0.875rem', display: 'flex', gap: 8 }}>
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
                <p className="text-sm text-muted">WhatsApp · Email · Follow-Up — all personalised</p>
                <button
                  type="submit"
                  id="btn-generate-outreach"
                  className="btn btn--primary btn--lg"
                  disabled={!canGenerate}
                >
                  <span>✉️</span>
                  <span>Generate Outreach Kit</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutreachPage;
