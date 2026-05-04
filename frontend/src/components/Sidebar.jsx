import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, TrendingUp, FileText, Building, MessageSquare, Bot, BookOpen } from 'lucide-react';
import Logo from './Logo';

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path || (path === '/skills' && location.pathname.includes('/interviews'));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link to="/">
          <Logo />
          <span>PlaceNix<br/><small>Placement System</small></span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
          <User size={20} />
          <span>My Profile</span>
        </Link>
        <Link to="/predictions" className={`nav-item ${isActive('/predictions') ? 'active' : ''}`}>
          <TrendingUp size={20} />
          <span>Predictions</span>
        </Link>
        <Link to="/skills" className={`nav-item ${isActive('/skills') ? 'active' : ''}`}>
          <TrendingUp size={20} />
          <span>Skill Gap</span>
        </Link>
        <Link to="/resume" className={`nav-item ${isActive('/resume') ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Resume Analyzer</span>
        </Link>
        <Link to="/ongoing-drives" className={`nav-item ${isActive('/ongoing-drives') ? 'active' : ''}`}>
          <Building size={20} />
          <span>Ongoing Placement Drives</span>
        </Link>
        <Link to="/chatbot" className={`nav-item ${isActive('/chatbot') ? 'active' : ''}`}>
          <Bot size={20} />
          <span>Chatbot</span>
        </Link>
        <Link to="/resources" className={`nav-item ${isActive('/resources') ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Resources</span>
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <div className="user-profile-mini">
          <div className="avatar">
            <img src="https://ui-avatars.com/api/?name=Student&background=random" alt="User" />
            <span className="status-dot"></span>
          </div>
          <div className="info">
            <strong>Student</strong>
            <Link to="/profile">View Profile</Link>
          </div>
          <button onClick={logout} className="icon-btn" style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--accent)' }} title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
