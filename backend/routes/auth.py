from flask import Blueprint, request, jsonify
from models import User
from database import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400
        
    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully", "user": user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        return jsonify({
            "message": "Login successful",
            "user": user.to_dict()
        }), 200
        
    return jsonify({"error": "Invalid email or password"}), 401

import uuid

@auth_bp.route('/google', methods=['POST'])
def google_login():
    data = request.json
    email = data.get('email')
    name = data.get('name', 'Google User')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
        
    user = User.query.filter_by(email=email).first()
    
    # If user doesn't exist, create an account for them automatically
    if not user:
        user = User(email=email)
        # Generate a random strong password since they are logging in via Google
        random_password = str(uuid.uuid4())
        user.set_password(random_password)
        db.session.add(user)
        db.session.commit()
        
    return jsonify({
        "message": "Google Login successful",
        "user": user.to_dict()
    }), 200
