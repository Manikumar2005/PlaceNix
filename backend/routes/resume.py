from flask import Blueprint, request, jsonify
import PyPDF2
import io
import re

from . import resume_bp

# A broad list of common tech keywords
TECH_KEYWORDS = [
    "python", "java", "c++", "sql", "dsa", "machine learning", "react"
]

def analyze_text(text):
    text_lower = text.lower()
    
    found_skills = []
    missing_skills = []
    skill_frequencies = {}
    
    for kw in TECH_KEYWORDS:
        pattern = r'\b' + re.escape(kw) + r'\b'
        matches = len(re.findall(pattern, text_lower))
        if matches > 0:
            found_skills.append(kw)
            skill_frequencies[kw] = matches
        else:
            missing_skills.append(kw)
            
    # Calculate score 0-100
    score = int((len(found_skills) / len(TECH_KEYWORDS)) * 100)
    
    suggestions = []
    
    # Detect projects section
    if not re.search(r'\b(projects|project|portfolio)\b', text_lower):
        suggestions.append("We couldn't detect a Projects section. Add more technical projects to showcase your practical skills.")
        # Deduct some score if no projects
        score = max(0, score - 10)
    
    if "internships" not in text_lower and "experience" not in text_lower:
        suggestions.append("Highlight internships or relevant experience if you have any. It significantly boosts your profile.")
        
    if "python" in missing_skills and "sql" in missing_skills:
        suggestions.append("Consider including Python or SQL, as they are highly requested by most top companies.")
        
    if len(missing_skills) > 0:
        suggestions.append(f"Consider learning or adding these skills to your resume: {', '.join(missing_skills)}")
        
    if score < 50:
        suggestions.append("Your resume lacks essential core skills. Focus on fundamentals like DSA and a primary programming language.")

    return {
        "score": score,
        "found_skills": found_skills,
        "missing_skills": missing_skills,
        "skill_frequencies": skill_frequencies,
        "suggestions": suggestions
    }

@resume_bp.route('/analyze', methods=['POST'])
def analyze_resume():
    text = ""
    
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file.filename.lower().endswith('.pdf'):
            try:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
                for page in pdf_reader.pages:
                    text += page.extract_text() + " "
            except Exception as e:
                return jsonify({'error': f'Failed to parse PDF: {str(e)}'}), 400
        elif file.filename.lower().endswith('.txt'):
            text = file.read().decode('utf-8')
        else:
            return jsonify({'error': 'Unsupported file type. Please upload a PDF or TXT file.'}), 400
            
    elif request.is_json:
        data = request.json
        text = data.get('text', '')
        if not text:
            return jsonify({'error': 'No text provided'}), 400
    else:
        return jsonify({'error': 'Invalid request format. Send multipart/form-data or application/json'}), 400
        
    if not text.strip():
        return jsonify({'error': 'No content could be extracted from the file'}), 400
        
    result = analyze_text(text)
    return jsonify(result)
