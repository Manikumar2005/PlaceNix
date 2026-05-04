import os
from groq import Groq

# Load Groq API Key
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

try:
    client = Groq(api_key=GROQ_API_KEY)
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a test."},
            {"role": "user", "content": "Hello"}
        ],
        temperature=0.7,
        max_tokens=10,
    )
    print("Success:", completion.choices[0].message.content)
except Exception as e:
    import traceback
    traceback.print_exc()
    print("Error:", e)
