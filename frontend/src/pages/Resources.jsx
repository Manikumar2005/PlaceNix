import React, { useState } from 'react';
import { BookOpen, FileText, Bot, Code, CheckCircle, Download, Monitor, Database, Target, Users, Lightbulb, Globe, X } from 'lucide-react';

function Resources() {
  const [activeResource, setActiveResource] = useState(null);

  const resourcesList = [
    {
      id: 'dsa',
      title: 'DSA Roadmap',
      icon: <Code size={24} />,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.15)',
      description: 'Step-by-step Data Structures & Algorithms guide optimized for top tech companies.',
      content: (
        <div>
          <h4>Phase 1: Basics (Week 1-2)</h4>
          <ul><li>Arrays & Strings</li><li>Time & Space Complexity</li><li>Basic Recursion</li></ul>
          <h4>Phase 2: Intermediate (Week 3-5)</h4>
          <ul><li>Linked Lists</li><li>Stacks & Queues</li><li>Trees (BST)</li></ul>
          <h4>Phase 3: Advanced (Week 6-8)</h4>
          <ul><li>Graphs (BFS/DFS)</li><li>Dynamic Programming</li><li>Tries & Segment Trees</li></ul>
        </div>
      )
    },
    {
      id: 'resume',
      title: 'Resume Templates',
      icon: <FileText size={24} />,
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.15)',
      description: 'ATS-friendly resume templates proven to pass initial screenings at FAANG and startups.',
      content: (
        <div>
          <h4>Available Templates</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Software Engineer (Fresher)</span>
              <button className="btn-primary" style={{padding: '5px 10px', fontSize:'0.8rem'}}><Download size={14}/> Download</button>
            </div>
            <div style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Data Scientist / ML</span>
              <button className="btn-primary" style={{padding: '5px 10px', fontSize:'0.8rem'}}><Download size={14}/> Download</button>
            </div>
            <div style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Frontend Developer</span>
              <button className="btn-primary" style={{padding: '5px 10px', fontSize:'0.8rem'}}><Download size={14}/> Download</button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'interview',
      title: 'Interview Tips',
      icon: <Bot size={24} />,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.15)',
      description: 'Expert advice on how to communicate effectively during both HR and technical rounds.',
      content: (
        <div>
          <h4>Technical Rounds</h4>
          <ul><li>Always think out loud and explain your approach before coding.</li><li>Clarify constraints and edge cases.</li><li>Optimize only after getting a brute-force solution.</li></ul>
          <h4>HR & Behavioral Rounds</h4>
          <ul><li>Use the STAR method (Situation, Task, Action, Result).</li><li>Be honest about your weaknesses but show how you are improving.</li><li>Prepare questions to ask the interviewer.</li></ul>
        </div>
      )
    },
    {
      id: 'aptitude',
      title: 'Aptitude Preparation',
      icon: <Target size={24} />,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      description: 'Master quantitative aptitude, logical reasoning, and verbal ability.',
      content: (
        <div>
          <h4>Topics to Cover</h4>
          <ul><li>Quantitative: Time & Work, Speed & Distance, Percentages, Profit & Loss.</li><li>Logical: Puzzles, Seating Arrangement, Blood Relations.</li><li>Verbal: Reading Comprehension, Error Spotting.</li></ul>
          <p>Practice at least 30 minutes daily to improve speed and accuracy.</p>
        </div>
      )
    },
    {
      id: 'system_design',
      title: 'System Design Basics',
      icon: <Monitor size={24} />,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.15)',
      description: 'Learn how to design scalable distributed systems for top product companies.',
      content: (
        <div>
          <h4>Core Concepts</h4>
          <ul><li>Load Balancing & Caching</li><li>Database Sharding & Replication</li><li>Microservices vs Monolith</li><li>CAP Theorem</li></ul>
          <h4>Popular Case Studies</h4>
          <ul><li>Design Netflix / YouTube</li><li>Design URL Shortener</li><li>Design Uber / Grab</li></ul>
        </div>
      )
    },
    {
      id: 'practice',
      title: 'Coding Practice Platforms',
      icon: <Database size={24} />,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.15)',
      description: 'Curated list of the best platforms to practice competitive programming.',
      content: (
        <div>
          <ul>
            <li><strong>LeetCode:</strong> Best for FAANG interview preparation.</li>
            <li><strong>Codeforces:</strong> Best for competitive programming and speed.</li>
            <li><strong>HackerRank:</strong> Good for beginners and company-specific tests.</li>
            <li><strong>GeeksforGeeks:</strong> Great for reading company interview experiences.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'hr_guide',
      title: 'HR Interview Guide',
      icon: <Users size={24} />,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.15)',
      description: 'Comprehensive guide to crack behavioral and managerial rounds.',
      content: (
        <div>
          <h4>Common Questions</h4>
          <ul>
            <li>Tell me about yourself.</li>
            <li>Why should we hire you?</li>
            <li>Where do you see yourself in 5 years?</li>
            <li>Tell me about a time you handled a conflict.</li>
          </ul>
          <p>Remember to keep your answers concise, positive, and aligned with the company culture.</p>
        </div>
      )
    },
    {
      id: 'projects',
      title: 'Project Ideas',
      icon: <Lightbulb size={24} />,
      color: '#14b8a6',
      bg: 'rgba(20, 184, 166, 0.15)',
      description: 'Standout project ideas to boost your resume value.',
      content: (
        <div>
          <h4>Web Development</h4>
          <ul><li>E-commerce with payment gateway</li><li>Real-time chat application using WebSockets</li><li>AI-powered resume analyzer</li></ul>
          <h4>Machine Learning</h4>
          <ul><li>Stock price predictor</li><li>Sentiment analysis for Twitter</li><li>Face recognition attendance system</li></ul>
        </div>
      )
    },
    {
      id: 'github',
      title: 'GitHub Portfolio Tips',
      icon: <Globe size={24} />,
      color: '#64748b',
      bg: 'rgba(100, 116, 139, 0.15)',
      description: 'How to maintain a professional GitHub profile that recruiters love.',
      content: (
        <div>
          <h4>Best Practices</h4>
          <ul>
            <li>Pin your top 4-6 projects.</li>
            <li>Write excellent READMEs with screenshots and setup instructions.</li>
            <li>Keep a consistent commit history.</li>
            <li>Use a descriptive profile bio and add a link to your portfolio website.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      <div style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '1rem' }}>
          <BookOpen size={28} /> Placement Resources Center
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Everything you need to prepare for your campus placements in one place.</p>
      </div>

      <div className="company-grid">
        {resourcesList.map((res) => (
          <div key={res.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
              <div style={{ padding: '12px', background: res.bg, color: res.color, borderRadius: '12px' }}>
                {res.icon}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{res.title}</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5', flex: 1 }}>
              {res.description}
            </p>
            <button 
              className="btn-outline btn-full" 
              onClick={() => setActiveResource(res)}
            >
              View Resource →
            </button>
          </div>
        ))}
      </div>

      {activeResource && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)',
            borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ 
              padding: '20px', borderBottom: '1px solid var(--border-color)', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <span style={{ color: activeResource.color }}>{activeResource.icon}</span>
                {activeResource.title}
              </h3>
              <button onClick={() => setActiveResource(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, lineHeight: '1.6' }} className="markdown-body">
              {activeResource.content}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setActiveResource(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resources;
