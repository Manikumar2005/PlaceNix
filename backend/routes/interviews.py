from flask import jsonify
from . import interviews_bp
from models import InterviewQuestion

@interviews_bp.route('/<int:company_id>', methods=['GET'])
def get_interviews(company_id):
    questions = InterviewQuestion.query.filter_by(company_id=company_id).all()
    if not questions:
        return jsonify({'message': 'No questions found for this company'}), 404
        
    return jsonify([q.to_dict() for q in questions])
