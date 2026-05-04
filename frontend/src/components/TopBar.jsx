import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function TopBar() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>Hello, Student! 👋</h2>
        <p>Let's find and prepare for your dream placement.</p>
      </div>

      <div className="topbar-right">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search companies or roles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <Search size={18} onClick={() => {
            if(searchQuery.trim()) navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
          }} style={{cursor: 'pointer'}} />
        </div>

        <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div style={{position: 'relative'}}>
          <button className="icon-btn notifications" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            <span className="badge">0</span>
          </button>
          
          {showNotifications && (
            <div style={{
              position: 'absolute', top: '50px', right: '-10px', width: '300px', 
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
              borderRadius: '12px', padding: '15px', zIndex: 100,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px'}}>Notifications</h3>
              <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0'}}>
                No new notifications
              </div>
            </div>
          )}
        </div>

        <div className="profile-menu">
          <img src="https://ui-avatars.com/api/?name=Student&background=random" alt="Profile" onClick={logout} title="Click to logout" />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
