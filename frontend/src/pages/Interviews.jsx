import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInterviewQuestions, getCompanies } from '../services/api';
import { Briefcase, Calendar, Code, DollarSign, Building } from 'lucide-react';

function Interviews() {
  const { companyId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [questionsData, companiesData] = await Promise.all([
          getInterviewQuestions(companyId),
          getCompanies()
        ]);
        setQuestions(questionsData);
        
        const foundCompany = companiesData.find(c => c.id.toString() === companyId);
        setCompany(foundCompany);
      } catch (err) {
        console.error(err);
        setError("Could not load company details or questions.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  return (
    <div>
      <Link to="/" className="btn btn-ghost" style={{ marginBottom: '2rem' }}>
        <span>&larr;</span> Back to Dashboard
      </Link>
      
      <div className="dashboard-layout" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {company && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="company-logo" style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img 
                  src={`https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s+/g, '')}.com`} 
                  alt={company.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <div className="company-logo-placeholder" style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                  {company.name.charAt(0)}
                </div>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem' }}>{company.name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>{company.role}</p>
              </div>
            </div>

            <div className="grid">
              <div className="card-hover" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <DollarSign size={18} /> Package
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>{company.package}</div>
              </div>
              <div className="card-hover" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <Briefcase size={18} /> Eligibility CGPA
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{company.eligibility_cgpa}</div>
              </div>
              <div className="card-hover" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <Code size={18} /> Required Skills
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{company.required_skills}</div>
              </div>
              <div className="card-hover" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <Calendar size={18} /> Drive Date
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-accent)' }}>{company.drive_date}</div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Building size={24} color="var(--primary)"/> Interview Questions</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Prepare for these specific technical, HR, and coding questions asked previously.</p>
        </div>

      {loading ? (
        <p>Loading questions...</p>
      ) : error ? (
        <div className="card" style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
          <p style={{ color: '#991b1b' }}>{error}</p>
        </div>
      ) : (
        <div className="grid">
          {['technical', 'coding', 'hr'].map(type => {
            const typeQuestions = questions.filter(q => q.type === type);
            if (typeQuestions.length === 0) return null;
            
            return (
              <div key={type} className="card card-hover" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                <h3 style={{ textTransform: 'capitalize', color: 'var(--primary)', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {type} Questions
                </h3>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {typeQuestions.map(q => (
                    <li key={q.id} style={{ lineHeight: '1.5' }}>{q.question}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

export default Interviews;
