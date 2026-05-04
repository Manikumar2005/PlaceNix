from flask import request, jsonify
from services.chatbot import process_chat_message
from models import ChatSession, ChatMessage
from database import db
from datetime import datetime

from . import chat_bp

@chat_bp.route('/sessions/<int:user_id>', methods=['GET', 'OPTIONS'])
def get_sessions(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    sessions = ChatSession.query.filter_by(user_id=user_id).order_by(ChatSession.updated_at.desc()).all()
    return jsonify([s.to_dict() for s in sessions]), 200

@chat_bp.route('/sessions', methods=['POST', 'OPTIONS'])
def create_session():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    data = request.json
    if not data or 'user_id' not in data:
        return jsonify({"error": "user_id is required"}), 400
        
    session = ChatSession(user_id=data['user_id'], title=data.get('title', 'New Chat'))
    db.session.add(session)
    db.session.commit()
    return jsonify(session.to_dict()), 201

@chat_bp.route('/sessions/<int:session_id>/messages', methods=['GET', 'OPTIONS'])
def get_messages(session_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.created_at.asc()).all()
    return jsonify([m.to_dict() for m in messages]), 200

@chat_bp.route('/sessions/<int:session_id>/message', methods=['POST', 'OPTIONS'])
def add_message(session_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    data = request.json
    if not data or 'message' not in data:
        return jsonify({"error": "Message is required"}), 400
        
    session = ChatSession.query.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404

    message_text = data['message']
    student_data = data.get('student_data')
    
    # Save user message
    user_msg = ChatMessage(session_id=session_id, sender='user', text=message_text)
    db.session.add(user_msg)
    
    # Get all previous messages for context
    past_messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.created_at.asc()).all()
    
    # Call Groq
    response_text = process_chat_message(message_text, past_messages, student_data)
    
    # Save bot message
    bot_msg = ChatMessage(session_id=session_id, sender='bot', text=response_text)
    db.session.add(bot_msg)
    
    # Update session
    session.updated_at = datetime.utcnow()
    # Update title if it's the first message
    if session.title == "New Chat":
        session.title = message_text[:30] + "..." if len(message_text) > 30 else message_text
        
    db.session.commit()
    
    return jsonify({"reply": response_text, "session": session.to_dict()})

# Keep the legacy route for unauthenticated users if needed
@chat_bp.route('', methods=['POST', 'OPTIONS'], strict_slashes=False)
@chat_bp.route('/', methods=['POST', 'OPTIONS'], strict_slashes=False)
def chat():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    data = request.json
    if not data or 'message' not in data:
        return jsonify({"error": "Message is required"}), 400
        
    message = data['message']
    student_data = data.get('student_data')
    
    response = process_chat_message(message, [], student_data)
    
    return jsonify({"reply": response})

import fitz # PyMuPDF
import pytesseract
from PIL import Image

@chat_bp.route('/upload-file', methods=['POST', 'OPTIONS'])
def upload_file():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    text = ""
    filename = file.filename.lower()
    
    try:
        if filename.endswith('.pdf'):
            # Extract using PyMuPDF
            pdf_bytes = file.read()
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            for page in doc:
                text += page.get_text() + "\n"
        elif filename.endswith(('.png', '.jpg', '.jpeg')):
            # OCR using pytesseract
            img = Image.open(file.stream)
            try:
                text = pytesseract.image_to_string(img)
            except Exception as ocr_e:
                print(f"OCR Error: {ocr_e}")
                return jsonify({"error": "OCR is not fully configured on the server (Tesseract missing). Please upload a PDF or TXT instead."}), 500
        elif filename.endswith('.txt'):
            text = file.read().decode('utf-8', errors='ignore')
        else:
            return jsonify({"error": "Unsupported file format. Please upload PDF, TXT, or Image."}), 400
            
        if not text.strip():
            return jsonify({"error": "No text could be extracted from the file."}), 400
            
        return jsonify({"text": text.strip()}), 200
    except Exception as e:
        print(f"File extraction error: {e}")
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500
