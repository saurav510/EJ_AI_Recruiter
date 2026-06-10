import { useState } from 'react';
import QuestionCard from './QuestionCard';

const CATEGORIES = [
  {
    key: 'technicalQuestions',
    label: 'Technical',
    icon: '⚙️',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.12)',
    desc: 'Depth of technical knowledge and hands-on expertise',
  },
  {
    key: 'behavioralQuestions',
    label: 'Behavioral',
    icon: '🧠',
    color: '#06d6a0',
    bg: 'rgba(6,214,160,0.1)',
    desc: 'Past experiences, soft skills, and cultural fit',
  },
  {
    key: 'scenarioQuestions',
    label: 'Scenario',
    icon: '🎭',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    desc: 'Situational judgement and problem-solving approach',
  },
  {
    key: 'skillGapQuestions',
    label: 'Skill Gap',
    icon: '📈',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    desc: 'Addressing gaps and evaluating growth mindset',
  },
];

const InterviewPanel = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState('technicalQuestions');
  const [printMode, setPrintMode] = useState(false);

  const activeCategory = CATEGORIES.find((c) => c.key === activeTab);
  const questions = data[activeTab] || [];

  const totalQuestions = CATEGORIES.reduce((sum, c) => sum + (data[c.key]?.length || 0), 0);

  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="card card--glow" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span style={{ fontSize: '1.5rem' }}>🎙️</span>
              <h2 style={{ fontSize: '1.3rem' }}>Interview Kit</h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {data.candidateName && (
                <span className="badge badge--violet">👤 {data.candidateName}</span>
              )}
              {data.jobTitle && (
                <span className="badge badge--emerald">💼 {data.jobTitle}</span>
              )}
              {data.seniorityLevel && (
                <span className="badge badge--amber">{data.seniorityLevel}</span>
              )}
              <span className="text-sm text-muted">📋 {totalQuestions} questions</span>
              {formattedDate && <span className="text-sm text-muted">🕐 {formattedDate}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-print-questions"
              className="btn btn--secondary btn--sm"
              onClick={() => window.print()}
            >
              🖨️ Print
            </button>
            <button id="btn-new-interview" className="btn btn--secondary" onClick={onReset}>
              ← New Kit
            </button>
          </div>
        </div>
      </div>

      {/* Category tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          flexWrap: 'wrap',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 6,
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeTab === cat.key;
          const count = data[cat.key]?.length || 0;
          return (
            <button
              key={cat.key}
              id={`tab-${cat.key}`}
              onClick={() => setActiveTab(cat.key)}
              style={{
                flex: 1,
                minWidth: 120,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: isActive ? `1px solid ${cat.color}44` : '1px solid transparent',
                background: isActive ? cat.bg : 'transparent',
                color: isActive ? cat.color : 'var(--text-muted)',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                style={{
                  padding: '1px 7px',
                  borderRadius: 999,
                  background: isActive ? `${cat.color}22` : 'var(--bg-input)',
                  fontSize: '0.72rem',
                  color: isActive ? cat.color : 'var(--text-muted)',
                  fontWeight: 700,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active category description */}
      <div
        style={{
          marginBottom: 20,
          padding: '12px 16px',
          background: `${activeCategory.color}0d`,
          borderRadius: 'var(--radius-md)',
          borderLeft: `3px solid ${activeCategory.color}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>{activeCategory.icon}</span>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, fontSize: '0.9rem' }}>
            {activeCategory.label} Questions
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            {activeCategory.desc}
          </p>
        </div>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.78rem',
            color: activeCategory.color,
            fontWeight: 700,
            padding: '3px 10px',
            background: `${activeCategory.color}18`,
            borderRadius: 999,
          }}
        >
          {questions.length} / 5
        </span>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">❓</div>
          <p className="empty-state__title">No questions in this category</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((q, i) => (
            <QuestionCard key={i} question={q} index={i} category={activeTab} />
          ))}
        </div>
      )}

      {/* All questions expand tip */}
      <div
        style={{
          marginTop: 24,
          padding: '12px 16px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span>💡</span>
        <span>Click any question to reveal evaluation criteria, expected answer, and follow-up probes.</span>
      </div>
    </div>
  );
};

export default InterviewPanel;
