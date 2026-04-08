import os
import json
import requests
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from utils import extract_text

# ==========================================
# 1. SECURE INITIALIZATION 
# ==========================================
# Load variables from the .env file
load_dotenv()

# Securely grab the API key (NEVER hardcode this again!)
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("❌ API Key missing! Make sure your .env file exists and contains GEMINI_API_KEY.")

# Initialize FastAPI App
app = FastAPI(title="SyntaxCV API")

# Enable CORS so your React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. THE AI ENGINE (Auto-Detect & Caller)
# ==========================================
def get_best_model():
    print("\n" + "="*50)
    print("🔍 AUTO-DETECTING AUTHORIZED GOOGLE MODELS...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"❌ KEY REJECTED: {response.text}")
        print("="*50 + "\n")
        return "gemini-1.5-flash" # fallback
        
    models = response.json().get('models', [])
    valid_models = [m['name'].replace('models/', '') for m in models if 'generateContent' in m.get('supportedGenerationMethods', [])]
    
    if not valid_models:
        print("❌ ZERO MODELS FOUND! Your key has no permissions for text generation.")
        print("="*50 + "\n")
        return "gemini-1.5-flash"
        
    print(f"✅ Your key is allowed to use: {', '.join(valid_models[:3])}...")
    
    # Prioritize the fastest models
    for pref in ['gemini-1.5-flash', 'gemini-1.0-pro']:
        if pref in valid_models:
            print(f"🚀 LOCKING IN MODEL: {pref}")
            print("="*50 + "\n")
            return pref
            
    print(f"🚀 LOCKING IN MODEL: {valid_models[0]}")
    print("="*50 + "\n")
    return valid_models[0]

# Run detection once when server boots
ACTIVE_MODEL = get_best_model()

# Custom REST API Caller
def call_gemini(prompt: str, model_name: str):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"API Error {response.status_code}: {response.text}")

# ==========================================
# ROUTE 1: THE ATS ANALYZER (Original Feature)
# ==========================================
@app.post("/analyze")
async def analyze_resume(
    role: str = Form(...),
    description: str = Form(""),  
    file: UploadFile = File(...)
):
    try:
        content = await file.read()
        resume_text = extract_text(content, file.filename)
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from resume.")

        prompt = f"""
        You are a professional HR Recruiter and ATS Optimization Expert. 
        Analyze the following resume based on the Target Job Role.
        TARGET ROLE: {role}
        RESUME CONTENT:
        {resume_text}

        Strictly return ONLY a valid JSON object with the following keys:
        {{
            "score": 85,
            "ats_friendly": true,
            "advantages": ["Point 1", "Point 2"],
            "disadvantages": ["Point 1", "Point 2"],
            "suggestions": ["Point 1", "Point 2"]
        }}
        """

        data = call_gemini(prompt, ACTIVE_MODEL)
        
        raw_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
        
        return json.loads(raw_text)

    except Exception as e:
        print(f"\n--- CRITICAL BACKEND ERROR ---\n{str(e)}\n------------------------------")
        raise HTTPException(status_code=500, detail="Internal Server Error. Check terminal.")

# ==========================================
# ROUTE 2: THE ROLE SUGGESTER (New Upgrade)
# ==========================================
@app.post("/suggest-roles")
async def suggest_roles(file: UploadFile = File(...)):
    try:
        content = await file.read()
        resume_text = extract_text(content, file.filename)
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from resume.")

        prompt = f"""
        You are an expert IT Career Counselor. Analyze this resume text:
        {resume_text}

        Based on the skills, projects, and experience, suggest the top 3 IT job roles this candidate is best suited for.
        
        Strictly return ONLY a valid JSON object with this exact structure:
        {{
            "suggestions": [
                {{
                    "role_title": "Full Stack Developer",
                    "match_confidence": 95,
                    "reason": "Strong experience with React and FastAPI."
                }},
                {{
                    "role_title": "Role 2",
                    "match_confidence": 80,
                    "reason": "Reasoning here."
                }},
                {{
                    "role_title": "Role 3",
                    "match_confidence": 75,
                    "reason": "Reasoning here."
                }}
            ]
        }}
        """

        data = call_gemini(prompt, ACTIVE_MODEL)
        
        raw_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
        
        return json.loads(raw_text)

    except Exception as e:
        print(f"\n--- CRITICAL ERROR IN SUGGEST ROLES ---\n{str(e)}\n------------------------------")
        raise HTTPException(status_code=500, detail="Internal Server Error.")

# ==========================================
# SERVER RUNNER
# ==========================================
if __name__ == "__main__":
    import uvicorn
    # This dynamic port setup is required for hosting on Render!
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
