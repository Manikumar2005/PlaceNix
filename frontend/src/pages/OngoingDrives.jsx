import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../services/api';
import { Briefcase } from 'lucide-react';

function OngoingDrives() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Failed to load placement drives. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const ongoingDrives = companies.filter(c => c.status === 'ongoing');

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
          <span className="value text-accent">1-05-2026</span>
        </div>
      </div>
      
      <Link to={`/interviews/${company.id}`} className="btn-outline btn-full">
        View Details <span>→</span>
      </Link>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1rem' }}>
          <Briefcase size={28} /> Ongoing Placement Drives
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Currently active placement drives available for application.</p>
      </div>

      <div className="drives-section" style={{ width: '100%' }}>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading placement drives...</p>
          </div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : ongoingDrives.length === 0 ? (
          <div className="empty-state">
            <p>No ongoing placement drives found.</p>
          </div>
        ) : (
          <div className="company-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {ongoingDrives.map(renderCompanyCard)}
          </div>
        )}
      </div>
    </div>
  );
}

export default OngoingDrives;
