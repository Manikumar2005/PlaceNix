from flask import Flask
from flask_cors import CORS
from config import Config
from database import db
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    db.init_app(app)
    
    from routes import companies_bp, students_bp, interviews_bp, resume_bp, predict_bp, chat_bp, mock_bp
    from routes.auth import auth_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(companies_bp, url_prefix='/api/companies')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(interviews_bp, url_prefix='/api/interviews')
    app.register_blueprint(resume_bp, url_prefix='/api/resume')
    app.register_blueprint(predict_bp, url_prefix='/api/predict')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(mock_bp, url_prefix='/api/mock')
    
    @app.route('/api/health')
    def health_check():
        return {"status": "healthy"}
        
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # Make sure models are loaded and tables exist
        from models import User, Student, Company, InterviewQuestion, Prediction, Resume, ChatSession, ChatMessage
        db.create_all()
        
        # Create default admin user if it doesn't exist
        admin = User.query.filter_by(email='admin@placenix.com').first()
        if not admin:
            admin = User(email='admin@placenix.com', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Default admin user created: admin@placenix.com / admin123")
        
    app.run(debug=True, port=5000)
# Triggering reload
