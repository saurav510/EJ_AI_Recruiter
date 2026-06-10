import SkillTag from './SkillTag';

const Field = ({ icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="result-section" style={{ padding: '16px 20px' }}>
      <div className="result-section__header" style={{ marginBottom: 8 }}>
        <span className="result-section__icon">{icon}</span>
        <h4 className="result-section__title">{label}</h4>
      </div>
      <p className="result-section__value">{value}</p>
    </div>
  );
};

const TagsField = ({ icon, label, items, variant = 'mandatory' }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="result-section" style={{ padding: '16px 20px' }}>
      <div className="result-section__header" style={{ marginBottom: 10 }}>
        <span className="result-section__icon">{icon}</span>
        <h4 className="result-section__title">{label}</h4>
      </div>
      <div className="result-section__tags">
        {items.map((item, i) => (
          <SkillTag key={i} label={item} variant={variant} />
        ))}
      </div>
    </div>
  );
};

const EducationEntry = ({ edu }) => (
  <div
    style={{
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      marginBottom: 8,
    }}
  >
    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
      {edu.degree}{edu.field ? ` — ${edu.field}` : ''}
    </p>
    <p className="text-sm text-muted">
      {edu.institution}{edu.year ? ` · ${edu.year}` : ''}
    </p>
  </div>
);

const ProjectEntry = ({ project }) => (
  <div
    style={{
      padding: '16px',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      marginBottom: 10,
    }}
  >
    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.name}</p>
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.78rem', color: 'var(--accent-light)', textDecoration: 'none' }}
        >
          🔗 View
        </a>
      )}
    </div>
    {project.description && (
      <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
        {project.description}
      </p>
    )}
    {project.technologies && project.technologies.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {project.technologies.map((t, i) => (
          <SkillTag key={i} label={t} variant="neutral" />
        ))}
      </div>
    )}
  </div>
);

const ResumeResultCard = ({ data, fileName, fileType, createdAt, onReset }) => {
  const {
    candidateName, email, phone, location, experienceYears,
    currentCompany, currentRole, skills, education, certifications,
    projects, summary,
  } = data;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div className="animate-fade-in">
      {/* Header card */}
      <div className="card card--glow" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', flexShrink: 0,
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              👤
            </div>
            <div>
              <h2 style={{ marginBottom: 6 }}>
                {candidateName || 'Candidate'}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {currentRole && <span className="badge badge--violet">{currentRole}</span>}
                {experienceYears > 0 && (
                  <span className="badge badge--amber">{experienceYears} yrs exp</span>
                )}
              </div>
            </div>
          </div>
          <button id="btn-parse-new-resume" className="btn btn--secondary" onClick={onReset}>
            ← Parse Another
          </button>
        </div>

        {/* Contact strip */}
        <div
          className="flex items-center gap-4 flex-wrap"
          style={{
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          {email && <span>📧 {email}</span>}
          {phone && <span>📱 {phone}</span>}
          {location && <span>📍 {location}</span>}
          {currentCompany && <span>🏢 {currentCompany}</span>}
          {fileName && <span>📄 {fileName}</span>}
          {formattedDate && <span>🕐 {formattedDate}</span>}
        </div>

        {/* Summary */}
        {summary && (
          <div
            style={{
              marginTop: 16,
              padding: '14px 16px',
              background: 'rgba(124,58,237,0.06)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--accent-primary)',
            }}
          >
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {summary}
            </p>
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="result-grid" style={{ marginBottom: 16 }}>
        <Field icon="⏱" label="Experience" value={experienceYears > 0 ? `${experienceYears} years` : null} />
        <Field icon="🏢" label="Current Company" value={currentCompany} />
        <Field icon="💼" label="Current Role" value={currentRole} />
        <Field icon="📍" label="Location" value={location} />
        <Field icon="📧" label="Email" value={email} />
        <Field icon="📱" label="Phone" value={phone} />
      </div>

      {/* Skills */}
      <TagsField icon="⚡" label="Skills" items={skills} variant="mandatory" />

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="result-section mt-4" style={{ padding: '16px 20px' }}>
          <div className="result-section__header" style={{ marginBottom: 10 }}>
            <span className="result-section__icon">🏅</span>
            <h4 className="result-section__title">Certifications</h4>
          </div>
          <div className="result-section__tags">
            {certifications.map((c, i) => (
              <SkillTag key={i} label={c} variant="optional" />
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="result-section mt-4" style={{ padding: '16px 20px' }}>
          <div className="result-section__header" style={{ marginBottom: 12 }}>
            <span className="result-section__icon">🎓</span>
            <h4 className="result-section__title">Education</h4>
          </div>
          {education.map((edu, i) => <EducationEntry key={i} edu={edu} />)}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="result-section mt-4" style={{ padding: '16px 20px' }}>
          <div className="result-section__header" style={{ marginBottom: 12 }}>
            <span className="result-section__icon">🚀</span>
            <h4 className="result-section__title">Projects ({projects.length})</h4>
          </div>
          {projects.map((p, i) => <ProjectEntry key={i} project={p} />)}
        </div>
      )}

      {/* Raw JSON */}
      <details
        style={{
          marginTop: 24,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
        }}
      >
        <summary style={{ cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, userSelect: 'none' }}>
          🔍 View raw JSON response
        </summary>
        <pre
          id="resume-raw-json"
          className="font-mono"
          style={{
            marginTop: 12, padding: 16,
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

export default ResumeResultCard;
