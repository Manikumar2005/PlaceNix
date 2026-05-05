import axios from 'axios';

// Use environment variable for API URL if available, otherwise default to local development URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getCompanies = async () => {
    const response = await axios.get(`${API_URL}/companies`);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};

export const googleLoginAuth = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/google`, userData);
    return response.data;
};

export const signupUser = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/signup`, credentials);
    return response.data;
};

export const filterCompanies = async (cgpa, skills) => {
    const params = new URLSearchParams();
    if (cgpa) params.append('cgpa', cgpa);
    if (skills) params.append('skills', skills);
    
    console.log("API calling filter with params:", params.toString());
    const response = await axios.get(`${API_URL}/companies/filter?${params.toString()}`);
    return response.data;
};

export const submitProfile = async (profileData) => {
    const response = await axios.post(`${API_URL}/students/`, profileData);
    return response.data;
};

export const getInterviewQuestions = async (companyId) => {
    const response = await axios.get(`${API_URL}/interviews/${companyId}`);
    return response.data;
};

export const analyzeResume = async (formData) => {
    const response = await axios.post(`${API_URL}/resume/analyze`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const predictPlacement = async (profileData) => {
    const response = await axios.post(`${API_URL}/predict/`, profileData);
    return response.data;
};

export const checkSkillGap = async (companyId, skills) => {
    const response = await axios.post(`${API_URL}/companies/skill-gap/${companyId}`, { skills });
    return response.data;
};

export const sendChatMessage = async (messageData) => {
    const response = await axios.post(`${API_URL}/chat`, messageData);
    return response.data;
};

export const chatWithBot = async (message, studentData = null) => {
    const response = await axios.post(`${API_URL}/chat`, { 
        message, 
        student_data: studentData 
    });
    return response.data;
};

// Chat Session APIs
export const fetchChatSessions = async (userId) => {
    const response = await axios.get(`${API_URL}/chat/sessions/${userId}`);
    return response.data;
};

export const createChatSession = async (userId, title = 'New Chat') => {
    const response = await axios.post(`${API_URL}/chat/sessions`, { user_id: userId, title });
    return response.data;
};

export const fetchChatMessages = async (sessionId) => {
    const response = await axios.get(`${API_URL}/chat/sessions/${sessionId}/messages`);
    return response.data;
};

export const sendSessionMessage = async (sessionId, message, studentData = null) => {
    const response = await axios.post(`${API_URL}/chat/sessions/${sessionId}/message`, {
        message,
        student_data: studentData
    });
    return response.data;
};

// Mock Interview APIs
export const startMockInterview = async (userId, difficulty) => {
    const response = await axios.post(`${API_URL}/mock/start`, { user_id: userId, difficulty });
    return response.data;
};

export const answerMockQuestion = async (userId, answer) => {
    const response = await axios.post(`${API_URL}/mock/answer`, { user_id: userId, answer });
    return response.data;
};

export const getMockResults = async (userId) => {
    const response = await axios.get(`${API_URL}/mock/result/${userId}`);
    return response.data;
};

export const uploadChatFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/chat/upload-file`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
