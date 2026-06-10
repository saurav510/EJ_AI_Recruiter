import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import JDForm from '../components/JDForm';
import ResultCard from '../components/ResultCard';
import { runJDPipeline, getHistory, getAnalysisById, deleteAnalysis } from '../services/api';

const AnalyzePage = () => {
  const [step, setStep] = useState('jd_input'); // 'jd_input' | 'jd_result' | 'resume_upload' | 'processing' | 'pipeline_results'
  const [jdResult, setJdResult] = useState(null);
  const [files, setFiles] = useState([]);
  const [calendarLink, setCalendarLink] = useState('');
  const [pipelineResults, setPipelineResults] = useState([]);
  const [activeCandidateIdx, setActiveCandidateIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('scorecard'); // 'scorecard' | 'whatsapp' | 'email'

  // Editable fields for the active candidate
  const [editingPhone, setEditingPhone] = useState('');
  const [editingWhatsAppMsg, setEditingWhatsAppMsg] = useState('');
  const [editingEmailMsg, setEditingEmailMsg] = useState('');

  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await getHistory(1, 5); // Get top 5 recent analyses
      if (res.success && res.data) {
        setHistoryList(res.data);
      }
    } catch (err) {
      console.error('[Fetch History Error]:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.preloadedJdId) {
      handleSelectHistory(location.state.preloadedJdId);
      // Clean location state to prevent reload loops
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (step === 'jd_input') {
      fetchHistory();
    }
  }, [step]);

  const handleSelectHistory = async (id) => {
    try {
      toast.loading('Loading job analysis details...');
      const res = await getAnalysisById(id);
      toast.dismiss();
      if (res.success && res.data) {
        setJdResult({
          id: res.data._id,
          parsedResult: res.data.parsedResult,
          wordCount: res.data.wordCount,
          createdAt: res.data.createdAt
        });
        setStep('jd_result');
        toast.success('Job description loaded from history!');
      } else {
        toast.error('Failed to load job analysis.');
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Failed to load job analysis.');
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job analysis?')) return;
    try {
      const res = await deleteAnalysis(id);
      if (res.success) {
        toast.success('Job analysis deleted successfully.');
        fetchHistory();
      } else {
        toast.error('Failed to delete job analysis.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete job analysis.');
    }
  };

  const handleJdResult = (data) => {
    setJdResult(data);
    setStep('jd_result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setJdResult(null);
    setFiles([]);
    setCalendarLink('');
    setPipelineResults([]);
    setActiveCandidateIdx(0);
    setStep('jd_input');
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file count limit
    if (files.length + selectedFiles.length > 5) {
      toast.error('You can upload a maximum of 5 resumes.');
      return;
    }

    // Validate file extensions
    const invalidFiles = selectedFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ext !== 'pdf' && ext !== 'docx';
    });

    if (invalidFiles.length > 0) {
      toast.error('Only PDF and DOCX files are allowed.');
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);
    toast.success(`${selectedFiles.length} file(s) added successfully.`);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
    toast.success('File removed.');
  };

  const runPipeline = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one resume.');
      return;
    }
    
    setStep('processing');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const response = await runJDPipeline(jdResult.id, files, calendarLink);
      if (response.success && response.data) {
        setPipelineResults(response.data);
        setActiveCandidateIdx(0);
        
        // Initialise editable fields for the first candidate
        const firstCand = response.data[0];
        if (firstCand) {
          setEditingPhone(firstCand.phone || '');
          setEditingWhatsAppMsg(firstCand.whatsappMessage || '');
          setEditingEmailMsg(firstCand.emailMessage || '');
        }

        setStep('pipeline_results');
        toast.success('Recruitment pipeline executed successfully!');
      } else {
        throw new Error('Pipeline execution returned empty data.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Pipeline execution failed. Please try again.');
      setStep('resume_upload');
    }
  };

  const selectCandidate = (idx) => {
    setActiveCandidateIdx(idx);
    const candidate = pipelineResults[idx];
    if (candidate) {
      setEditingPhone(candidate.phone || '');
      setEditingWhatsAppMsg(candidate.whatsappMessage || '');
      setEditingEmailMsg(candidate.emailMessage || '');
    }
  };

  const handleCopyText = (text, type = 'Message') => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleSendWhatsApp = (phone, message) => {
    if (!phone) {
      toast.error('Please enter a valid phone number for the candidate.');
      return;
    }
    // Remove non-numeric characters for the API link
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success('Opening WhatsApp Web / Desktop Application...');
  };

  const handleDownloadReport = (candidate) => {
    if (!candidate) return;

    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Evaluation Report - \${candidate.candidateName}</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #131a2c;
      --border: #232e48;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #7c3aed;
      --primary-glow: rgba(124, 58, 237, 0.15);
      --success: #10b981;
      --success-bg: rgba(16, 185, 129, 0.1);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.1);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.1);
    }
    
    @media print {
      :root {
        --bg: #ffffff;
        --card-bg: #f9fafb;
        --border: #e5e7eb;
        --text: #111827;
        --text-muted: #4b5563;
        --primary: #6d28d9;
        --primary-glow: #f5f3ff;
      }
      body {
        background: #ffffff !important;
        color: #111827 !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .container {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 40px 20px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 30px;
    }

    .candidate-info h1 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .candidate-info p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .score-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .score-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 4px solid var(--primary);
      background: var(--primary-glow);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 800;
    }

    .badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-align: center;
    }

    .badge-emerald {
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .badge-violet {
      background: var(--primary-glow);
      color: var(--primary);
      border: 1px solid rgba(124, 58, 237, 0.2);
    }

    .badge-amber {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 12px;
      border-left: 4px solid var(--primary);
      padding-left: 10px;
    }

    .recommendation-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 600px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }

    .column-box {
      border-radius: 8px;
      padding: 20px;
      height: 100%;
    }

    .strengths-box {
      background: rgba(16, 185, 129, 0.02);
      border: 1px solid rgba(16, 185, 129, 0.15);
    }

    .gaps-box {
      background: rgba(239, 68, 68, 0.02);
      border: 1px solid rgba(239, 68, 68, 0.15);
    }

    .column-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .strengths-title { color: var(--success); }
    .gaps-title { color: var(--danger); }

    ul {
      list-style-type: none;
    }

    li {
      font-size: 0.88rem;
      line-height: 1.5;
      margin-bottom: 10px;
      position: relative;
      padding-left: 14px;
      color: var(--text-muted);
    }

    li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: inherit;
    }

    .footer {
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      padding-top: 20px;
      margin-top: 40px;
    }

    .no-print-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 20px;
      text-decoration: none;
    }

    .no-print-btn:hover {
      background: #6d28d9;
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto;" class="no-print">
    <button class="no-print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="container">
    <div class="header">
      <div class="candidate-info">
        <h1>\${candidate.candidateName}</h1>
        <p>📧 \${candidate.email || 'N/A'} &bull; 📞 \${candidate.phone || 'N/A'}</p>
        <p style="margin-top: 4px; font-size: 0.85rem;">Evaluation Date: \${new Date().toLocaleDateString()}</p>
      </div>
      <div class="score-container">
        <div class="score-circle">\${candidate.matchScore}%</div>
        <span class="badge \${
          candidate.matchScore >= 85 ? 'badge-emerald' : candidate.matchScore >= 70 ? 'badge-violet' : 'badge-amber'
        }">
          \${candidate.hiringDecision || 'Maybe'}
        </span>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Recruiter Recommendation</h2>
      <div class="recommendation-box">
        \${candidate.recommendation}
      </div>
    </div>

    <div class="grid">
      <div class="column-box strengths-box">
        <h3 class="column-title strengths-title">🟢 Strengths</h3>
        <ul>
          \${candidate.strengths?.map(str => \`<li>\${str}</li>\`).join('') || '<li>None identified</li>'}
        </ul>
      </div>
      <div class="column-box gaps-box">
        <h3 class="column-title gaps-title">🔴 Gaps & Risks</h3>
        <ul>
          \${candidate.skillGaps?.concat(candidate.risks || [])?.map(gap => \`<li>\${gap}</li>\`).join('') || '<li>None identified</li>'}
        </ul>
      </div>
    </div>

    <div class="footer">
      Generated by EJ Recruit AI &mdash; Advanced Match Evaluation Report
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidate.candidateName.replace(/\s+/g, '_')}_Evaluation_Report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Evaluation report downloaded successfully!');
  };

  // Get active candidate
  const activeCandidate = pipelineResults[activeCandidateIdx];

  return (
    <div>
      {/* 1. HERO BANNER - JD INPUT / DEFAULT */}
      {step === 'jd_input' && (
        <div className="hero">
          <div className="hero__eyebrow">
            <span>⚡</span>
            <span>Automatic Multi-Resume Matching & WhatsApp Invites</span>
          </div>
          <h1 className="hero__title">
            Streamlined AI Recruitment<br />Pipeline
          </h1>
          <p className="hero__subtitle">
            Paste your Job Description, upload up to 5 resumes, match them instantly, and generate ready-to-send WhatsApp messages with calendar links.
          </p>
          <div className="stat-strip">
            <div className="stat-item">
              <div className="stat-item__value">Step 1</div>
              <div className="stat-item__label">Job Description</div>
            </div>
            <div className="stat-item">
              <div className="stat-item__value">Step 2</div>
              <div className="stat-item__label">Upload 5 Resumes</div>
            </div>
            <div className="stat-item">
              <div className="stat-item__value">Step 3</div>
              <div className="stat-item__label">WhatsApp Invites</div>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingBottom: '80px', marginTop: step === 'jd_input' ? '0' : '30px' }}>
        
        {/* STEP 1: JD INPUT */}
        {step === 'jd_input' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="card animate-fade-in" style={{ padding: '32px' }}>
              <div className="flex items-center gap-2 mb-6">
                <h2 style={{ fontSize: '1.2rem' }}>📝 Step 1: Input Job Description</h2>
              </div>
              <JDForm onResult={handleJdResult} />
            </div>

            {/* SEARCH HISTORY PANEL */}
            <div className="card animate-fade-in" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📂</span> Recent Job Analyses (Search History)
              </h3>
              
              {historyLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid var(--border)',
                    borderTopColor: 'var(--accent-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              ) : historyList.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                  No past job analyses found.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {historyList.map((item) => (
                    <div 
                      key={item._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.01)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        gap: '12px'
                      }}
                    >
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.parsedResult?.jobTitle || 'Untitled Job'}
                        </h4>
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {item.parsedResult?.seniorityLevel || 'N/A'} &bull; {item.parsedResult?.location || 'N/A'} &bull; {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn--sm btn--primary"
                          onClick={() => handleSelectHistory(item._id)}
                          style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>⚡</span> Load
                        </button>
                        <button
                          className="btn btn--sm btn--secondary"
                          onClick={() => handleDeleteHistory(item._id)}
                          style={{ padding: '6px 8px', fontSize: '0.76rem', color: 'var(--accent-danger)' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: JD RESULT */}
        {step === 'jd_result' && jdResult && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-light)' }}>✅ Step 1 Complete: JD Analyzed</h3>
              <button className="btn btn--secondary btn--sm" onClick={handleReset}>
                Reset & Restart
              </button>
            </div>
            
            <div className="card card--glow mb-6" style={{ padding: '24px', background: 'rgba(124, 58, 237, 0.04)' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.15rem' }}>🚀 Proceed to Candidate Matching</h3>
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Requirements for <strong>{jdResult.parsedResult.jobTitle}</strong> are extracted. You can now upload up to 5 resumes to compare them against these requirements and prepare candidate outreach invites.
              </p>
              <button className="btn btn--primary" onClick={() => setStep('resume_upload')}>
                Proceed to Resume Upload →
              </button>
            </div>

            <ResultCard
              data={jdResult.parsedResult}
              wordCount={jdResult.wordCount}
              createdAt={jdResult.createdAt}
              onReset={handleReset}
            />
          </div>
        )}

        {/* STEP 3: UPLOAD RESUMES */}
        {step === 'resume_upload' && jdResult && (
          <div className="card animate-fade-in" style={{ padding: '32px' }}>
            <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2>📁 Step 2: Upload Candidate Resumes</h2>
                <p className="text-sm text-muted mt-2">Matching against role: <strong>{jdResult.parsedResult.jobTitle}</strong></p>
              </div>
              <button className="btn btn--secondary btn--sm" onClick={() => setStep('jd_result')}>
                ← Back to JD details
              </button>
            </div>

            {/* Calendar Link Input */}
            <div className="form-group mb-6">
              <label className="form-label">🗓 Recruiter Calendar / Booking Link (Optional)</label>
              <input
                type="url"
                className="form-textarea"
                style={{ minHeight: 'auto', padding: '12px 16px' }}
                placeholder="e.g. https://calendly.com/your-company/intro-call"
                value={calendarLink}
                onChange={(e) => setCalendarLink(e.target.value)}
              />
              <p className="text-sm text-muted">This booking link will automatically be included in outreach messages for matched candidates.</p>
            </div>

            {/* Drag & Drop File Input Mock */}
            <div className="form-group mb-6">
              <label className="form-label">Resumes (Max 5, PDF/DOCX)</label>
              <div
                style={{
                  border: '2px dashed var(--border-accent)',
                  borderRadius: 'var(--radius-md)',
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.01)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onClick={() => document.getElementById('resumes-input-field').click()}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-light)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
              >
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📂</span>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Click to select files</p>
                <p className="text-sm text-muted">Supports text-based PDF and DOCX files. Select up to 5 resumes.</p>
                <input
                  id="resumes-input-field"
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mb-6">
                <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>Selected Resumes ({files.length}/5)</h4>
                <div className="flex flex-col gap-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between card animate-fade-in"
                      style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.015)' }}
                    >
                      <div className="flex items-center gap-3" style={{ overflow: 'hidden' }}>
                        <span>📄</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name}
                        </span>
                        <span className="text-sm text-muted flex-shrink-0">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button type="button" className="btn btn--sm btn--danger" onClick={() => removeFile(idx)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-8">
              <button className="btn btn--secondary btn--lg" onClick={handleReset}>
                Cancel
              </button>
              <button
                className="btn btn--primary btn--lg"
                disabled={files.length === 0}
                onClick={runPipeline}
              >
                <span>⚡</span>
                <span>Run Matcher & Outreach</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROCESSING STATUS */}
        {step === 'processing' && (
          <div className="card animate-fade-in" style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div className="spinner-container">
              <div className="spinner-ring">
                <div className="spinner-ring__track"></div>
              </div>
              <h2 style={{ fontSize: '1.4rem', marginTop: '16px' }}>🧠 Running Recruitment Pipeline...</h2>
              <p style={{ maxWidth: '500px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                We are parsing the uploaded resumes, calculating skills and experience compatibility scores against the job description, and writing outreach templates. This may take up to 2 minutes depending on file size.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: PIPELINE RESULTS DASHBOARD */}
        {step === 'pipeline_results' && pipelineResults.length > 0 && (
          <div className="animate-fade-in">
            
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2>📋 Step 3: Match & Outreach Dashboard</h2>
                <p className="text-sm text-muted mt-1">Processed {pipelineResults.length} candidate resumes for role <strong>{jdResult.parsedResult.jobTitle}</strong></p>
              </div>
              <button className="btn btn--secondary" onClick={handleReset}>
                ← Start New Pipeline
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '24px', alignItems: 'start' }} className="responsive-pipeline-grid">
              
              {/* Left Column: Candidates list */}
              <div className="flex flex-col gap-3">
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Candidates</h4>
                {pipelineResults.map((candidate, idx) => {
                  const isActive = idx === activeCandidateIdx;
                  const scoreColor = candidate.matchScore >= 80 ? 'var(--accent-secondary)' : candidate.matchScore >= 65 ? 'var(--accent-warning)' : 'var(--accent-danger)';
                  
                  return (
                    <div
                      key={idx}
                      className={`card animate-fade-in ${isActive ? 'card--glow' : ''}`}
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        background: isActive ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-card)',
                        borderColor: isActive ? 'var(--accent-primary)' : 'var(--border)',
                        transition: 'var(--transition-fast)'
                      }}
                      onClick={() => selectCandidate(idx)}
                    >
                      {!candidate.success ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-danger)' }}>Parsing Failed</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{candidate.fileName}</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {candidate.candidateName}
                            </span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: scoreColor }}>
                              {candidate.matchScore}%
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                              {candidate.hiringDecision}
                            </span>
                            {candidate.isMatched ? (
                              <span style={{ color: 'var(--accent-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                                💬 Ready to Invite
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                ⚠️ Low Match Score
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Scorecard & Outreach Details */}
              <div className="card" style={{ padding: '28px' }}>
                {activeCandidate && !activeCandidate.success ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <span style={{ fontSize: '3rem' }}>⚠️</span>
                    <h3 style={{ marginTop: '16px', color: 'var(--accent-danger)' }}>Error Processing File</h3>
                    <p className="text-muted mt-2">{activeCandidate.error}</p>
                  </div>
                ) : activeCandidate ? (
                  <div>
                    {/* Candidate Identity Profile */}
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-4 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <h2 style={{ fontSize: '1.4rem' }}>{activeCandidate.candidateName}</h2>
                        <p className="text-sm text-muted mt-1">
                          📧 {activeCandidate.email || 'No Email'} &bull; 📞 {activeCandidate.phone || 'No Phone'}
                        </p>
                      </div>
                      
                      {/* Score Badge */}
                      <div className="flex items-center gap-3">
                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${
                            activeCandidate.matchScore >= 85 ? 'badge--emerald' : activeCandidate.matchScore >= 70 ? 'badge--violet' : 'badge--amber'
                          }`}>
                            {activeCandidate.hiringDecision}
                          </span>
                        </div>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          border: '3px solid var(--border-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          background: 'rgba(124,58,237,0.1)'
                        }}>
                          {activeCandidate.matchScore}%
                        </div>
                      </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', alignItems: 'center' }}>
                      <button
                        className={`btn btn--sm ${activeTab === 'scorecard' ? 'btn--primary' : 'btn--secondary'}`}
                        onClick={() => setActiveTab('scorecard')}
                      >
                        📊 Scorecard
                      </button>
                      <button
                        className={`btn btn--sm ${activeTab === 'whatsapp' ? 'btn--primary' : 'btn--secondary'}`}
                        onClick={() => setActiveTab('whatsapp')}
                      >
                        💬 WhatsApp Invitation
                      </button>
                      <button
                        className="btn btn--sm btn--secondary"
                        onClick={() => handleDownloadReport(activeCandidate)}
                        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        📥 Download Report
                      </button>
                    </div>

                    {/* TAB CONTENT: SCORECARD */}
                    {activeTab === 'scorecard' && (
                      <div className="animate-fade-in flex flex-col gap-6">
                        
                        {/* Recommendation */}
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
                          <h4 style={{ color: 'var(--accent-light)', marginBottom: '8px' }}>Recruiter Recommendation</h4>
                          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                            {activeCandidate.recommendation}
                          </p>
                        </div>

                        {/* Strengths & Gaps Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-pip-columns">
                          
                          {/* Strengths */}
                          <div style={{ background: 'rgba(6,214,160,0.03)', border: '1px solid rgba(6,214,160,0.1)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>🟢</span> Strengths
                            </h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                              {activeCandidate.strengths?.map((str, i) => (
                                <li key={i} className="flex gap-2 text-muted" style={{ color: 'var(--text-secondary)' }}>
                                  <span>•</span> {str}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Skill Gaps & Risks */}
                          <div style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                            <h4 style={{ color: 'var(--accent-danger)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>🔴</span> Gaps / Risks
                            </h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                              {activeCandidate.skillGaps?.concat(activeCandidate.risks || [])?.map((gap, i) => (
                                <li key={i} className="flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                                  <span>•</span> {gap}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT: WHATSAPP INVITE */}
                    {activeTab === 'whatsapp' && (
                      <div className="animate-fade-in">
                        <div className="form-group mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="form-label">WhatsApp Invite Message</label>
                            <button
                              className="btn btn--sm btn--secondary"
                              onClick={() => handleCopyText(editingWhatsAppMsg, 'WhatsApp invite')}
                            >
                              📋 Copy Message
                            </button>
                          </div>
                          <textarea
                            className="form-textarea"
                            style={{ minHeight: '180px', fontFamily: 'inherit', fontSize: '0.88rem' }}
                            value={editingWhatsAppMsg}
                            onChange={(e) => setEditingWhatsAppMsg(e.target.value)}
                          />
                        </div>

                        {/* Phone verify */}
                        <div className="form-group mb-6">
                          <label className="form-label">Verify Candidate Phone Number (with Country Code)</label>
                          <input
                            type="text"
                            className="form-textarea"
                            style={{ minHeight: 'auto', padding: '12px 16px', fontSize: '0.9rem' }}
                            value={editingPhone}
                            onChange={(e) => setEditingPhone(e.target.value)}
                            placeholder="e.g. +919876543210"
                          />
                        </div>

                        {/* Send Action */}
                        <div style={{
                          background: 'rgba(6,214,160,0.04)',
                          border: '1px solid rgba(6,214,160,0.15)',
                          borderRadius: 'var(--radius-md)',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}>
                          <div>
                            <p style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>📨 WhatsApp Outreach Ready</p>
                            <p className="text-sm text-muted">Opens candidate chat directly in WhatsApp Web or Desktop application.</p>
                          </div>
                          <button
                            className="btn btn--primary"
                            style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 4px 15px rgba(37,211,102,0.25)' }}
                            onClick={() => handleSendWhatsApp(editingPhone, editingWhatsAppMsg)}
                          >
                            <span>💬</span>
                            <span>Send via WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    )}



                  </div>
                ) : null}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* CSS adjustments for the two-column pipeline results on small screens */}
      <style>{`
        @media (max-width: 850px) {
          .responsive-pipeline-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-pip-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyzePage;
