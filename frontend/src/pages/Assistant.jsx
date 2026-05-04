import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { 
  chatWithBot, 
  fetchChatSessions, 
  createChatSession, 
  fetchChatMessages, 
  sendSessionMessage,
  startMockInterview,
  answerMockQuestion,
  getMockResults,
  uploadChatFile
} from '../services/api';
import { MessageSquare, Bot, Plus, Paperclip, Send, X, FileText, ChevronRight } from 'lucide-react';

function Assistant() {
  const { user } = useAuth();
  
  // Modes: 'Resume Help', 'Interview Prep', 'Placement Advice', 'Mock Interview'
  const [mode, setMode] = useState('Placement Advice');
  
  // Mock Interview State: 'inactive', 'ongoing', 'completed'
  const [mockState, setMockState] = useState('inactive');
  
  // State for session management (Standard Chat)
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachedFile, setAttachedFile] = useState(null);

  const commonQuestions = [
    "how to improve my skills",
    "how to improve my resume",
    "how to improve my dsa skills",
    "what are the most asked hr questions",
    "what are the most asked technical questions",
    "how to introduce myself",
    "tips for campus placements",
    "how to negotiate salary",
    "how to answer what is your greatest weakness",
    "how to prepare for coding rounds"
  ];

  // Initialize Welcome Message based on Mode
  useEffect(() => {
    if (mode === 'Mock Interview') {
      if (mockState === 'inactive') {
        setMessages([
          { text: "Welcome to the Mock Interview Engine. Please select a difficulty level below to begin your simulated interview session.", sender: 'bot' }
        ]);
      }
    } else {
      if (!activeSession) {
        setMessages([
          { text: `Hi there! I am your AI Prep Bot. You are currently in **${mode}** mode. How can I help you today?`, sender: 'bot' }
        ]);
      }
    }
  }, [mode, mockState, activeSession]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    
    if (mode !== 'Mock Interview' && val.length > 2) {
      const match = commonQuestions.find(q => q.toLowerCase().startsWith(val.toLowerCase()));
      if (match) {
        setPrediction(val + match.slice(val.length));
      } else {
        setPrediction('');
      }
    } else {
      setPrediction('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && prediction) {
      e.preventDefault();
      setInput(prediction);
      setPrediction('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setMessages((prev) => [...prev, { text: `Extracting text from ${file.name}...`, sender: 'bot' }]);
    
    try {
        const res = await uploadChatFile(file);
        setAttachedFile({ name: file.name, text: res.text });
        setMessages((prev) => prev.filter(m => !m.text.startsWith('Extracting text from')));
    } catch (error) {
        setMessages((prev) => prev.filter(m => !m.text.startsWith('Extracting text from')));
        setMessages((prev) => [...prev, { text: error.response?.data?.error || "Error extracting text from file.", sender: 'bot' }]);
    } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem('placement_profile');
    if (savedData) {
      try {
        setStudentData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse student data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (user && mode !== 'Mock Interview') {
      loadSessions();
    }
  }, [user, mode]);

  const loadSessions = async () => {
    try {
      const data = await fetchChatSessions(user.id);
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions", error);
    }
  };

  const loadSessionMessages = async (session) => {
    if (mode === 'Mock Interview') return;
    setActiveSession(session);
    setLoading(true);
    try {
      const data = await fetchChatMessages(session.id);
      if (data.length > 0) {
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    if (mode === 'Mock Interview') {
      setMockState('inactive');
    }
    setActiveSession(null);
    setMessages([
      { text: `Hi there! I am your AI Prep Bot. You are currently in **${mode}** mode. How can I help you today?`, sender: 'bot' }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Mock Interview Start
  const handleStartMock = async (difficulty) => {
    if (!user) {
        setMessages(prev => [...prev, { text: "⚠️ You must be logged in to take a mock interview.", sender: 'bot' }]);
        return;
    }
    setLoading(true);
    try {
        const res = await startMockInterview(user.id, difficulty);
        setMockState('ongoing');
        setMessages([
            { text: `Starting **${difficulty}** mock interview. Let's begin!`, sender: 'bot' },
            { text: `**Question:**\n${res.question}`, sender: 'bot' }
        ]);
    } catch (error) {
        console.error("Error starting mock:", error);
        setMessages(prev => [...prev, { text: "Error starting the interview.", sender: 'bot' }]);
    } finally {
        setLoading(false);
    }
  };

  // Handle Message Submission
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachedFile) {
        setMessages((prev) => [...prev, { text: "Please provide an answer, query, or attach a file.", sender: 'bot' }]);
        return;
    }

    const userMessage = { text: input || (attachedFile ? `[Uploaded ${attachedFile.name}]` : ""), sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    
    let currentInput = input;
    if (attachedFile) {
        currentInput = `[Attached File: ${attachedFile.name}]\n${attachedFile.text}\n\nUser Query: ${input}`;
    }
    
    setInput('');
    setAttachedFile(null);
    setPrediction('');
    setLoading(true);

    try {
      if (mode === 'Mock Interview' && mockState === 'ongoing') {
          const res = await answerMockQuestion(user.id, currentInput);
          
          let feedbackText = `**Score:** ${res.evaluation.score}/10\n\n**Feedback:**\n`;
          res.evaluation.feedback.forEach(f => feedbackText += `- ${f}\n`);
          
          setMessages(prev => [...prev, { text: feedbackText, sender: 'bot' }]);
          
          if (res.status === 'completed') {
              setMockState('completed');
              const finalRes = await getMockResults(user.id);
              let resultText = `### Mock Interview Completed!\n\n**Average Score:** ${finalRes.average_score}/10\n\n**Suggestions:**\n`;
              finalRes.overall_suggestions.forEach(s => resultText += `- ${s}\n`);
              setMessages(prev => [...prev, { text: resultText, sender: 'bot' }]);
          } else {
              setMessages(prev => [...prev, { text: `**Next Question (${res.progress}):**\n${res.next_question}`, sender: 'bot' }]);
          }
      } else {
        let contextualInput = `[Current Mode: ${mode}]\nUser: ${currentInput}`;
        
        if (user) {
          let currentSessionId = activeSession?.id;
          if (!currentSessionId) {
            const newSession = await createChatSession(user.id, currentInput.substring(0, 30) + '...');
            currentSessionId = newSession.id;
            setActiveSession(newSession);
            setSessions(prev => [newSession, ...prev]); 
          }

          const data = await sendSessionMessage(currentSessionId, contextualInput, studentData);
          setMessages((prev) => [...prev, { text: data.reply, sender: 'bot' }]);
          
          if (data.session) {
             setSessions(prev => [data.session, ...prev.filter(s => s.id !== data.session.id)]);
          }
        } else {
          const data = await chatWithBot(contextualInput, studentData);
          setMessages((prev) => [...prev, { text: data.reply, sender: 'bot' }]);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { text: "Sorry, I'm having trouble connecting right now. Please try again later.", sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: '100%' }}>
        
        {/* Sidebar - Modes & History */}
        <div className="sidebar-widget" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>Select Mode</h3>
              <div className="action-list">
                  {['Placement Advice', 'Resume Help', 'Interview Prep', 'Mock Interview'].map(m => (
                      <button 
                          key={m}
                          onClick={() => { setMode(m); handleNewChat(); }}
                          className="action-item card-hover"
                          style={{
                              background: mode === m ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255,255,255,0.03)',
                              border: mode === m ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                              color: mode === m ? 'var(--primary)' : 'var(--text-muted)',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left'
                          }}
                      >
                          <div className="text" style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: mode === m ? 'var(--primary)' : 'var(--text-main)' }}>{m}</h4>
                          </div>
                          {mode === m && <ChevronRight size={16} />}
                      </button>
                  ))}
              </div>
          </div>

          <button 
            onClick={handleNewChat}
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem' }}
          >
            <Plus size={18} /> New Chat
          </button>
          
          {!user && (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Log in to save your conversation history.
            </div>
          )}

          {mode !== 'Mock Interview' && (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sessions.map(session => (
                <div 
                  key={session.id}
                  onClick={() => loadSessionMessages(session)}
                  className="action-item"
                  style={{
                    cursor: 'pointer',
                    background: activeSession?.id === session.id ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                    borderLeft: activeSession?.id === session.id ? '3px solid var(--primary)' : '3px solid transparent',
                    borderRight: 'none', borderTop: 'none', borderBottom: 'none', borderRadius: '0 8px 8px 0',
                    color: activeSession?.id === session.id ? 'white' : 'var(--text-muted)',
                    padding: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <MessageSquare size={16} style={{ opacity: 0.7 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {session.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div 
          className="sidebar-widget" 
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            overflow: 'hidden', 
            padding: 0,
            border: '1px solid var(--primary)'
          }}
        >
          
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', color: 'var(--primary)' }}>
              <Bot size={24} />
              {activeSession ? activeSession.title : (mode === 'Mock Interview' ? 'AI Mock Interview Engine' : 'AI Assistant')}
            </h2>
            <span style={{ padding: '0.3rem 0.8rem', background: 'rgba(14, 165, 233, 0.15)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
              Mode: {mode}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{ 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-main)',
                  padding: '0.8rem 1.2rem',
                  borderRadius: msg.sender === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                  maxWidth: '80%',
                  border: msg.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
                  animation: 'fadeIn 0.3s ease-out',
                  lineHeight: '1.5',
                  boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(14, 165, 233, 0.3)' : 'none'
                }}
              >
                {msg.sender === 'user' ? (
                  msg.text
                ) : (
                  <div className="markdown-body" style={{ fontSize: '0.95rem' }}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '20px 20px 20px 0', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', height: '20px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                  <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></div>
                  <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></div>
                </div>
                <style>{`
                  @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.5); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                  }
                `}</style>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions / Input Area */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
            
            {mode === 'Mock Interview' && mockState === 'inactive' && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => handleStartMock('easy')} className="btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>Start Easy</button>
                    <button onClick={() => handleStartMock('medium')} className="btn-outline" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>Start Medium</button>
                    <button onClick={() => handleStartMock('hard')} className="btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Start Hard</button>
                </div>
            )}

            {mode !== 'Mock Interview' && (
                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {mode === 'Placement Advice' && (
                        <>
                            <button onClick={() => setInput('What are my chances of placement?')} className="badge-eligible" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>My Chances</button>
                            <button onClick={() => setInput('How can I improve my profile?')} className="badge-eligible" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>Improve Profile</button>
                            <button onClick={() => setInput('What are the best companies for me?')} className="badge-eligible" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>Best Companies</button>
                            <button onClick={() => setInput('What skills should I learn next?')} className="badge-eligible" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>Next Skills</button>
                        </>
                    )}
                    {mode === 'Resume Help' && (
                        <>
                            <button onClick={() => setInput('How can I make my resume stand out?')} className="badge-eligible" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>Stand Out Resume</button>
                            <button onClick={() => setInput('Check my resume formatting')} className="badge-eligible" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>Format Check</button>
                            <button onClick={() => setInput('How to write a summary')} className="badge-eligible" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>Write Summary</button>
                        </>
                    )}
                    {mode === 'Interview Prep' && (
                        <>
                            <button onClick={() => setInput('Most asked technical questions')} className="badge-eligible" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>Technical Questions</button>
                            <button onClick={() => setInput('HR question tips')} className="badge-eligible" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>HR Tips</button>
                            <button onClick={() => setInput('How to introduce myself')} className="badge-eligible" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>Introduce Myself</button>
                        </>
                    )}
                </div>
            )}

            {attachedFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', background: 'rgba(14, 165, 233, 0.15)', padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid var(--primary)', width: 'fit-content' }}>
                    <FileText size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '500' }}>{attachedFile.name}</span>
                    <button onClick={() => setAttachedFile(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
                      <X size={16} />
                    </button>
                </div>
            )}

            <form onSubmit={handleSend} style={{ 
              display: 'flex', 
              gap: '0.8rem', 
              alignItems: 'center', 
              background: 'rgba(0, 0, 0, 0.3)', 
              padding: '0.5rem', 
              borderRadius: '15px', 
              border: isInputFocused ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              boxShadow: isInputFocused ? '0 0 0 2px var(--primary-glow)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
                accept=".pdf,.txt,.png,.jpg,.jpeg" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || (mockState === 'inactive' && mode === 'Mock Interview')} 
                className="icon-btn"
                style={{ background: 'transparent', border: 'none', width: '36px', height: '36px' }}
                title="Upload file for OCR"
              >
                <Paperclip size={18} />
              </button>
              <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                {prediction && (
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, bottom: 0, padding: '0.85rem 1rem', 
                    color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', whiteSpace: 'pre',
                    fontFamily: 'inherit', fontSize: 'inherit', zIndex: 1, display: 'flex', alignItems: 'center'
                  }}>
                    {prediction}
                  </div>
                )}
                <input 
                  type="text" 
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={mockState === 'inactive' && mode === 'Mock Interview' ? "Select a difficulty above..." : "Type your message..."} 
                  className="form-control"
                  style={{ flex: 1, marginBottom: 0, zIndex: 2, background: 'transparent', color: 'var(--text-main)', border: 'none', padding: '0.5rem', boxShadow: 'none' }}
                  disabled={mockState === 'inactive' && mode === 'Mock Interview'}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading || (mockState === 'inactive' && mode === 'Mock Interview')} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px' }}>
                Send <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assistant;
