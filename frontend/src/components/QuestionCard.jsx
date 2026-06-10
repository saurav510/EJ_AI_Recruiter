import { useState } from 'react';

const DIFFICULTY_STYLE = {
  Easy:   { color: '#06d6a0', bg: 'rgba(6,214,160,0.1)',   border: 'rgba(6,214,160,0.2)'   },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
  Hard:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
};

const QuestionCard = ({ question, index, category }) => {
  const [expanded, setExpanded] = useState(false);
  const diff = DIFFICULTY_STYLE[question.difficulty] || DIFFICULTY_STYLE.Medium;

  return (
    <div
      className="animate-fade-in"
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
        transition: 'var(--transition)',
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Question header — always visible */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        {/* Number badge */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--accent-glow)',
            border: '1px solid var(--border-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-light)',
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          {index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 8, fontSize: '0.95rem' }}>
            {question.question}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: 999,
                background: diff.bg,
                border: `1px solid ${diff.border}`,
                color: diff.color,
                letterSpacing: '0.04em',
              }}
            >
              {question.difficulty}
            </span>
            {question.evaluationCriteria?.length > 0 && (
              <span className="text-sm text-muted">
                {question.evaluationCriteria.length} criteria
              </span>
            )}
            {question.followUpQuestions?.length > 0 && (
              <span className="text-sm text-muted">
                {question.followUpQuestions.length} follow-ups
              </span>
            )}
          </div>
        </div>

        <span
          style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▾
        </span>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div
          style={{
            padding: '0 20px 20px 62px',
            borderTop: '1px solid var(--border)',
            paddingTop: 16,
          }}
        >
          {/* Expected Answer */}
          {question.expectedAnswer && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>
                💡 Strong Answer Should Cover
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, padding: '10px 14px', background: 'rgba(124,58,237,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--accent-primary)' }}>
                {question.expectedAnswer}
              </p>
            </div>
          )}

          {/* Evaluation Criteria */}
          {question.evaluationCriteria?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>
                ✅ Evaluation Criteria
              </p>
              <ul className="result-section__list">
                {question.evaluationCriteria.map((c, i) => (
                  <li key={i} style={{ color: '#06d6a0', fontSize: '0.875rem' }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-ups */}
          {question.followUpQuestions?.length > 0 && (
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>
                🔍 Follow-Up Probes
              </p>
              <ul className="result-section__list">
                {question.followUpQuestions.map((q, i) => (
                  <li key={i} style={{ color: 'var(--accent-light)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                    "{q}"
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
