import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      return;
    }

    setSubmitting(true);
    let success = false;

    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(name, email, password);
    }

    setSubmitting(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '40px 32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.4s ease-out'
      }}>
        {/* Logo Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.15)'
          }}>
            🧠
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>
        <p style={{
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          {isLogin 
            ? 'Enter your credentials to manage candidate pipelines' 
            : 'Register your account to access recruit tools'
          }
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Name Field (Only on Register) */}
          {!isLogin && (
            <div className="form-group" style={{ animation: 'fadeInDown 0.3s ease-out' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Full Name</label>
              <input
                type="text"
                className="form-textarea"
                style={{ minHeight: 'auto', padding: '12px 16px', fontSize: '0.9rem' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Email Address</label>
            <input
              type="email"
              className="form-textarea"
              style={{ minHeight: 'auto', padding: '12px 16px', fontSize: '0.9rem' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recruiter@company.com"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-textarea"
                style={{ minHeight: 'auto', padding: '12px 40px 12px 16px', fontSize: '0.9rem', width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                  opacity: showPassword ? 1 : 0.4,
                  transition: 'opacity 0.2s'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                👁️
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn--primary"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '0.92rem',
              fontWeight: 600,
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.8 : 1
            }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Please wait...</span>
              </>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Register'}</span>
            )}
          </button>
        </form>

        {/* Toggle Option */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setName('');
              setEmail('');
              setPassword('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            {isLogin ? 'Create one here' : 'Sign in here'}
          </button>
        </div>
      </div>

      {/* Embedded Animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
