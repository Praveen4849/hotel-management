import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand-logo" title="Hotel Management">
          <span className="logo-icon">🏨</span>
          <span>Hotel Management</span>
        </Link>

        <nav className="header-nav">
          <Link
            to="/"
            className={`header-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Hotel List
          </Link>
          <Link
            to="/add"
            className="btn btn-primary"
            id="add-hotel-btn"
          >
            + Add Hotel
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
