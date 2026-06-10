import { useState, useEffect } from 'react';
import { generateQuestions, fetchAllLists } from '../services/interviewApi';
import InterviewPanel from '../components/InterviewPanel';
import LoadingSpinner from '../components/LoadingSpinner';

const SelectField = ({ id, label, options, value, onChange, placeholder, optional }) => (
  <div className="form-group">
    <label htmlFor={id} className="form-label">
      {label}{optional && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>(optional)</span>}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        background: 'var(--bg-input)',
        border: `1px solid ${value ? 'var(--border-accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        color: value ? 'var(--text-primary)' : 'var(--text-muted)',
        fontFamily: 'inherit',
        fontSize: '0.9rem',
        padding: '12px 40px 12px 16px',
        outline: 'none',
        cursor: 'pointer',
        transition: 'var(--transition)',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const InterviewPage = () => {
  const [jdList, setJdList] = useState([]);
  const [resumeList, setResumeList] = useState([]);
  const [matchList, setMatchList] = useState([]);
  const [selectedJd, setSelectedJd] = useState('');
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedMatch, setSelectedMatch] = useState('');
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllLists().then(([jds, resumes, matches]) => {
      setJdList(jds.map((j) => ({
        value: j._id,
        label: `${j.parsedResult?.jobTitle || 'Untitled JD'} ${j.parsedResult?.seniorityLevel ? `(${j.parsedResult.seniorityLevel})` : ''}`,
      })));
      setResumeList(resumes.map((r) => ({
        value: r._id,
        label: `${r.parsedResult?.candidateName || 'Unknown'} — ${r.parsedResult?.currentRole || 'Unknown Role'}`,
      })));
      setMatchList(matches.map((m) => ({
        value: m._id,
        label: `${m.jobSnapshot?.jobTitle || 'JD'} ↔ ${m.candidateSnapshot?.candidateName || 'Candidate'} (${m.matchResult?.overallScore || 0}/100)`,
      })));
      setFetching(false);
    });
  }, []);

  const canGenerate = selectedJd && selectedResume;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    try {
      const res = await generateQuestions({
        jdId: selectedJd,
        resumeId: selectedResume,
        ...(selectedMatch ? { matchId: selectedMatch } : {}),
      });
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Question generation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 80 }}>
        <LoadingSpinner label="Generating interview questions…" />
        <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 8 }}>
          Creating 20 tailored questions across 4 categories
        </p>
      </div>
    );
  }

  return (
    <div>
      {!result && (
        <div className="hero">
          <div className="hero__eyebrow">
            <span>🎙️</span>
            <span>Interview Question Generator</span>
          </div>
          <h1 className="hero__title">
            Generate Tailored<br />Interview Question Kits
          </h1>
          <p className="hero__subtitle">
            Select a JD + Resume (+ optional Match Analysis) and Gemini generates
            20 role-specific questions with evaluation criteria and follow-up probes.
          </p>
          <div className="stat-strip">
            <div className="stat-item">
              <div className="stat-item__value">20</div>
              <div className="stat-item__label">Questions</div>
            </div>
            <div className="stat-item">
              <div className="stat-item__value">4</div>
              <div className="stat-item__label">Categories</div>
            </div>
            <div className="stat-item">
              <div className="stat-item__value">3</div>
              <div className="stat-item__label">Criteria/Q</div>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingBottom: 80 }}>
        {result ? (
          <InterviewPanel data={result} onReset={() => setResult(null)} />
        ) : fetching ? (
          <LoadingSpinner label="Loading your analyses…" />
        ) : (
          <div className="card" style={{ padding: 32, maxWidth: 680, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>🎙️ Configure Interview Kit</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 28 }}>
              Select the job and candidate to generate a personalised question set.
            </p>

            <form onSubmit={handleGenerate} id="interview-form">
              <div className="flex flex-col gap-4">
                <SelectField
                  id="interview-select-jd"
                  label="📋 Job Description"
                  options={jdList}
                  value={selectedJd}
                  onChange={setSelectedJd}
                  placeholder={jdList.length === 0 ? 'No JDs yet — analyze one first' : 'Select job description…'}
                />
                <SelectField
                  id="interview-select-resume"
                  label="👤 Candidate Resume"
                  options={resumeList}
                  value={selectedResume}
                  onChange={setSelectedResume}
                  placeholder={resumeList.length === 0 ? 'No resumes yet — parse one first' : 'Select candidate resume…'}
                />

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

                <SelectField
                  id="interview-select-match"
                  label="🎯 Match Analysis"
                  options={matchList}
                  value={selectedMatch}
                  onChange={setSelectedMatch}
                  placeholder={matchList.length === 0 ? 'No match analyses yet' : 'Select match analysis (enriches Skill Gap questions)…'}
                  optional
                />

                {/* Info box about match */}
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(124,58,237,0.06)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-accent)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <span>ℹ️</span>
                  <span>Adding a match analysis seeds the <strong style={{ color: 'var(--accent-light)' }}>Skill Gap</strong> questions with the exact gaps identified during scoring.</span>
                </div>
              </div>

              {/* No data warning */}
              {(jdList.length === 0 || resumeList.length === 0) && (
                <div style={{ marginTop: 20, padding: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--accent-warning)' }}>
                  ⚠️ You need at least one analyzed JD and one parsed resume. Use <strong>Analyze JD</strong> and <strong>Parse Resume</strong> first.
                </div>
              )}

              {error && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)', fontSize: '0.875rem', display: 'flex', gap: 8 }}>
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
                <p className="text-sm text-muted">5 questions · 4 categories · 20 total</p>
                <button
                  type="submit"
                  id="btn-generate-questions"
                  className="btn btn--primary btn--lg"
                  disabled={!canGenerate}
                >
                  <span>🎙️</span>
                  <span>Generate Interview Kit</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
