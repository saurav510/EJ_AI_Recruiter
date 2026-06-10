import { useState } from 'react';
import ResumeUpload from '../components/ResumeUpload';
import ResumeResultCard from '../components/ResumeResultCard';

const ResumePage = () => {
  const [result, setResult] = useState(null);

  const handleResult = (data) => {
    setResult(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero */}
      {!result && (
        <div className="hero">
          <div className="hero__eyebrow">
            <span>📄</span>
            <span>Resume Intelligence</span>
          </div>
          <h1 className="hero__title">
            Parse Any Resume<br />Into Structured Data
          </h1>
          <p className="hero__subtitle">
            Upload a PDF or DOCX resume — Gemini 2.5 Pro extracts candidate
            details, skills, experience, education, and projects automatically.
          </p>
          <div className="stat-strip">
            <div className="stat-item">
              <div className="stat-item__value">13</div>
              <div className="stat-item__label">Data Fields</div>
            </div>
            <div className="stat-item">
              <div className="stat-item__value">PDF+DOCX</div>
              <div className="stat-item__label">Formats</div>
            </div>
            <div className="stat-item">
              <div className="stat-item__value">10MB</div>
              <div className="stat-item__label">Max File Size</div>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingBottom: 80 }}>
        {!result ? (
          <div className="card" style={{ padding: 32 }}>
            <div className="flex items-center gap-2 mb-6">
              <h2 style={{ fontSize: '1.2rem' }}>📤 Upload Resume</h2>
            </div>
            <ResumeUpload onResult={handleResult} />
          </div>
        ) : (
          <ResumeResultCard
            data={result.parsedResult}
            fileName={result.originalFileName}
            fileType={result.fileType}
            createdAt={result.createdAt}
            onReset={() => setResult(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ResumePage;
