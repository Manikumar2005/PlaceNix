from flask import jsonify, request
from . import companies_bp
from models import Company

@companies_bp.route('/', methods=['GET'], strict_slashes=False)
def get_companies():
    companies = Company.query.all()
    return jsonify([company.to_dict() for company in companies])

@companies_bp.route('/filter', methods=['GET'])
def filter_companies():
    cgpa_str = request.args.get('cgpa')
    skills_query = request.args.get('skills', '').lower()
    
    query = Company.query
    
    if cgpa_str:
        try:
            cgpa = float(cgpa_str)
            query = query.filter(Company.eligibility_cgpa <= cgpa)
        except ValueError:
            return jsonify({'error': 'Invalid CGPA'}), 400
            
    companies = query.all()
    
    # Filter by skills if provided
    result = []
    if skills_query:
        user_skills = [s.strip() for s in skills_query.split(',')]
        for comp in companies:
            comp_skills = [s.strip().lower() for s in comp.required_skills.split(',')]
            if any(skill in comp_skills for skill in user_skills):
                result.append(comp)
    else:
        result = companies

    return jsonify([company.to_dict() for company in result])

@companies_bp.route('/skill-gap/<int:company_id>', methods=['POST'])
def skill_gap(company_id):
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"error": "Company not found"}), 404
        
    data = request.json
    user_skills = data.get('skills', [])
    if not isinstance(user_skills, list):
        return jsonify({"error": "skills must be an array of strings"}), 400
        
    user_skills_lower = [s.lower().strip() for s in user_skills]
    company_skills = [s.lower().strip() for s in company.required_skills.split(',')]
    
    matched = list(set(company_skills) & set(user_skills_lower))
    missing = list(set(company_skills) - set(user_skills_lower))
    
    fit_score = (len(matched) / len(company_skills)) * 100 if company_skills else 0
    
    return jsonify({
        "matched": matched,
        "missing": missing,
        "fit_score": round(fit_score, 2)
    })
