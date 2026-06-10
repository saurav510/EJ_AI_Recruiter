import { useState, useEffect } from 'react';
import { matchCandidate, fetchJDList, fetchResumeList } from '../services/matchApi';
import MatchResultCard from '../components/MatchResultCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SelectField = ({ id, label, options, value, onChange, placeholder }) => (
  <div className="form-group">
    <label htmlFor={id} className="form-label">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: value ? 'var(--text-primary)' : 'var(--text-muted)',
        fontFamily: 'inherit',
        fontSize: '0.9rem',
        padding: '12px 16px',
        outline: 'none',
        cursor: 'pointer',
        transition: 'var(--transition)',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: 40,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const MatchPage = () => {
  const [jdList, setJdList] = useState([]);
  const [resumeList, setResumeList] = useState([]);
  const [selectedJd, setSelectedJd] = useState('');
  const [selectedResume, setSelectedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Load dropdown options
  useEffect(() => {
    const load = async () => {
      setFetching(true);
      const [jdRes, resumeRes] = await Promise.all([fetchJDList(), fetchResumeList()]);
      setJdList(
        (jdRes.data || []).map((j) => ({
          value: j._id,
          label: `${j.parsedResult?.jobTitle || 'Untitled JD'} ${j.parsedResult?.seniorityLevel ? `(${j.parsedResult.seniorityLevel})` : ''}`,
        }))
      );
      setResumeList(
        (resumeRes.data || []).map((r) => ({
          value: r._id,
          label: `${r.parsedResult?.candidateName || 'Unknown'} — ${r.parsedResult?.currentRole || 'Unknown Role'} (${r.parsedResult?.experienceYears || 0}y)`,
        }))
      );
      setFetching(false);
    };
    load();
  }, []);

  const canMatch = selectedJd && selectedResume;

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!canMatch) return;
    setLoading(true);
    setError('');
    try {
      const res = await matchCandidate({ jdId: selectedJd, resumeId: selectedResume });
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Matching failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedJd('');
    setSelectedResume('');
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 80 }}>
        <LoadingSpinner label="Running AI match analysis…" />
        <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 8 }}>
          Comparing job requirements against candidate profile
        </p>
      </div>
    );
  }

  return (
    <div>
      {!result && (
        <div className="hero">
          <div className="hero__eyebrow">
            <span>🎯</span>
            <span>AI Matching Engine</span>
          </div>
          <h1 className="hero__title">
            Match Candidates to<br />Job Descriptions Instantly
          </h1>
          <p className="hero__subtitle">
            Select a parsed JD and a parsed resume — Gemini scores the fit across
            skills, experience, and education with an actionable hiring decision.
          </p>
          <div className="stat-strip">
            <div className="stat-item">
              <div className="stat-item__value">4</div>
              <div className="stat-item__label">Score Dimensions</div>
            </div>
            <div className="stat-item">
              <div className="stat-item__value">0–100</div>
              <div className="stat-item__label">Score Range</div>
            </div>
            <div className="stat-item">
              <div className="stat-item__value">4</div>
              <div className="stat-item__label">Verdicts</div>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingBottom: 80 }}>
        {result ? (
          <MatchResultCard data={result} onReset={handleReset} />
        ) : fetching ? (
          <LoadingSpinner label="Loading your analyses…" />
        ) : (
          <div className="card" style={{ padding: 32, maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>🎯 Select Pair to Match</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 28 }}>
              Choose a job description and a candidate resume from your existing analyses.
            </p>

            <form onSubmit={handleMatch} id="match-form">
              <div className="flex flex-col gap-4">
                <SelectField
                  id="select-jd"
                  label="📋 Job Description"
                  options={jdList}
                  value={selectedJd}
                  onChange={setSelectedJd}
                  placeholder={jdList.length === 0 ? 'No JDs analyzed yet — go analyze one first' : 'Select a job description…'}
                />

                {/* Arrow connector */}
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.2rem' }}>⬇</div>

                <SelectField
                  id="select-resume"
                  label="👤 Candidate Resume"
                  options={resumeList}
                  value={selectedResume}
                  onChange={setSelectedResume}
                  placeholder={resumeList.length === 0 ? 'No resumes parsed yet — go parse one first' : 'Select a candidate resume…'}
                />
              </div>

              {/* Preview chips */}
              {(selectedJd || selectedResume) && (
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  {selectedJd && (
                    <span className="badge badge--violet">
                      ✓ {jdList.find((j) => j.value === selectedJd)?.label?.slice(0, 30)}
                    </span>
                  )}
                  {selectedResume && (
                    <span className="badge badge--emerald">
                      ✓ {resumeList.find((r) => r.value === selectedResume)?.label?.slice(0, 30)}
                    </span>
                  )}
                </div>
              )}

              {/* No data state */}
              {jdList.length === 0 && resumeList.length === 0 && (
                <div
                  style={{
                    marginTop: 20,
                    padding: '16px',
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--accent-warning)',
                  }}
                >
                  ⚠️ You need at least one Analyzed JD and one Parsed Resume to run a match. Use the{' '}
                  <strong>Analyze JD</strong> and <strong>Parse Resume</strong> modules first.
                </div>
              )}

              {error && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--accent-danger)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
                <p className="text-sm text-muted">Scoring: Skills 50% · Experience 30% · Education 20%</p>
                <button
                  type="submit"
                  id="btn-run-match"
                  className="btn btn--primary btn--lg"
                  disabled={!canMatch}
                >
                  <span>🎯</span>
                  <span>Run Match Analysis</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPage;
