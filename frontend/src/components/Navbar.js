import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

return (
  <nav className="navbar">
    <div className="navbar-inner">
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-icon">⚡</span>
        <span className="navbar-logo-text">LinkForge</span>
      </Link>

      <div className="navbar-right">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={
                  location.pathname === '/dashboard'
                    ? 'navbar-link navbar-link-active'
                    : 'navbar-link'
                }
              >
                Dashboard
              </Link>

              <div className="navbar-user">
                <div className="navbar-avatar">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="navbar-username">{user.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm navbar-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm navbar-btn">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm navbar-btn">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;