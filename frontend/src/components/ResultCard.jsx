import SkillTag from './SkillTag';

const Section = ({ icon, title, children }) => (
  <div className="result-section animate-fade-in">
    <div className="result-section__header">
      <span className="result-section__icon">{icon}</span>
      <h4 className="result-section__title">{title}</h4>
    </div>
    {children}
  </div>
);

const InfoField = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <Section icon={icon} title={label}>
      <p className="result-section__value">{value}</p>
    </Section>
  );
};

const TagsField = ({ icon, label, items, variant }) => {
  if (!items || items.length === 0) return null;
  return (
    <Section icon={icon} title={label}>
      <div className="result-section__tags">
        {items.map((item, i) => (
          <SkillTag key={i} label={item} variant={variant} />
        ))}
      </div>
    </Section>
  );
};

const ListField = ({ icon, label, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <Section icon={icon} title={label}>
      <ul className="result-section__list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </Section>
  );
};

const ResultCard = ({ data, wordCount, createdAt, onReset }) => {
  const {
    jobTitle,
    experienceRequired,
    location,
    employmentType,
    mandatorySkills,
    goodToHaveSkills,
    responsibilities,
    education,
    industry,
    seniorityLevel,
  } = data;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="animate-fade-in">
      {/* Result header */}
      <div
        className="card card--glow"
        style={{ padding: '28px 32px', marginBottom: '24px' }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h2 style={{ marginBottom: '8px' }}>{jobTitle || 'Analyzed Position'}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {seniorityLevel && (
                <span className="badge badge--violet">{seniorityLevel}</span>
              )}
              {industry && (
                <span className="badge badge--emerald">{industry}</span>
              )}
              {employmentType && (
                <span className="badge badge--amber">{employmentType}</span>
              )}
            </div>
          </div>
          <button
            id="btn-analyze-new"
            className="btn btn--secondary"
            onClick={onReset}
          >
            ← Analyze Another
          </button>
        </div>

        {/* Meta strip */}
        <div
          className="flex items-center gap-4 flex-wrap"
          style={{
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          {location && <span>📍 {location}</span>}
          {experienceRequired && <span>⏱ {experienceRequired}</span>}
          {wordCount && <span>📄 {wordCount} words parsed</span>}
          {formattedDate && <span>🕐 {formattedDate}</span>}
        </div>
      </div>

      {/* Results grid */}
      <div className="result-grid">
        <TagsField
          icon="🎯"
          label="Mandatory Skills"
          items={mandatorySkills}
          variant="mandatory"
        />
        <TagsField
          icon="✨"
          label="Good to Have Skills"
          items={goodToHaveSkills}
          variant="optional"
        />
        <InfoField icon="📍" label="Location" value={location} />
        <InfoField icon="⏱" label="Experience Required" value={experienceRequired} />
        <InfoField icon="💼" label="Employment Type" value={employmentType} />
        <InfoField icon="🏢" label="Industry" value={industry} />
        <InfoField icon="📊" label="Seniority Level" value={seniorityLevel} />
        <TagsField
          icon="🎓"
          label="Education Requirements"
          items={education}
          variant="neutral"
        />
        <div style={{ gridColumn: '1 / -1' }}>
          <ListField
            icon="📋"
            label="Key Responsibilities"
            items={responsibilities}
          />
        </div>
      </div>

      {/* Raw JSON toggle */}
      <details
        style={{
          marginTop: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
        }}
      >
        <summary
          style={{
            cursor: 'pointer',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            userSelect: 'none',
          }}
        >
          🔍 View raw JSON response
        </summary>
        <pre
          id="raw-json"
          className="font-mono"
          style={{
            marginTop: '12px',
            padding: '16px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            color: 'var(--accent-light)',
            overflowX: 'auto',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default ResultCard;
