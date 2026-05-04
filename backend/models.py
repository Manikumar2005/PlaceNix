from database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # A user can have one student profile
    student_profile = db.relationship('Student', backref='user', uselist=False, lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role
        }


class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    cgpa = db.Column(db.Float, nullable=False)
    skills = db.Column(db.Text, nullable=False)  # Comma-separated or JSON
    projects = db.Column(db.Text, nullable=True)
    internships = db.Column(db.Text, nullable=True)
    
    predictions = db.relationship('Prediction', backref='student', lazy=True)
    resumes = db.relationship('Resume', backref='student', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'cgpa': self.cgpa,
            'skills': self.skills,
            'projects': self.projects,
            'internships': self.internships
        }

class Company(db.Model):
    __tablename__ = 'companies'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    package = db.Column(db.String(50), nullable=False)
    eligibility_cgpa = db.Column(db.Float, nullable=False)
    required_skills = db.Column(db.Text, nullable=False)
    drive_date = db.Column(db.String(50), nullable=False) # e.g., '2023-11-20'
    status = db.Column(db.String(20), nullable=False, default='upcoming') # 'upcoming' or 'ongoing'
    
    questions = db.relationship('InterviewQuestion', backref='company', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'package': self.package,
            'eligibility_cgpa': self.eligibility_cgpa,
            'required_skills': self.required_skills,
            'drive_date': self.drive_date,
            'status': self.status
        }

class InterviewQuestion(db.Model):
    __tablename__ = 'interview_questions'
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False) # technical, hr, coding
    question = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'type': self.type,
            'question': self.question
        }

class Prediction(db.Model):
    __tablename__ = 'predictions'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    probability = db.Column(db.Float, nullable=False)
    predicted_package = db.Column(db.String(50), nullable=False)
    reasoning = db.Column(db.Text, nullable=True) # JSON or text string explaining prediction

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'probability': self.probability,
            'predicted_package': self.predicted_package,
            'reasoning': self.reasoning
        }

class Resume(db.Model):
    __tablename__ = 'resumes'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    resume_text = db.Column(db.Text, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    strengths = db.Column(db.Text, nullable=True)
    weaknesses = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'score': self.score,
            'strengths': self.strengths,
            'weaknesses': self.weaknesses
        }

class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False, default="New Chat")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    messages = db.relationship('ChatMessage', backref='session', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=False)
    sender = db.Column(db.String(20), nullable=False) # 'user' or 'bot'
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sender': self.sender,
            'text': self.text,
            'created_at': self.created_at.isoformat()
        }
