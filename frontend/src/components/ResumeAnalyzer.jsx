import { useState } from 'react';
import { analyzeResume } from '../services/api';

function ResumeAnalyzer() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !text.trim()) {
      setError('Please enter text or select a file to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else {
      // The backend accepts JSON with { text: "..." } but since we're using formData API call...
      // Let's modify our formData to also include text if file isn't present
      // Wait, our backend supports both. For simplicity, we can send text as a blob or json.
      // Wait, api.js uses FormData. Let's send a mock file or just JSON.
      // Actually, if we send JSON, we need to change headers in api.js.
      // Let's just create a Blob from the text and append it as a file.
      const blob = new Blob([text], { type: 'text/plain' });
      formData.append('file', blob, 'resume.txt');
    }

    try {
      const data = await analyzeResume(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4ade80';
    if (score >= 50) return '#facc15';
    return '#f87171';
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(240, 147, 251, 0.2) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ marginBottom: '0.5rem', background: 'linear-gradient(to right, #f093fb, #f5576c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI Resume Analyzer
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Paste your resume text or upload a PDF/TXT file to get an ATS match score against key skills.</p>

        {!result && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea 
              className="form-control" 
              placeholder="Paste your resume text here..." 
              rows="6"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ resize: 'vertical' }}
            ></textarea>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>OR</span>
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleFileChange} 
                className="form-control" 
                style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)' }}
              />
            </div>
            
            <button onClick={handleAnalyze} className="btn" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white', marginTop: '1rem' }}>
              Analyze Resume
            </button>
          </div>
        )}

        {error && <p style={{ color: '#f87171', marginTop: '1rem' }}>{error}</p>}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ borderLeftColor: '#f093fb' }}></div>
            <p style={{ marginTop: '1rem', color: '#f093fb' }}>Analyzing keywords and structure...</p>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>ATS Match Score</h3>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getScoreColor(result.score) }}>{result.score}%</span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${result.score}%`, 
                  height: '100%', 
                  background: getScoreColor(result.score),
                  transition: 'width 1s ease-out'
                }}></div>
              </div>
            </div>

            <div className="grid" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: '12px', padding: '1.5rem' }}>
                <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>Found Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {result.found_skills.length > 0 ? result.found_skills.map(skill => (
                    <span key={skill} style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                      {skill}
                    </span>
                  )) : <span style={{ color: 'var(--text-muted)' }}>No technical keywords found.</span>}
                </div>
              </div>

              <div style={{ background: 'rgba(248, 113, 113, 0.05)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '12px', padding: '1.5rem' }}>
                <h4 style={{ color: '#f87171', marginBottom: '1rem' }}>Missing Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {result.missing_skills.length > 0 ? result.missing_skills.map(skill => (
                    <span key={skill} style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                      {skill}
                    </span>
                  )) : <span style={{ color: 'var(--text-muted)' }}>Great job! You have all key skills.</span>}
                </div>
              </div>
            </div>
            
            <div style={{ background: 'rgba(250, 204, 21, 0.05)', border: '1px solid rgba(250, 204, 21, 0.2)', borderRadius: '12px', padding: '1.5rem', marginTop: '1rem' }}>
              <h4 style={{ color: '#facc15', marginBottom: '1rem' }}>Improvement Suggestions</h4>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                {result.suggestions.map((sug, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{sug}</li>
                ))}
                {result.suggestions.length === 0 && <li>Your resume structure looks solid!</li>}
              </ul>
            </div>
            
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button onClick={() => {setResult(null); setFile(null); setText('');}} className="btn btn-ghost">
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
