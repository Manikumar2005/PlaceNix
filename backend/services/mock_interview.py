import os
import json
import random

# Load dataset
DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'interview_questions.json')

def load_questions():
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading questions: {e}")
        return {"easy": [], "medium": [], "hard": []}

questions_db = load_questions()

# In-memory session store
# Structure: { user_id: { "difficulty": "easy", "questions": [...], "current_index": 0, "answers": [...] } }
active_sessions = {}

def start_mock_interview(user_id, difficulty):
    """Initializes a new mock interview session."""
    if difficulty not in questions_db:
        difficulty = "easy"
        
    # Get 3 questions (1 hr, 1 technical, 1 coding) if available, otherwise random
    pool = questions_db[difficulty]
    
    # Try to pick one of each type
    selected = []
    for q_type in ['hr', 'technical', 'coding']:
        type_questions = [q for q in pool if q['type'] == q_type]
        if type_questions:
            selected.append(random.choice(type_questions))
            
    # Fallback to random if structured picking failed
    if len(selected) < 3 and len(pool) >= 3:
        selected = random.sample(pool, 3)
        
    active_sessions[user_id] = {
        "difficulty": difficulty,
        "questions": selected,
        "current_index": 0,
        "answers": []
    }
    
    return {
        "status": "started",
        "total_questions": len(selected),
        "question": selected[0]['question'] if selected else "No questions available."
    }

def evaluate_answer(answer_text, expected_keywords):
    """Rule-based evaluation of an answer."""
    score = 0
    feedback = []
    
    words = answer_text.split()
    word_count = len(words)
    
    # 1. Length Evaluation
    if word_count < 5:
        score += 2
        feedback.append("Your answer is too short. Try to elaborate more.")
    elif 5 <= word_count <= 15:
        score += 5
        feedback.append("Good start, but you could add more detail or examples.")
    else:
        score += 8
        feedback.append("Good length and detail.")
        
    # 2. Keyword Evaluation
    answer_lower = answer_text.lower()
    matched_keywords = [kw for kw in expected_keywords if kw.lower() in answer_lower]
    
    if len(matched_keywords) == 0:
        feedback.append("You missed some key concepts. Try to include industry terminology.")
    elif len(matched_keywords) <= 2:
        score += 1
        feedback.append(f"Good, you mentioned concepts like: {', '.join(matched_keywords)}.")
    else:
        score += 2
        feedback.append(f"Excellent use of keywords ({', '.join(matched_keywords)}).")
        
    # Cap score at 10
    final_score = min(score, 10)
    
    return {
        "score": final_score,
        "feedback": feedback
    }

def process_answer(user_id, answer_text):
    """Processes a user's answer and returns the evaluation and next question."""
    if user_id not in active_sessions:
        return {"error": "No active interview session found. Please start one."}
        
    session = active_sessions[user_id]
    current_index = session['current_index']
    questions = session['questions']
    
    if current_index >= len(questions):
        return {"status": "completed", "message": "Interview already completed."}
        
    current_q = questions[current_index]
    
    # Evaluate
    evaluation = evaluate_answer(answer_text, current_q.get('keywords', []))
    
    # Save answer
    session['answers'].append({
        "question": current_q['question'],
        "answer": answer_text,
        "score": evaluation['score'],
        "feedback": evaluation['feedback']
    })
    
    # Move to next question
    session['current_index'] += 1
    next_index = session['current_index']
    
    if next_index < len(questions):
        return {
            "status": "ongoing",
            "evaluation": evaluation,
            "next_question": questions[next_index]['question'],
            "progress": f"{next_index + 1}/{len(questions)}"
        }
    else:
        return {
            "status": "completed",
            "evaluation": evaluation,
            "message": "Interview completed! View your final results."
        }

def get_interview_results(user_id):
    """Calculates final scores and generates a summary."""
    if user_id not in active_sessions:
        return {"error": "No active interview session found."}
        
    session = active_sessions[user_id]
    answers = session['answers']
    
    if not answers:
        return {"error": "No answers submitted yet."}
        
    total_score = sum(ans['score'] for ans in answers)
    max_possible = len(answers) * 10
    average_score = round(total_score / len(answers), 2) if len(answers) > 0 else 0
    
    suggestions = []
    if average_score < 5:
        suggestions.append("Focus on expanding your answers. Use the STAR method (Situation, Task, Action, Result).")
        suggestions.append("Review basic technical concepts for your domain.")
    elif average_score < 8:
        suggestions.append("You have a good foundation. Try to include more specific technical keywords in your responses.")
        suggestions.append("Practice speaking confidently and structuring your thoughts.")
    else:
        suggestions.append("Excellent performance! Your answers are detailed and hit the key points.")
        suggestions.append("You are well-prepared for real interviews.")
        
    result = {
        "difficulty": session['difficulty'],
        "average_score": average_score,
        "total_score": f"{total_score}/{max_possible}",
        "detailed_results": answers,
        "overall_suggestions": suggestions
    }
    
    # Clean up session
    del active_sessions[user_id]
    
    return result
