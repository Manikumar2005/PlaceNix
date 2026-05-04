from flask import request, jsonify
from services.mock_interview import start_mock_interview, process_answer, get_interview_results

from . import mock_bp

@mock_bp.route('/start', methods=['POST', 'OPTIONS'])
def start():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    data = request.json
    if not data or 'user_id' not in data:
        return jsonify({"error": "user_id is required"}), 400
        
    user_id = data['user_id']
    difficulty = data.get('difficulty', 'easy')
    
    result = start_mock_interview(user_id, difficulty)
    return jsonify(result), 200

@mock_bp.route('/answer', methods=['POST', 'OPTIONS'])
def answer():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    data = request.json
    if not data or 'user_id' not in data or 'answer' not in data:
        return jsonify({"error": "user_id and answer are required"}), 400
        
    user_id = data['user_id']
    answer_text = data['answer']
    
    if not answer_text.strip():
        return jsonify({"error": "Answer cannot be empty."}), 400
        
    result = process_answer(user_id, answer_text)
    return jsonify(result), 200

@mock_bp.route('/result/<user_id>', methods=['GET', 'OPTIONS'])
def result(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    result_data = get_interview_results(user_id)
    return jsonify(result_data), 200
