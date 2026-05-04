import re

with open('frontend/src/pages/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add hasInput state
content = content.replace(
    "const [filters, setFilters] = useState({ cgpa: '', skills: '' });",
    "const [filters, setFilters] = useState({ cgpa: '', skills: '' });\n  const [hasInput, setHasInput] = useState(false);"
)

# 2. Update stats default
content = content.replace(
    "totalDrives: 12,\n    eligibleCount: 8,\n    probability: 78,\n    package: 8.6,\n    readiness: 76,\n    readinessStatus: 'Good'",
    "totalDrives: 0,\n    eligibleCount: 0,\n    probability: 0,\n    package: 0,\n    readiness: 0,\n    readinessStatus: ''"
)

# 3. Update updatePredictions
old_up_pred = """  const updatePredictions = async (currentFilters = { cgpa: '', skills: '' }) => {
    try {
      // Default profile if none exists
      let profileData = {
        cgpa: 7.5,
        skills_count: 3,
        projects_count: 2,
        internships_count: 1,
        aptitude_score: 75
      };
      
      const stored = localStorage.getItem('placement_profile');
      if (stored) {
        profileData = { ...profileData, ...JSON.parse(stored) };
      }
      
      // Override with user input from filters
      if (currentFilters.cgpa) {
        profileData.cgpa = parseFloat(currentFilters.cgpa) || profileData.cgpa;
      }
      if (currentFilters.skills) {
        profileData.skills_count = currentFilters.skills.split(',').filter(s => s.trim()).length || profileData.skills_count;
      }
      
      const res = await predictPlacement(profileData);
      
      const prob = res.placement_probability;
      const readiness = Math.min(100, Math.round(prob * 0.8 + (profileData.cgpa / 10) * 20));
      const status = readiness > 80 ? 'Excellent' : readiness > 60 ? 'Good' : 'Needs Work';
      
      setStats(prev => ({
        ...prev,
        probability: prob,
        package: res.predicted_package,
        readiness: readiness,
        readinessStatus: status
      }));
    } catch (err) {
      console.error("Error updating predictions:", err);
    }
  };"""

new_up_pred = """  const updatePredictions = async (currentFilters = { cgpa: '', skills: '' }) => {
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
        setHasInput(false);
        return;
      }

      setHasInput(true);
      const res = await predictPlacement(profileData);
      
      const prob = res.placement_probability;
      const readiness = Math.min(100, Math.round(prob * 0.8 + (profileData.cgpa / 10) * 20));
      const status = readiness > 80 ? 'Excellent' : readiness > 60 ? 'Good' : 'Needs Work';
      
      setStats(prev => ({
        ...prev,
        probability: prob,
        package: res.predicted_package,
        readiness: readiness,
        readinessStatus: status
      }));
    } catch (err) {
      console.error("Error updating predictions:", err);
    }
  };"""
content = content.replace(old_up_pred, new_up_pred)

# 4. Update renderEligibilityTag
old_eligibility = """  const renderEligibilityTag = (company) => {
    if (!filters.cgpa && !filters.skills) return <span className="badge-eligible">Eligible</span>;
    
    let isEligible = true;
    let maybeEligible = false;
    
    if (filters.cgpa) {
      const userCgpa = parseFloat(filters.cgpa);
      if (!isNaN(userCgpa) && userCgpa < company.eligibility_cgpa) {
        isEligible = false;
      } else if (!isNaN(userCgpa) && userCgpa === company.eligibility_cgpa) {
        maybeEligible = true;
      }
    }
    
    if (filters.skills) {
      const userSkills = filters.skills.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
      const compSkills = company.required_skills.split(',').map(s => s.trim().toLowerCase());
      
      if (userSkills.length > 0 && compSkills.length > 0) {
        const matchedSkills = userSkills.filter(skill => compSkills.includes(skill));
        if (matchedSkills.length === 0) {
          isEligible = false;
        } else if (matchedSkills.length < compSkills.length) {
          maybeEligible = true;
        }
      }
    }
    
    if (!isEligible) {
      return <span className="badge-not-eligible">Not Eligible</span>;
    } else if (maybeEligible) {
      return <span className="badge-maybe-eligible">Maybe Eligible</span>;
    }
    return <span className="badge-eligible">Eligible</span>;
  };"""

new_eligibility = """  const renderEligibilityTag = (company) => {
    if (!filters.cgpa) {
      return <span className="badge-neutral" style={{background: 'rgba(255,255,255,0.1)', color: '#ccc', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem'}}>Enter CGPA to check eligibility</span>;
    }
    
    let isEligible = true;
    
    if (filters.cgpa) {
      const userCgpa = parseFloat(filters.cgpa);
      if (!isNaN(userCgpa) && userCgpa < company.eligibility_cgpa) {
        isEligible = false;
      }
    }
    
    if (filters.skills && isEligible) {
      const userSkills = filters.skills.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
      const compSkills = company.required_skills.split(',').map(s => s.trim().toLowerCase());
      
      if (userSkills.length > 0 && compSkills.length > 0) {
        const matchedSkills = userSkills.filter(skill => compSkills.includes(skill));
        if (matchedSkills.length === 0) {
          isEligible = false;
        }
      }
    }
    
    if (!isEligible) {
      return <span className="badge-not-eligible">Not Eligible</span>;
    }
    return <span className="badge-eligible">Eligible</span>;
  };"""
content = content.replace(old_eligibility, new_eligibility)


# 5. Fix Stats cards
old_prob_card = """        <div className="summary-card gradient-3 card-hover">
          <div className="icon-wrapper"><TrendingUp size={24} /></div>
          <div className="info">
            <p>Placement Probability</p>
            <h3>{stats.probability}%</h3>
            <small>Good chance! <ChevronRight size={14}/></small>
          </div>
        </div>"""
new_prob_card = """        <div className="summary-card gradient-3 card-hover">
          <div className="icon-wrapper"><TrendingUp size={24} /></div>
          <div className="info">
            <p>Placement Probability</p>
            {hasInput ? (
              <>
                <h3>{stats.probability}%</h3>
                <small>Good chance! <ChevronRight size={14}/></small>
              </>
            ) : (
              <p style={{fontSize:'0.85rem', marginTop:'5px', color:'var(--text-muted)'}}>Enter details</p>
            )}
          </div>
        </div>"""
content = content.replace(old_prob_card, new_prob_card)

old_pkg_card = """        <div className="summary-card gradient-4 card-hover">
          <div className="icon-wrapper"><DollarSign size={24} /></div>
          <div className="info">
            <p>Predicted Package</p>
            <h3>{stats.package} LPA</h3>
            <small>Expected <ChevronRight size={14}/></small>
          </div>
        </div>"""
new_pkg_card = """        <div className="summary-card gradient-4 card-hover">
          <div className="icon-wrapper"><DollarSign size={24} /></div>
          <div className="info">
            <p>Predicted Package</p>
            {hasInput ? (
              <>
                <h3>{stats.package} LPA</h3>
                <small>Expected <ChevronRight size={14}/></small>
              </>
            ) : (
              <p style={{fontSize:'0.85rem', marginTop:'5px', color:'var(--text-muted)'}}>Enter details</p>
            )}
          </div>
        </div>"""
content = content.replace(old_pkg_card, new_pkg_card)

old_readiness = """          <div className="sidebar-widget readiness-widget">
            <h3>Placement Readiness Score</h3>
            <div className="progress-circle" style={{"--p": stats.readiness}}>
              <span className="percentage">{stats.readiness}%</span>
              <span className="status">{stats.readinessStatus}</span>
            </div>
            <p className="motivation">Keep improving! <TrendingUp size={16} color="#4ade80"/></p>
            <Link to="/predictions" className="btn-outline btn-full">View Full Report →</Link>
          </div>"""
new_readiness = """          <div className="sidebar-widget readiness-widget">
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
              <div style={{padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                <p>Enter your CGPA and skills to see your placement readiness score.</p>
              </div>
            )}
          </div>"""
content = content.replace(old_readiness, new_readiness)

# 6. Separate Ongoing and Upcoming drives
old_drives_section = """          {/* Placement Drives List */}
          <div className="drives-section">
            <div className="section-header">
              <h3><Briefcase size={20} /> Upcoming Placement Drives</h3>
              <Link to="/companies" className="link-primary">View All Companies →</Link>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading placement drives...</p>
              </div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : companies.length === 0 ? (
              <div className="empty-state">
                <p>No placement drives found matching your criteria.</p>
              </div>
            ) : (
              <div className="company-grid">
                {companies.map(renderCompanyCard)}
              </div>
            )}
          </div>"""

new_drives_section = """          {/* Placement Drives List */}
          <div className="drives-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading placement drives...</p>
              </div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : companies.length === 0 ? (
              <div className="empty-state">
                <p>No placement drives found matching your criteria.</p>
              </div>
            ) : (
              <>
                {/* Ongoing Placement Drives */}
                <div className="section-header">
                  <h3><Briefcase size={20} /> Ongoing Placement Drives</h3>
                  <Link to="/ongoing-drives" className="link-primary">View All Ongoing →</Link>
                </div>
                <div className="company-grid" style={{marginBottom: '2rem'}}>
                  {companies.filter(c => c.drive_date <= new Date().toISOString().split('T')[0]).length > 0 ? (
                    companies.filter(c => c.drive_date <= new Date().toISOString().split('T')[0]).map(renderCompanyCard)
                  ) : (
                    <p style={{color: 'var(--text-muted)'}}>No ongoing drives at the moment.</p>
                  )}
                </div>

                {/* Upcoming Placement Drives */}
                <div className="section-header">
                  <h3><Briefcase size={20} /> Upcoming Placement Drives</h3>
                </div>
                <div className="company-grid">
                  {companies.filter(c => c.drive_date > new Date().toISOString().split('T')[0]).length > 0 ? (
                    companies.filter(c => c.drive_date > new Date().toISOString().split('T')[0]).map(renderCompanyCard)
                  ) : (
                    <p style={{color: 'var(--text-muted)'}}>No upcoming drives at the moment.</p>
                  )}
                </div>
              </>
            )}
          </div>"""
content = content.replace(old_drives_section, new_drives_section)

# Fix double chatbot links
old_double_chatbot = """              <Link to="/chatbot" className="action-item card-hover">
                <div className="icon chat"><MessageSquare size={18} /></div>
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
              </Link>"""
new_single_chatbot = """              <Link to="/interviews/1" className="action-item card-hover">
                <div className="icon chat"><MessageSquare size={18} /></div>
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
              </Link>"""
content = content.replace(old_double_chatbot, new_single_chatbot)

with open('frontend/src/pages/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
