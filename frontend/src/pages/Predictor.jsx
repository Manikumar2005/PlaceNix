import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictPlacement } from '../services/api';
import { usePrediction } from '../context/PredictionContext';

function Predictor() {
  const navigate = useNavigate();
  const { setPredictionData } = usePrediction();
  
  const [formData, setFormData] = useState({
    cgpa: '',
    skills: '',
    projects: '',
    internships_count: '',
    aptitude_score: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    // Calculate counts from comma-separated strings
    const skillsCount = formData.skills ? formData.skills.split(',').filter(s => s.trim() !== '').length : 0;
    const projectsCount = formData.projects ? formData.projects.split(',').filter(p => p.trim() !== '').length : 0;
    
    try {
      const data = await predictPlacement({
        cgpa: parseFloat(formData.cgpa),
        skills_count: skillsCount,
        projects_count: projectsCount,
        internships_count: parseInt(formData.internships_count),
        aptitude_score: parseFloat(formData.aptitude_score)
      });
      setResult(data);
      
      const prob = data.placement_probability;
      const cgpa = parseFloat(formData.cgpa);
      const readiness = Math.min(100, Math.round(prob * 0.8 + (cgpa / 10) * 20));
      const status = readiness > 80 ? 'Excellent' : readiness > 60 ? 'Good' : 'Needs Work';
      
      setPredictionData({
        probability: prob,
        package: data.predicted_package,
        readiness: readiness,
        readinessStatus: status,
        cgpa: cgpa
      });
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError("Failed to fetch prediction. Ensure all fields are filled correctly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Placement Predictor</h2>
      <p style={{ marginBottom: '1.5rem' }}>Enter your academic details to predict your placement chances and expected salary.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>CGPA (Out of 10)</label>
          <input type="number" name="cgpa" className="form-control" step="0.01" min="0" max="10" value={formData.cgpa} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label>Tech Skills</label>
          <input type="text" name="skills" className="form-control" placeholder="e.g. React, Node, Python" value={formData.skills} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label>Project Names</label>
          <input type="text" name="projects" className="form-control" placeholder="e.g. E-commerce App, Chatbot" value={formData.projects} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label>Number of Internships</label>
          <input type="number" name="internships_count" className="form-control" min="0" value={formData.internships_count} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label>Aptitude Score (Out of 100)</label>
          <input type="number" name="aptitude_score" className="form-control" step="0.1" min="0" max="100" value={formData.aptitude_score} onChange={handleChange} required />
        </div>
        
        <button type="submit" className="btn btn-animated" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          {loading ? 'Predicting...' : 'Predict Placement'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(248, 113, 113, 0.15)', color: '#f87171', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Prediction Results</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p><strong>Placement Probability</strong></p>
              <h2 style={{ color: result.placement_probability > 50 ? '#4ade80' : '#f87171' }}>
                {result.placement_probability}%
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p><strong>Predicted Package</strong></p>
              <h2 style={{ color: '#00f2fe' }}>{result.predicted_package} LPA</h2>
            </div>
          </div>
          
          {result.reasons && result.reasons.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4>Areas for Improvement:</h4>
              <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                {result.reasons.map((reason, idx) => (
                  <li key={idx} style={{ marginBottom: '0.2rem' }}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Predictor;
