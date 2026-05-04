import { useState } from 'react';
import { submitProfile, predictPlacement } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    cgpa: '',
    skills: '',
    projects: '',
    internships: '',
    aptitude_score: ''
  });
  const [status, setStatus] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus('');
      // Compute counts for ML
      const skills_count = formData.skills.split(',').filter(s => s.trim() !== '').length;
      const projects_count = formData.projects ? formData.projects.split('\n').filter(p => p.trim() !== '').length : 0;
      const internships_count = formData.internships ? formData.internships.split('\n').filter(i => i.trim() !== '').length : 0;
      
      const mlPayload = {
        cgpa: parseFloat(formData.cgpa),
        skills_count,
        projects_count,
        internships_count,
        aptitude_score: parseFloat(formData.aptitude_score)
      };

      setPredicting(true);
      const predictionData = await predictPlacement(mlPayload);
      setPrediction(predictionData);
      
    } catch (error) {
      console.error(error);
      setStatus('Error running prediction. Ensure all fields are correct.');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
      {/* Left Column: Form */}
      <div className="card" style={{ flex: '1 1 500px', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(0, 242, 254, 0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        
        <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem', background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Perfect Profile</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
          Welcome back, <strong style={{ color: 'white' }}>{user?.email}</strong>. Update your academic profile to let our AI predict your placement probability.
        </p>

        {status && <div style={{ padding: '1rem', backgroundColor: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)', marginBottom: '1.5rem', borderRadius: '8px' }}>{status}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input required type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>CGPA (0-10)</label>
              <input required type="number" step="0.1" min="0" max="10" name="cgpa" className="form-control" value={formData.cgpa} onChange={handleChange} placeholder="e.g. 8.5" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input required type="text" name="skills" className="form-control" value={formData.skills} onChange={handleChange} placeholder="e.g. Python, React, Java, SQL" />
          </div>
          
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Projects (One per line)</label>
              <textarea name="projects" className="form-control" rows="4" value={formData.projects} onChange={handleChange} placeholder="E-commerce Website&#10;ML Predictor"></textarea>
            </div>
            <div className="form-group">
              <label>Internships (One per line)</label>
              <textarea name="internships" className="form-control" rows="4" value={formData.internships} onChange={handleChange} placeholder="Software Dev Intern @ Google&#10;Frontend Intern @ Startup"></textarea>
            </div>
          </div>

          <div className="form-group">
            <label>Aptitude Score (0-100)</label>
            <input required type="number" min="0" max="100" step="1" name="aptitude_score" className="form-control" value={formData.aptitude_score} onChange={handleChange} placeholder="e.g. 85" />
          </div>
          
          <button type="submit" className="btn btn-animated" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem', borderRadius: '12px' }} disabled={predicting}>
            {predicting ? 'Running AI Models...' : 'Analyze My Profile & Predict'}
          </button>
        </form>
      </div>

      {/* Right Column: Prediction Results */}
      <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {prediction ? (
          <div className="card" style={{ padding: '2.5rem', background: 'rgba(240, 147, 251, 0.05)', border: '1px solid rgba(240, 147, 251, 0.2)', borderRadius: '16px', animation: 'fadeIn 0.6s ease-out' }}>
            <h3 style={{ color: '#f093fb', marginBottom: '2rem', textAlign: 'center', fontSize: '1.8rem' }}>AI Prediction Results</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '12px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: `${prediction.placement_probability}%`, bottom: 0, width: '100%', background: 'linear-gradient(90deg, rgba(74, 222, 128, 0.2), transparent)', zIndex: 0 }}></div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', zIndex: 1, position: 'relative' }}>Placement Probability</p>
                <h2 style={{ color: prediction.placement_probability > 70 ? '#4ade80' : prediction.placement_probability > 40 ? '#facc15' : '#f87171', fontSize: '4rem', zIndex: 1, position: 'relative' }}>
                  {prediction.placement_probability}%
                </h2>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Expected Package</p>
                <h2 style={{ color: 'var(--primary-color)', fontSize: '3rem' }}>
                  {prediction.predicted_package_lpa} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>LPA</span>
                </h2>
              </div>
            </div>
            
            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              These predictions are based on historical campus placement data using Logistic and Linear Regression models.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '2rem' }}>
              ✨
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Awaiting Profile Data</h3>
            <p style={{ color: '#52525b', maxWidth: '300px' }}>
              Fill out the form on the left and click predict to see your personalized AI placement chances and expected package.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
