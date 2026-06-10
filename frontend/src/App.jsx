import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import HistoryPage from './pages/HistoryPage';
import AnalysisDetailPage from './pages/AnalysisDetailPage';
import ResumePage from './pages/ResumePage';
import ResumeHistoryPage from './pages/ResumeHistoryPage';
import ResumeDetailPage from './pages/ResumeDetailPage';
import MatchPage from './pages/MatchPage';
import MatchHistoryPage from './pages/MatchHistoryPage';
import MatchDetailPage from './pages/MatchDetailPage';
import InterviewPage from './pages/InterviewPage';
import InterviewHistoryPage from './pages/InterviewHistoryPage';
import InterviewDetailPage from './pages/InterviewDetailPage';
import OutreachPage from './pages/OutreachPage';
import OutreachHistoryPage from './pages/OutreachHistoryPage';
import OutreachDetailPage from './pages/OutreachDetailPage';
import CopilotSetupPage from './pages/CopilotSetupPage';
import CopilotChatPage from './pages/CopilotChatPage';
import CopilotHistoryPage from './pages/CopilotHistoryPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1117',
              color: '#f1f5f9',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#06d6a0', secondary: '#0d1117' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0d1117' },
            },
          }}
        />
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/pipeline" element={<AnalyzePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:id" element={<AnalysisDetailPage />} />
              {/* Resume Parser */}
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/resume/history" element={<ResumeHistoryPage />} />
              <Route path="/resume/:id" element={<ResumeDetailPage />} />
              {/* Matching Engine */}
              <Route path="/match" element={<MatchPage />} />
              <Route path="/match/history" element={<MatchHistoryPage />} />
              <Route path="/match/:id" element={<MatchDetailPage />} />
              {/* Interview Generator */}
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/interview/history" element={<InterviewHistoryPage />} />
              <Route path="/interview/:id" element={<InterviewDetailPage />} />
              {/* Outreach Generator */}
              <Route path="/outreach" element={<OutreachPage />} />
              <Route path="/outreach/history" element={<OutreachHistoryPage />} />
              <Route path="/outreach/:id" element={<OutreachDetailPage />} />
              {/* AI Copilot */}
              <Route path="/copilot" element={<CopilotSetupPage />} />
              <Route path="/copilot/chat/:id" element={<CopilotChatPage />} />
              <Route path="/copilot/history" element={<CopilotHistoryPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
