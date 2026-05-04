import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      textDecoration: 'none',
      color: isActive ? 'white' : 'var(--text-muted)',
      fontWeight: isActive ? '600' : '500',
      borderBottom: isActive ? '2px solid var(--primary-color)' : 'none',
      paddingBottom: '0.3rem',
      whiteSpace: 'nowrap',
      transition: 'all 0.3s ease'
    };
  };

  return (
    <nav className="navbar">
      <div className="container">
        <h2><Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.8rem', letterSpacing: '1px' }}><Logo />PlaceNix</Link></h2>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'nowrap' }}>
          {user && (
            <>
              <Link to="/" style={getLinkStyle('/')}>Dashboard</Link>
              <Link to="/predict" style={getLinkStyle('/predict')}>Placement Predictor</Link>
              <Link to="/resume" style={{ background: 'rgba(240, 147, 251, 0.1)', padding: '0.4rem 1rem', borderRadius: '20px', color: '#f093fb', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>✨ Resume Score</Link>
              <Link to="/skills" style={getLinkStyle('/skills')}>Skill Gap</Link>
              <Link to="/profile" style={getLinkStyle('/profile')}>My Profile</Link>
              <Link to="/assistant" style={getLinkStyle('/assistant')}>AI Prep Bot</Link>
            </>
          )}
          
          {user ? (
            <button onClick={logout} className="btn-ghost" style={{ padding: '0.5rem 1.5rem', fontSize: '0.95rem', borderRadius: '30px', cursor: 'pointer', border: '1px solid rgba(240, 147, 251, 0.5)', color: '#f093fb', background: 'transparent', whiteSpace: 'nowrap' }}>Logout</button>
          ) : (
            <Link to="/login" className="btn btn-animated" style={{ padding: '0.6rem 2rem', fontSize: '1rem', borderRadius: '30px', boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)', fontWeight: 'bold', color: '#09090b', textDecoration: 'none', whiteSpace: 'nowrap' }}>Login / Join</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
