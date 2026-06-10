import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {/* Brand */}
        <NavLink to="/" className="navbar__brand" id="nav-brand">
          <div className="navbar__logo" aria-hidden="true">🧠</div>
          <span className="navbar__title">
            EJ <span>Recruit</span> AI
          </span>
        </NavLink>

        {/* User profile dropdown or Sign In button */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(124, 58, 237, 0.15)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                {getInitials(user.name)}
              </div>
              
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '180px',
                  background: '#151d30',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  zIndex: 1000,
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border)',
                    marginBottom: '4px'
                  }}>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-danger)',
                      fontSize: '0.82rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.08)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink 
              to="/login"
              className="btn btn--sm btn--primary"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🔑</span>
              <span>Sign In</span>
            </NavLink>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};

const Layout = () => (
  <>
    <Navbar />
    <main>
      <Outlet />
    </main>
    <footer
      style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        marginTop: 'auto',
      }}
    >
      EJ Recruit AI &mdash; Powered by Gemini 2.5 Pro &amp; MongoDB &nbsp;·&nbsp; Built with ❤️
    </footer>
  </>
);

export default Layout;
