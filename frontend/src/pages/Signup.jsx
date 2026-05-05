import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signupUser } from '../services/api';
import Logo from '../components/Logo';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const data = await signupUser({ email, password });
      login(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '1rem' }}><Logo width={60} height={60} /></div>
          <h2>Join PlaceNix</h2>
          <p>Create an account to predict your placement</p>
        </div>
        
        {error && <div style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', border: '1px solid rgba(248, 113, 113, 0.3)' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required 
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              className="form-control" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-animated" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
          <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
        </div>

        <button 
          className="btn" 
          style={{ 
            width: '100%', 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            color: 'var(--text-color)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px'
          }}
          onClick={() => alert('Google Sign-In integration requires an OAuth Client ID. We can set this up next!')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          <p>Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
