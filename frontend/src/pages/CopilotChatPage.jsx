import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getCopilotSession, sendCopilotMessage } from '../services/copilotApi';
import LoadingSpinner from '../components/LoadingSpinner';

const ChatBubble = ({ role, content }) => {
  const isUser = role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          borderBottomRightRadius: isUser ? 4 : 'var(--radius-lg)',
          borderBottomLeftRadius: !isUser ? 4 : 'var(--radius-lg)',
          background: isUser ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
          color: isUser ? '#fff' : 'var(--text-primary)',
          border: isUser ? 'none' : '1px solid var(--border)',
          lineHeight: 1.5,
          fontSize: '0.95rem',
          boxShadow: isUser ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
        }}
      >
        <div style={{ marginBottom: 4, fontSize: '0.75rem', color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', fontWeight: 600 }}>
          {isUser ? 'You' : '💬 Copilot'}
        </div>
        <div className="prose prose-sm" style={{ color: 'inherit' }}>
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p style={{ margin: '0 0 8px 0', color: 'inherit' }} {...props} />,
              ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.2em', margin: '0 0 8px 0', color: 'inherit' }} {...props} />,
              strong: ({ node, ...props }) => <strong style={{ color: isUser ? '#fff' : 'var(--accent-light)' }} {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

const CopilotChatPage = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setLoading(true);
    getCopilotSession(id)
      .then((data) => {
        setSession(data);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      })
      .catch((err) => {
        setError(err.message || 'Could not load chat session.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const messageToSend = input.trim();
    setInput('');
    setSending(true);

    // Optimistically add user message
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: messageToSend, timestamp: new Date() }],
    }));

    try {
      const updatedSession = await sendCopilotMessage(id, messageToSend);
      setSession(updatedSession);
    } catch (err) {
      alert(err.message || 'Failed to send message.');
      // Revert optimistic update ideally, but skipping for simplicity
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '60px 24px' }}><LoadingSpinner label="Loading chat..." /></div>;

  if (error) return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <p className="empty-state__title">{error}</p>
        <Link to="/copilot/history" className="btn btn--secondary mt-4">← Back to History</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)' }}>
      {/* Header */}
      <div className="card card--glow" style={{ padding: '16px 24px', marginBottom: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>💬</span>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Recruiter Copilot</h2>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge badge--violet">👤 {session?.candidateName}</span>
            <span className="badge badge--emerald">💼 {session?.jobTitle}</span>
          </div>
        </div>
        <Link to="/copilot" className="btn btn--secondary btn--sm">End Session</Link>
      </div>

      {/* Chat Area */}
      <div
        className="card"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
        }}
      >
        {session?.messages.map((msg, idx) => (
          <ChatBubble key={idx} role={msg.role} content={msg.content} />
        ))}
        {sending && (
          <div style={{ alignSelf: 'flex-start', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span className="animate-pulse">Copilot is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        style={{
          flexShrink: 0,
          display: 'flex',
          gap: 12,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. Why did they score 78%? What skills are missing?)..."
          disabled={sending}
          style={{
            flex: 1,
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 20px',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'var(--transition)',
          }}
          autoFocus
        />
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!input.trim() || sending}
          style={{ padding: '0 24px', borderRadius: 'var(--radius-lg)' }}
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default CopilotChatPage;
