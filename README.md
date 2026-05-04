# PlaceNix - Campus Placement Prediction System

PlaceNix is a full-stack, AI-powered web application designed to help university students prepare for and track their campus placement drives. By unifying placement drive tracking, resume analysis, interview preparation, and placement probability predictions, PlaceNix acts as the ultimate command center for students embarking on their professional journey.

## 🚀 Features

- **Dynamic Placement Dashboard**: View and filter ongoing and upcoming placement drives from top companies like Google, Microsoft, Amazon, and more.
- **Smart Filtering**: Filter available job opportunities by minimum CGPA eligibility and required skills.
- **Interview Question Repository**: Access a curated collection of company-specific technical, coding, and HR interview questions.
- **AI Resume Analyzer** (WIP): Upload and analyze resumes to get a score, identified strengths, and potential weaknesses.
- **Placement Predictor** (WIP): Machine learning-based prediction tool assessing the probability of placement and predicted salary packages.
- **Premium Glassmorphism Design**: A sleek, dark-themed UI featuring custom typography and dynamic layout styling using React.

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)**: Fast frontend framework and build tool.
- **React Router**: For seamless single-page application navigation.
- **Lucide-React**: Clean, modern SVGs and icons.
- **Vanilla CSS**: Custom styling utilizing modern variables and glassmorphism techniques.

### Backend & Database
- **Python (Flask)**: Lightweight backend API framework.
- **Flask-SQLAlchemy & SQLite**: ORM for managing the student, company, and placement database.
- **Flask-CORS**: Cross-Origin Resource Sharing handling for API requests.

### AI & Machine Learning
- **Groq API (Llama 3)**: High-speed LLM inference for the intelligent Interview Prep Chatbot.
- **Scikit-learn / Pandas / NumPy**: Machine learning tools for training placement probability and salary prediction models.
- **PyPDF2**: For parsing and analyzing uploaded student resumes.

---

## 📂 Project Structure

```
Campus Placement prediction/
│
├── backend/                  # Python Flask Server
│   ├── app.py                # Main Flask application and API routes
│   ├── config.py             # Configuration and database settings
│   ├── database.py           # SQLAlchemy instance
│   ├── models.py             # Database schemas (Student, Company, Predictions, etc.)
│   ├── seed.py               # Script to seed the database with mock companies and questions
│   ├── generate_data.py      # ML data generation scripts
│   ├── train_models.py       # ML Model training scripts
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React UI Client
│   ├── index.html            # Vite entry point
│   ├── package.json          # Node.js dependencies
│   ├── src/
│   │   ├── components/       # Reusable React components (Navbar, ResumeAnalyzer)
│   │   ├── pages/            # Page-level components (Dashboard, Interviews, Profile)
│   │   ├── services/         # API integration (api.js)
│   │   ├── App.jsx           # React app router setup
│   │   ├── main.jsx          # React app mounting point
│   │   └── index.css         # Global styles and theme tokens
│
└── venv/                     # Python Virtual Environment
```

---

## 💻 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Python 3.10+](https://www.python.org/)

### 1. Clone the repository
Navigate to your desired directory and clone/open the project.

### 2. Backend Setup
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
```

Create and activate a virtual environment (if not already done):
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install the required Python dependencies:
```bash
pip install -r requirements.txt
```

Seed the database with sample placement data (Companies and Interview Questions):
```bash
python seed.py
```

Start the Flask server:
```bash
python app.py
```
> The backend server will start on `http://127.0.0.1:5000`

### 3. Frontend Setup
Open a **new** terminal window and navigate to the `frontend` folder:
```bash
cd frontend
```

Install the Node dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
> The frontend application will start on `http://localhost:5173`

---

## 🎨 Theme & UI Highlights
The frontend is custom-styled from scratch using `index.css`. It features a deeply integrated dark mode with:
- **Translucent Glassmorphism**: Cards and navigation bars feature a backdrop-blur effect.
- **Color Variables**: Uses `#09090b` (zinc) for the background with neon blue and purple accents.
- **Dynamic Flexbox Grids**: Smoothly collapsing layouts for displaying opportunities and company details.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.
