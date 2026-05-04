from flask import Blueprint

companies_bp = Blueprint('companies', __name__)
students_bp = Blueprint('students', __name__)
interviews_bp = Blueprint('interviews', __name__)
resume_bp = Blueprint('resume', __name__)
predict_bp = Blueprint('predict', __name__)
chat_bp = Blueprint('chat', __name__)
mock_bp = Blueprint('mock', __name__)

from . import companies, students, interviews, resume, predict, chat, mock
