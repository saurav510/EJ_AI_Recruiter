import { useState, useRef } from 'react';
import { parseResume } from '../services/resumeApi';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileIcon = ({ type }) => (
  <div
    style={{
      width: 48,
      height: 48,
      borderRadius: 'var(--radius-md)',
      background:
        type === 'pdf'
          ? 'rgba(239,68,68,0.15)'
          : 'rgba(59,130,246,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.4rem',
      flexShrink: 0,
    }}
  >
    {type === 'pdf' ? '📄' : '📝'}
  </div>
);

const ResumeUpload = ({ onResult }) => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [stage, setStage] = useState(''); // 'uploading' | 'parsing' | ''
  const inputRef = useRef(null);

  const validateFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      return 'Only PDF and DOCX files are accepted.';
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `File too large. Max size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileSelect = (f) => {
    const err = validateFile(f);
    if (err) { setError(err); setFile(null); return; }
    setError('');
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const handleInputChange = (e) => {
    const f = e.target.files[0];
    if (f) handleFileSelect(f);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadPct(0);
    setStage('uploading');
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const result = await parseResume(formData, (evt) => {
        if (evt.lengthComputable) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setUploadPct(pct);
          if (pct === 100) setStage('parsing');
        }
      });
      onResult(result.data);
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      setStage('');
      setUploadPct(0);
    }
  };

  const ext = file ? file.name.split('.').pop().toLowerCase() : '';

  // ── Upload progress UI ────────────────────────────────────────────────────
  if (uploading) {
    return (
      <div className="spinner-container animate-fade-in">
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stage label */}
          <div className="flex items-center gap-3">
            <div className="spinner-ring" style={{ width: 36, height: 36 }}>
              <div className="spinner-ring__track" style={{ width: 36, height: 36 }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                {stage === 'uploading' ? 'Uploading resume…' : 'Parsing with Gemini AI…'}
              </p>
              <p className="text-sm text-muted">
                {stage === 'uploading'
                  ? `${uploadPct}% — ${formatBytes(file.size)} file`
                  : 'Extracting structured data — this may take 15–30s'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              background: 'var(--bg-input)',
              borderRadius: 999,
              height: 6,
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-light))',
                width: stage === 'parsing' ? '100%' : `${uploadPct}%`,
                transition: stage === 'parsing'
                  ? 'width 25s linear'
                  : 'width 0.3s ease',
                boxShadow: '0 0 10px var(--accent-glow)',
              }}
            />
          </div>

          {/* Stage badges */}
          <div className="flex items-center gap-3">
            {['Upload', 'Extract Text', 'AI Parse', 'Save'].map((s, i) => {
              const done =
                (stage === 'uploading' && i < 1) ||
                (stage === 'parsing' && i < 2);
              const active =
                (stage === 'uploading' && i === 0) ||
                (stage === 'parsing' && i === 1);
              return (
                <div
                  key={s}
                  className="flex items-center gap-2"
                  style={{ fontSize: '0.78rem', color: done || active ? 'var(--accent-light)' : 'var(--text-muted)' }}
                >
                  <span>{done ? '✅' : active ? '⏳' : '○'}</span>
                  <span>{s}</span>
                  {i < 3 && <span style={{ color: 'var(--border)' }}>›</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Main upload UI ────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} id="resume-form">
      {/* Drop zone */}
      <div
        id="resume-dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent-primary)' : file ? 'var(--accent-secondary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          background: dragging
            ? 'rgba(124,58,237,0.07)'
            : file
            ? 'rgba(6,214,160,0.04)'
            : 'var(--bg-input)',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'var(--transition)',
          position: 'relative',
        }}
      >
        <input
          ref={inputRef}
          id="resume-file-input"
          type="file"
          accept=".pdf,.docx"
          onChange={handleInputChange}
          style={{ display: 'none' }}
          aria-label="Upload resume file"
        />

        {!file ? (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📂</div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Drop your resume here
            </p>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
              or click to browse files
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="badge badge--violet">PDF</span>
              <span className="badge badge--emerald">DOCX</span>
              <span className="text-sm text-muted">Max {MAX_SIZE_MB}MB</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4" style={{ textAlign: 'left', justifyContent: 'center' }}>
            <FileIcon type={ext} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, wordBreak: 'break-word' }}>
                {file.name}
              </p>
              <div className="flex items-center gap-3">
                <span className={`badge ${ext === 'pdf' ? 'badge--amber' : 'badge--violet'}`}>
                  {ext.toUpperCase()}
                </span>
                <span className="text-sm text-muted">{formatBytes(file.size)}</span>
              </div>
            </div>
            <span style={{ color: 'var(--accent-secondary)', fontSize: '1.2rem' }}>✅</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: 12,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: 'var(--accent-danger)',
            fontSize: '0.875rem',
            display: 'flex',
            gap: 8,
          }}
        >
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
        {file ? (
          <button
            type="button"
            id="btn-clear-resume"
            className="btn btn--secondary btn--sm"
            onClick={() => { setFile(null); setError(''); }}
          >
            ✕ Remove file
          </button>
        ) : (
          <p className="text-sm text-muted">💡 Text-based PDFs give the best results</p>
        )}
        <button
          type="submit"
          id="btn-parse-resume"
          className="btn btn--primary btn--lg"
          disabled={!file}
        >
          <span>🧠</span>
          <span>Parse Resume</span>
        </button>
      </div>
    </form>
  );
};

export default ResumeUpload;
