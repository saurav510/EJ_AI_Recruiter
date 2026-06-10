import { useState } from 'react';
import { trackCopy } from '../services/outreachApi';

const CHANNEL_CONFIG = {
  whatsapp: {
    icon: '💬',
    label: 'WhatsApp',
    color: '#25d366',
    bg: 'rgba(37,211,102,0.08)',
    border: 'rgba(37,211,102,0.2)',
    badge: 'badge--emerald',
    hint: '80–120 words · Conversational · Reply-driving question',
    type: 'whatsapp',
  },
  followUp: {
    icon: '🔄',
    label: 'Follow-Up',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    badge: 'badge--amber',
    hint: '50–70 words · Non-pushy · Value-add',
    type: 'followUp',
  },
  email: {
    icon: '📧',
    label: 'Email',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.2)',
    badge: 'badge--violet',
    hint: '150–200 words · Subject line included · Structured',
    type: 'email',
  },
};

const CopyButton = ({ text, id, channelType, docId, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (docId) trackCopy(docId, channelType);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      id={id}
      onClick={handleCopy}
      className="btn btn--secondary btn--sm"
      style={{
        background: copied ? 'rgba(6,214,160,0.15)' : undefined,
        color: copied ? '#06d6a0' : undefined,
        border: copied ? '1px solid rgba(6,214,160,0.3)' : undefined,
        transition: 'all 0.2s ease',
        minWidth: 80,
      }}
    >
      {copied ? '✅ Copied' : `📋 Copy ${label}`}
    </button>
  );
};

const MessageBlock = ({ channelKey, message, docId }) => {
  const cfg = CHANNEL_CONFIG[channelKey];

  // Split email: first line is subject, rest is body
  let displayContent = message;
  let subjectLine = null;
  if (channelKey === 'email' && message.startsWith('Subject:')) {
    const lines = message.split('\n');
    subjectLine = lines[0].replace('Subject:', '').trim();
    displayContent = lines.slice(1).join('\n').trim();
  }

  return (
    <div
      style={{
        border: `1px solid ${cfg.border}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Channel header */}
      <div
        style={{
          padding: '14px 20px',
          background: cfg.bg,
          borderBottom: `1px solid ${cfg.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '1.2rem' }}>{cfg.icon}</span>
          <div>
            <p style={{ fontWeight: 700, color: cfg.color, marginBottom: 2 }}>{cfg.label}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cfg.hint}</p>
          </div>
        </div>
        <CopyButton
          text={message}
          id={`btn-copy-${channelKey}`}
          channelType={cfg.type}
          docId={docId}
          label={cfg.label}
        />
      </div>

      {/* Subject line (email only) */}
      {subjectLine && (
        <div
          style={{
            padding: '10px 20px',
            background: 'rgba(124,58,237,0.05)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', flexShrink: 0 }}>
            Subject
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            {subjectLine}
          </span>
        </div>
      )}

      {/* Message body */}
      <div style={{ padding: '20px' }}>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
            margin: 0,
            fontFamily: channelKey === 'whatsapp' ? 'inherit' : 'inherit',
          }}
        >
          {displayContent}
        </p>
      </div>

      {/* Word count */}
      <div
        style={{
          padding: '8px 20px',
          borderTop: '1px solid var(--border)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: 12,
        }}
      >
        <span>{displayContent.trim().split(/\s+/).length} words</span>
        <span>{displayContent.length} chars</span>
      </div>
    </div>
  );
};

const OutreachCard = ({ data, onReset }) => {
  const { id, candidateName, jobTitle, companyName, matchScore,
    whatsappMessage, followUpMessage, emailMessage, createdAt } = data;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  const scoreColor = matchScore >= 70 ? '#06d6a0' : matchScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="card card--glow" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span style={{ fontSize: '1.4rem' }}>✉️</span>
              <h2 style={{ fontSize: '1.25rem' }}>Outreach Kit</h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="badge badge--violet">👤 {candidateName}</span>
              <span className="badge badge--emerald">💼 {jobTitle}</span>
              <span className="badge badge--amber">🏢 {companyName}</span>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: scoreColor,
                  background: `${scoreColor}18`,
                  border: `1px solid ${scoreColor}33`,
                  padding: '2px 10px',
                  borderRadius: 999,
                }}
              >
                🎯 {matchScore}/100 match
              </span>
              {formattedDate && <span className="text-sm text-muted">🕐 {formattedDate}</span>}
            </div>
          </div>
          <button id="btn-new-outreach" className="btn btn--secondary" onClick={onReset}>
            ← Generate New
          </button>
        </div>

        {/* Tip strip */}
        <div
          style={{
            marginTop: 16,
            padding: '10px 14px',
            background: 'rgba(124,58,237,0.06)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            borderLeft: '3px solid var(--accent-primary)',
          }}
        >
          💡 Sequence: Send <strong style={{ color: 'var(--text-primary)' }}>WhatsApp first</strong> →
          wait 5–7 days → send <strong style={{ color: 'var(--text-primary)' }}>Email</strong> →
          wait 3–5 days → send <strong style={{ color: 'var(--text-primary)' }}>Follow-Up</strong>
        </div>
      </div>

      {/* Message blocks */}
      <div className="flex flex-col gap-4">
        <MessageBlock channelKey="whatsapp" message={whatsappMessage} docId={id} />
        <MessageBlock channelKey="email" message={emailMessage} docId={id} />
        <MessageBlock channelKey="followUp" message={followUpMessage} docId={id} />
      </div>

      {/* Copy all */}
      <div className="flex items-center justify-center mt-6">
        <CopyButton
          text={`=== WhatsApp ===\n${whatsappMessage}\n\n=== Email ===\n${emailMessage}\n\n=== Follow-Up ===\n${followUpMessage}`}
          id="btn-copy-all"
          channelType="whatsapp"
          docId={null}
          label="All Messages"
        />
      </div>
    </div>
  );
};

export default OutreachCard;
