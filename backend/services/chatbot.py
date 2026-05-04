import os
import json
import traceback
import requests
from groq import Groq

# Groq API Key
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

def process_chat_message(message, past_messages=None, student_data=None):
    if not GROQ_API_KEY:
        return "⚠️ **Configuration Error**: The `GROQ_API_KEY` is not set in the backend environment. Please set this variable to use the AI Interview Prep Bot."

    try:
        client = Groq(api_key=GROQ_API_KEY)
        
        # Construct context
        context = (
            "You are PlaceNix AI, an expert Interview Preparation Assistant for campus placements. "
            "Your goal is to help students prepare for technical and HR interviews, improve their resumes, and provide actionable career advice. "
            "Be encouraging, concise, and format your responses using Markdown for readability."
        )
        
        if student_data:
            context += f"\nHere is the student's current profile context: {json.dumps(student_data)}. Tailor your advice specifically to their skills, CGPA, and experience."
            
            # Fetch ML Prediction
            try:
                # Prepare payload for /predict
                skills_list = student_data.get('skills', '').split(',')
                projects_list = student_data.get('projects', '').split(',')
                internships_list = student_data.get('internships', '').split(',')
                
                predict_payload = {
                    'cgpa': float(student_data.get('cgpa', 0)),
                    'skills_count': len([s for s in skills_list if s.strip()]),
                    'projects_count': len([p for p in projects_list if p.strip()]),
                    'internships_count': len([i for i in internships_list if i.strip()]),
                    'aptitude_score': float(student_data.get('aptitude_score', 75.0)) # Default if missing
                }
                
                res = requests.post('http://127.0.0.1:5000/api/predict/', json=predict_payload, timeout=2)
                if res.status_code == 200:
                    pred_data = res.json()
                    prob = pred_data.get('placement_probability', 0)
                    
                    if prob < 40:
                        ml_suggestion = "Low placement probability. Suggest improving core skills and securing internships."
                    elif prob < 75:
                        ml_suggestion = "Medium placement probability. Suggest adding more complex projects to their portfolio."
                    else:
                        ml_suggestion = "High placement probability. Suggest focusing heavily on mock interviews and advanced problem solving."
                        
                    context += f"\n\nML Prediction System Context: Placement Probability is {prob}%. Recommended Strategy: {ml_suggestion}. Please incorporate this strategy into your response using a structured format with Title, Bullet points, and Suggestions."
            except Exception as e:
                print(f"Failed to fetch ML prediction: {e}")
                pass
        # Build message history
        messages_payload = [{"role": "system", "content": context}]
        
        if past_messages:
            for msg in past_messages:
                role = "assistant" if msg.sender == "bot" else "user"
                # Exclude the current message if it's already in the database (since we saved it before calling)
                if msg.text != message or role != "user":
                    messages_payload.append({"role": role, "content": msg.text})
                    
        # Append current message
        messages_payload.append({"role": "user", "content": message})

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages_payload,
            temperature=0.7,
            max_tokens=1024,
        )
        
        reply = completion.choices[0].message.content
        return reply
        
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        traceback.print_exc()
        return "I'm having trouble connecting to my AI brain right now. Please try again later."
