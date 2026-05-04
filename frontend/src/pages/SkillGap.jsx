import { useState, useEffect } from 'react';
import { getCompanies, checkSkillGap } from '../services/api';

function SkillGap() {
  const [skillsInput, setSkillsInput] = useState('');
  const [companies, setCompanies] = useState([]);
  const [gapResults, setGapResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch companies once on load
    const fetchAllCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchAllCompanies();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!skillsInput.trim()) return;

    setLoading(true);
    setError(null);
    
    // Convert comma string to array
    const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(s => s);
    
    const results = {};
    try {
      // Analyze gap for all companies in parallel
      const promises = companies.map(company => 
        checkSkillGap(company.id, skillsArray).then(data => ({ id: company.id, data }))
      );
      
      const resolved = await Promise.all(promises);
      for (const res of resolved) {
        results[res.id] = res.data;
      }
      
      setGapResults(results);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze skill gaps.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Skill Gap Analysis</h2>
        <p style={{ marginBottom: '1.5rem' }}>Enter your current skills to see how well you match with upcoming placement drives.</p>
        
        <form onSubmit={handleAnalyze} className="flex">
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Python, Java, React, SQL" 
              value={skillsInput} 
              onChange={(e) => setSkillsInput(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="btn btn-animated" disabled={loading || companies.length === 0}>
            {loading ? 'Analyzing...' : 'Analyze Gaps'}
          </button>
        </form>
        {error && <p style={{ color: '#f87171', marginTop: '1rem' }}>{error}</p>}
      </div>

      {Object.keys(gapResults).length > 0 && (
        <>
          <h3 style={{ marginBottom: '1rem' }}>Company Fit Results</h3>
          <div className="grid">
            {companies.map(company => {
              const res = gapResults[company.id];
              if (!res) return null;
              
              // Color code based on fit score
              let scoreColor = '#f87171'; // red
              if (res.fit_score >= 80) scoreColor = '#4ade80'; // green
              else if (res.fit_score >= 40) scoreColor = '#facc15'; // yellow

              return (
                <div key={company.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>{company.name}</h3>
                    <div style={{ 
                      background: `rgba(${scoreColor === '#4ade80' ? '74, 222, 128' : scoreColor === '#facc15' ? '250, 204, 21' : '248, 113, 113'}, 0.15)`, 
                      color: scoreColor, 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '20px', 
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}>
                      {res.fit_score}% Fit
                    </div>
                  </div>
                  
                  <p><strong>Role:</strong> {company.role}</p>
                  
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ color: '#4ade80', marginBottom: '0.5rem' }}><strong>Matched Skills:</strong></p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {res.matched.length > 0 ? res.matched.map((skill, i) => (
                        <span key={i} style={{ background: 'rgba(74, 222, 128, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          {skill}
                        </span>
                      )) : <span style={{ color: 'var(--text-muted)' }}>None</span>}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    <p style={{ color: '#f87171', marginBottom: '0.5rem' }}><strong>Missing Skills:</strong></p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {res.missing.length > 0 ? res.missing.map((skill, i) => (
                        <span key={i} style={{ background: 'rgba(248, 113, 113, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          {skill}
                        </span>
                      )) : <span style={{ color: 'var(--text-muted)' }}>None! You're a perfect fit.</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default SkillGap;
