from flask import jsonify, request
from . import students_bp
from database import db
from models import Student

@students_bp.route('/', methods=['POST'], strict_slashes=False)
def add_student():
    data = request.json
    if not data or not data.get('name') or not data.get('cgpa') or not data.get('skills'):
        return jsonify({'error': 'Name, CGPA, and Skills are required'}), 400
        
    try:
        new_student = Student(
            name=data['name'],
            cgpa=float(data['cgpa']),
            skills=data['skills'],
            projects=data.get('projects', ''),
            internships=data.get('internships', '')
        )
        db.session.add(new_student)
        db.session.commit()
        return jsonify(new_student.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
