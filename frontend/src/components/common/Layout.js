import React, { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <button
        type="button"
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        aria-label="Close sidebar"
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="content-shell">
        <div className="mobile-topbar">
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Open sidebar"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span>MedTracker</span>
        </div>

        <main className="main-content">
          <div className="page-content">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
