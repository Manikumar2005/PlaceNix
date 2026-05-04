import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies, filterCompanies, predictPlacement } from '../services/api';
import { Briefcase, Building, TrendingUp, DollarSign, Edit3, FileText, MessageSquare, Bot, BookOpen, ChevronRight } from 'lucide-react';
import { usePrediction } from '../context/PredictionContext';

import { useSearchParams } from 'react-router-dom';

function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ cgpa: '', skills: '' });
  const [hasInput, setHasInput] = useState(false);
  
  const { predictionData, setPredictionData, clearPredictionData } = usePrediction();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  // Dynamic Stats State
  const [stats, setStats] = useState({
    totalDrives: 0,
    eligibleCount: 0,
    probability: 0,
    package: 0,
    readiness: 0,
    readinessStatus: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (predictionData) {
      setHasInput(true);
      let count = companies.length;
      if (predictionData.cgpa) {
        count = companies.filter(c => parseFloat(predictionData.cgpa) >= parseFloat(c.eligibility_cgpa)).length;
      } else if (filters.cgpa) {
        count = companies.filter(c => parseFloat(filters.cgpa) >= parseFloat(c.eligibility_cgpa)).length;
      }
      
      setStats(prev => ({
        ...prev,
        probability: predictionData.probability,
        package: predictionData.package,
        readiness: predictionData.readiness,
        readinessStatus: predictionData.readinessStatus,
        eligibleCount: count
      }));
    } else {
      setHasInput(false);
      setStats(prev => ({
        ...prev,
        probability: 0,
        package: 0,
        readiness: 0,
        readinessStatus: '',
        eligibleCount: companies.length
      }));
    }
  }, [predictionData, companies, filters.cgpa]);

  const updatePredictions = async (currentFilters = { cgpa: '', skills: '' }) => {
    try {
      let profileData = null;
      const stored = localStorage.getItem('placement_profile');
      if (stored) {
        profileData = JSON.parse(stored);
      }
      
      if (currentFilters.cgpa || currentFilters.skills) {
        profileData = profileData || {
          skills_count: 0, projects_count: 0, internships_count: 0, aptitude_score: 0
        };
        if (currentFilters.cgpa) profileData.cgpa = parseFloat(currentFilters.cgpa);
        if (currentFilters.skills) profileData.skills_count = currentFilters.skills.split(',').filter(s => s.trim()).length;
      }

      if (!profileData || !profileData.cgpa) {
        clearPredictionData();
        return;
      }

      const res = await predictPlacement(profileData);
      
      const prob = res.placement_probability;
      const readiness = Math.min(100, Math.round(prob * 0.8 + (profileData.cgpa / 10) * 20));
      const status = readiness > 80 ? 'Excellent' : readiness > 60 ? 'Good' : 'Needs Work';
      
      setPredictionData({
        probability: prob,
        package: res.predicted_package,
        readiness: readiness,
        readinessStatus: status,
        cgpa: profileData.cgpa
      });
    } catch (err) {
      console.error("Error updating predictions:", err);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCompanies();
      setCompanies(data);
      setStats(prev => ({
        ...prev,
        totalDrives: data.length,
        eligibleCount: data.length 
      }));
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Failed to load placement drives. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      if (!filters.cgpa && !filters.skills) {
        await fetchCompanies();
        updatePredictions();
      } else {
        const data = await filterCompanies(filters.cgpa, filters.skills);
        setCompanies(data);
        updatePredictions(filters);
      }
    } catch (err) {
      setError("Filter failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ cgpa: '', skills: '' });
    clearPredictionData();
    localStorage.removeItem('placement_profile');
    fetchCompanies();
  };

  const renderEligibilityTag = (company) => {
    const cgpaToCheck = filters.cgpa || (predictionData ? predictionData.cgpa : null);
    if (!cgpaToCheck) {
      return <span className="badge-neutral" style={{background: 'rgba(255,255,255,0.1)', color: '#ccc', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem'}}>Enter CGPA to check eligibility</span>;
    }
    const isEligible = parseFloat(cgpaToCheck) >= parseFloat(company.eligibility_cgpa);
    return isEligible ? (
      <span className="badge-eligible">Eligible</span>
    ) : (
      <span className="badge-not-eligible">Not Eligible</span>
    );
  };

  const renderCompanyCard = (company) => (
    <div key={company.id} className="company-card card-hover">
      <div className="company-header">
        <div className="company-logo" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img 
            src={`https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s+/g, '')}.com`} 
            alt={company.name}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          <div className="company-logo-placeholder" style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {company.name.charAt(0)}
          </div>
        </div>
        <div className="company-title">
          <h3>{company.name}</h3>
          <p className="role">{company.role}</p>
        </div>
        {renderEligibilityTag(company)}
      </div>
      
      <div className="company-details">
        <div className="detail-row">
          <span className="icon">💰</span>
          <span className="label">Package</span>
          <span className="value package">{company.package}</span>
        </div>
        <div className="detail-row">
          <span className="icon">🎓</span>
          <span className="label">Eligibility CGPA</span>
          <span className="value">{company.eligibility_cgpa}</span>
        </div>
        <div className="detail-row">
          <span className="icon">💻</span>
          <span className="label">Skills</span>
          <span className="value truncate" title={company.required_skills}>{company.required_skills}</span>
        </div>
        <div className="detail-row">
          <span className="icon">📅</span>
          <span className="label">Drive Date</span>
          <span className="value">{company.status === 'ongoing' ? '1-05-2026' : '6-05-2026 to 6-06-2026'}</span>
        </div>
      </div>
      
      <Link to={`/interviews/${company.id}`} className="btn-outline btn-full">
        View Details <span>→</span>
      </Link>
    </div>
  );

  const displayedCompanies = companies.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.required_skills.toLowerCase().includes(q);
  });

  return (
    <div className="dashboard-container">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card gradient-1">
          <div className="icon-wrapper"><Briefcase size={24} color="#fff"/></div>
          <div className="info">
            <p>Total Drives</p>
            <h3>{stats.totalDrives}</h3>
            <small>Current semester</small>
          </div>
        </div>
        <div className="summary-card gradient-2">
          <div className="icon-wrapper"><TrendingUp size={24} color="#fff"/></div>
          <div className="info">
            <p>Placement Prob.</p>
            <h3>{hasInput ? `${Number(stats.probability).toFixed(1)}%` : '—'}</h3>
            <small>{hasInput ? 'Based on profile' : 'Enter details'}</small>
          </div>
        </div>
        <div className="summary-card gradient-3">
          <div className="icon-wrapper"><DollarSign size={24} color="#fff"/></div>
          <div className="info">
            <p>Avg. Package</p>
            <h3>{hasInput ? `${stats.package} LPA` : '—'}</h3>
            <small>{hasInput ? 'Predicted' : 'Enter details'}</small>
          </div>
        </div>
        <div className="summary-card gradient-4">
          <div className="icon-wrapper"><Building size={24} color="#fff"/></div>
          <div className="info">
            <p>Eligible Drives</p>
            <h3>{hasInput ? stats.eligibleCount : '—'}</h3>
            <small>{hasInput ? 'Matches profile' : 'Enter CGPA'}</small>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-main">
          {/* Filter Section */}
          <div className="filter-section">
            <h3><Edit3 size={18} /> Quick Filter & Predictor</h3>
            <form className="filter-form" onSubmit={applyFilters}>
              <div className="form-group">
                <label>CGPA</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="cgpa"
                  placeholder="e.g. 8.5" 
                  className="form-control"
                  value={filters.cgpa}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="form-group flex-2">
                <label>Skills</label>
                <input 
                  type="text" 
                  name="skills"
                  placeholder="Python, Java, SQL" 
                  className="form-control"
                  value={filters.skills}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="filter-actions">
                <button type="submit" className="btn-primary" style={{padding: '10px 20px'}}><Briefcase size={18} /> Filter Drives</button>
                <button type="button" className="btn-secondary" onClick={resetFilters}>Reset</button>
              </div>
            </form>
          </div>

          {/* Search Indicator */}
          {searchQuery && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(240, 147, 251, 0.1)', borderRadius: '12px', border: '1px solid rgba(240, 147, 251, 0.3)', color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Showing results for: <strong>"{searchQuery}"</strong></span>
              <Link to="/" style={{ color: '#f093fb', textDecoration: 'none', fontSize: '0.9rem', padding: '4px 12px', border: '1px solid #f093fb', borderRadius: '20px' }}>Clear Search</Link>
            </div>
          )}

          {/* Placement Drives List */}
          <div className="drives-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading placement drives...</p>
              </div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : displayedCompanies.length === 0 ? (
              <div className="empty-state">
                <p>No placement drives found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="section-header">
                  <h3><Briefcase size={20} /> Ongoing Placement Drives</h3>
                  <Link to="/ongoing-drives" className="link-primary">View All Ongoing →</Link>
                </div>
                <div className="company-grid" style={{marginBottom: '2rem'}}>
                  {displayedCompanies.filter(c => c.status === 'ongoing').length > 0 ? (
                    displayedCompanies.filter(c => c.status === 'ongoing').map(renderCompanyCard)
                  ) : (
                    <p style={{color: 'var(--text-muted)'}}>No ongoing drives at the moment.</p>
                  )}
                </div>

                <div className="section-header">
                  <h3><Briefcase size={20} /> Upcoming Placement Drives</h3>
                </div>
                <div className="company-grid">
                  {displayedCompanies.filter(c => c.status === 'upcoming').length > 0 ? (
                    displayedCompanies.filter(c => c.status === 'upcoming').map(renderCompanyCard)
                  ) : (
                    <p style={{color: 'var(--text-muted)'}}>No upcoming drives at the moment.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="sidebar-widget readiness-widget">
            <h3>Placement Readiness Score</h3>
            {hasInput ? (
              <>
                <div className="progress-circle" style={{"--p": stats.readiness}}>
                  <span className="percentage">{stats.readiness}%</span>
                  <span className="status">{stats.readinessStatus}</span>
                </div>
                <p className="motivation">Keep improving! <TrendingUp size={16} color="#4ade80"/></p>
                <Link to="/predictions" className="btn-outline btn-full">View Full Report →</Link>
              </>
            ) : (
              <div style={{padding: '20px 0', textAlign: 'center'}}>
                <div style={{width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', border: '2px dashed var(--border-color)'}}>
                  <TrendingUp size={30} style={{opacity: 0.3}} />
                </div>
                <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Enter your CGPA and skills to see your placement readiness score.</p>
              </div>
            )}
          </div>

          <div className="sidebar-widget">
            <h3><MessageSquare size={18} /> Quick Support</h3>
            <div className="action-list">
              <Link to="/interviews/1" className="action-item card-hover">
                <div className="icon edit"><FileText size={18} /></div>
                <div className="text">
                  <h4>Interview Questions</h4>
                  <p>Practice & improve</p>
                </div>
                <ChevronRight size={16} className="arrow" />
              </Link>
              <Link to="/chatbot" className="action-item card-hover">
                <div className="icon bot"><Bot size={18} /></div>
                <div className="text">
                  <h4>Chat with AI</h4>
                  <p>Get instant guidance</p>
                </div>
                <ChevronRight size={16} className="arrow" />
              </Link>
            </div>
          </div>

          <div className="sidebar-widget" id="resources">
            <h3><BookOpen size={18} /> Resources</h3>
            <div className="action-list">
              <Link to="/resources" className="action-item card-hover">
                <div className="icon bg-blue"><BookOpen size={18} /></div>
                <div className="text">
                  <h4>DSA Roadmap</h4>
                  <p>Step by step guide</p>
                </div>
                <ChevronRight size={16} className="arrow" />
              </Link>
              <Link to="/resources" className="action-item card-hover">
                <div className="icon bg-purple"><FileText size={18} /></div>
                <div className="text">
                  <h4>Resume Templates</h4>
                  <p>ATS friendly templates</p>
                </div>
                <ChevronRight size={16} className="arrow" />
              </Link>
              <Link to="/resources" className="action-item card-hover">
                <div className="icon bg-green"><Bot size={18} /></div>
                <div className="text">
                  <h4>Interview Tips</h4>
                  <p>Prepare like a pro</p>
                </div>
                <ChevronRight size={16} className="arrow" />
              </Link>
            </div>
            <Link to="/resources" className="btn-outline btn-full" style={{marginTop: '1rem'}}>View All Resources →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
