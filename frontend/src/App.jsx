import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PredictionProvider } from './context/PredictionContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Interviews from './pages/Interviews';
import Predictor from './pages/Predictor';
import SkillGap from './pages/SkillGap';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import Resources from './pages/Resources';
import OngoingDrives from './pages/OngoingDrives.jsx';
import Assistant from './pages/Assistant';
import Login from './pages/Login';
import Signup from './pages/Signup';

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname.replace(/\/$/, '');
  const isAuthPage = path === '/login' || path === '/signup';
  
  return (
    <div className={`app-layout ${user && !isAuthPage ? 'authenticated' : 'public'}`}>
      {!isAuthPage && (user ? <Sidebar /> : <Navbar />)}
      
      <div className="main-content" style={isAuthPage ? { marginLeft: 0, width: '100%' } : {}}>
        {user && !isAuthPage && <TopBar />}
        <main className="container-fluid">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/interviews/:companyId" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute><Predictor /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
            <Route path="/companies" element={<ProtectedRoute><OngoingDrives /></ProtectedRoute>} />
            <Route path="/ongoing-drives" element={<ProtectedRoute><OngoingDrives /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PredictionProvider>
        <Router>
          <AppLayout />
        </Router>
      </PredictionProvider>
    </AuthProvider>
  );
}

export default App;
