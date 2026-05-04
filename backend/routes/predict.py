from flask import Blueprint, request, jsonify
import pickle
import numpy as np
import os

from . import predict_bp

# Load models at startup to keep endpoint fast
placement_model = None
package_model = None

def load_models():
    global placement_model, package_model
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        with open(os.path.join(base_dir, 'ml_models', 'placement_model.pkl'), 'rb') as f:
            placement_model = pickle.load(f)
        with open(os.path.join(base_dir, 'ml_models', 'salary_model.pkl'), 'rb') as f:
            package_model = pickle.load(f)
        print("ML Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")

# Call immediately
load_models()

@predict_bp.route('/', methods=['POST'])
def predict():
    if not placement_model or not package_model:
        return jsonify({"error": "ML models not loaded on server."}), 500

    data = request.json
    
    # Required fields
    required_fields = ['cgpa', 'skills_count', 'projects_count', 'internships_count', 'aptitude_score']
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400
            
    try:
        # Extract features in the correct order: cgpa, skills, projects, internships, aptitude
        features = np.array([[
            float(data['cgpa']),
            int(data['skills_count']),
            int(data['projects_count']),
            int(data['internships_count']),
            float(data['aptitude_score'])
        ]])
        
        # 1. Predict placement probability
        # predict_proba returns [[prob_class_0, prob_class_1]]
        prob_array = placement_model.predict_proba(features)
        placement_probability = round(prob_array[0][1] * 100, 2)
        
        # 2. Predict package
        predicted_package_lpa = 0.0
        # If probability is highly unlikely (e.g., < 20%), maybe we cap salary or just always predict it.
        # LinearRegression predicts based on input features regardless of placement status.
        predicted_salary_array = package_model.predict(features)
        predicted_package_lpa = round(float(predicted_salary_array[0]), 2)
        
        # Apply a floor of 3.0 LPA as defined in our logic
        if predicted_package_lpa < 3.0:
            predicted_package_lpa = 3.0
            
        reasons = []
        if float(data['cgpa']) < 7:
            reasons.append("Low CGPA reduces chances")
        if int(data['internships_count']) == 0:
            reasons.append("No internships experience")
        if int(data['skills_count']) < 3:
            reasons.append("Insufficient technical skills")
            
        return jsonify({
            "placement_probability": placement_probability,
            "predicted_package": predicted_package_lpa,
            "reasons": reasons
        })
        
    except ValueError as e:
        return jsonify({"error": f"Invalid data format. Must be numeric. {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
