import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { analyzeJD } from '../services/api';

const MAX_CHARS = 20000;
const MIN_CHARS = 100;

const PLACEHOLDER = `Paste your full job description here…

Example:
We are looking for a Senior Software Engineer to join our growing team at TechCorp...
• 5+ years of experience in React and Node.js
• Strong understanding of REST APIs and microservices
• Experience with AWS or GCP is a plus
...`;

const JDForm = ({ onResult }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const charCount = text.length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

  const counterClass =
    charCount === 0
      ? 'char-counter char-counter--ok'
      : charCount < MIN_CHARS
      ? 'char-counter char-counter--min'
      : charCount > MAX_CHARS
      ? 'char-counter char-counter--max'
      : 'char-counter char-counter--ok';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      const result = await analyzeJD(text);
      onResult(result.data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setError('');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit} id="jd-form" noValidate>
      <div className="form-group">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="jd-textarea" className="form-label">
            Job Description
          </label>
          <div className="flex items-center gap-3">
            {text.length > 0 && (
              <button
                type="button"
                id="btn-clear-jd"
                className="btn btn--sm btn--secondary"
                onClick={handleClear}
              >
                Clear
              </button>
            )}
            <span className={counterClass}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
        </div>

        <textarea
          id="jd-textarea"
          className="form-textarea"
          placeholder={PLACEHOLDER}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_CHARS}
          aria-describedby="jd-hint"
          style={{ minHeight: '300px' }}
        />

        {charCount > 0 && charCount < MIN_CHARS && (
          <p id="jd-hint" className="text-sm" style={{ color: 'var(--accent-warning)' }}>
            ⚠️ At least {MIN_CHARS} characters required ({MIN_CHARS - charCount} more needed)
          </p>
        )}

        {error && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: 'var(--accent-danger)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
        <p className="text-sm text-muted">
          💡 Tip: Paste the complete JD for the most accurate results
        </p>
        <button
          type="submit"
          id="btn-analyze-jd"
          className="btn btn--primary btn--lg"
          disabled={!isValid}
        >
          <span>✨</span>
          <span>Analyze with AI</span>
        </button>
      </div>
    </form>
  );
};

export default JDForm;
