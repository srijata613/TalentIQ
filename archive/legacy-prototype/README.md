# AI Talent Intelligence Engine

Semantic, priority-aware resume ranking system built for modern hiring workflows.

This project is a full-stack AI-powered candidate screening engine that performs structured job description parsing, weighted skill alignment, semantic experience matching, and explainable ranking — exposed through a production-ready FastAPI backend and a modern Next.js SaaS-style frontend.

---

## 🚀 Overview

AI Talent Intelligence Engine helps recruiters and hiring teams:

- Rank multiple candidates against a job description
- Detect matched and missing skills
- Evaluate semantic experience alignment
- Generate weighted, explainable scoring
- Analyze candidates in real time via web interface

The system moves beyond keyword matching by combining embedding-based semantic intelligence with structured weighting logic.

---

## 🧠 Core Intelligence Architecture

The ranking engine combines multiple scoring components:

### 1. Priority-Aware Skill Matching
- Dictionary-based skill extraction
- Embedding-based semantic similarity
- Dynamic similarity thresholds
- Importance weighting based on JD context

### 2. Experience Alignment
- Sentence-level embedding similarity
- Best-match responsibility scoring
- Normalized experience confidence score

### 3. Education Scoring
- Education signal detection
- Optional degree alignment scoring

### 4. Bonus Logic
- Strategic reward for strong core skill overlap

### Final Score Formula

Final Score =
0.5 × Skill Score  
+ 0.3 × Experience Score  
+ 0.1 × Education Score  
+ 0.1 × Bonus Score  

All scoring components are explainable and returned via structured JSON.

---

## 🏗 System Architecture

Frontend (Next.js + Tailwind)  
↓  
FastAPI Backend (REST API)  
↓  
ML Core (Modular Scoring Engine)  
↓  
BGE Large Embedding Model (Semantic Layer)  

The system is modular and designed for scalability and future extension.

---

## 🖥 Tech Stack

### Backend
- Python
- FastAPI
- Sentence Transformers (BGE-large-en-v1.5)
- NLTK
- Modular ML scoring architecture

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

---

## 📦 Project Structure

resume-ranking-engine/  
│  
├── backend/  
│   ├── app/          # FastAPI routes  
│   ├── src/          # ML core modules  
│   └── requirements.txt  
│  
├── frontend/  
│   └── Next.js SaaS interface  
│  
└── README.md  

---

## 🔍 Example API Response

```json
{
  "latency_seconds": 0.42,
  "results": [
    {
      "candidate_id": "candidate_1",
      "final_score": 0.68,
      "skill_score": 0.80,
      "experience_score": 0.66,
      "matched_skills": ["python", "docker", "fastapi"],
      "missing_skills": ["aws"]
    }
  ]
}
```

---

## 🎯 Key Features

- Multi-candidate ranking from a single job description
- Explainable scoring logic
- Visual ranking interface
- Real-time latency tracking
- Production-style API layer
- Clean modular ML architecture

---

## 📈 Future Roadmap

- PDF resume ingestion
- Section-aware JD parsing (Required vs Preferred)
- Skill graph clustering
- Candidate comparison view
- Authentication & recruiter dashboards
- Cloud deployment & scaling
- Docker containerization

---

## 🧩 Why This Project Matters

Traditional applicant tracking systems rely heavily on keyword filtering, often missing semantic relevance.

This engine introduces:
- Embedding-based semantic intelligence
- Weighted priority logic
- Transparent scoring architecture
- Full-stack production design

It demonstrates end-to-end ML system engineering — from model integration to API exposure to SaaS-style interface.

---

## 🛠 Running Locally

### Backend

cd backend  
python -m venv venv  
venv\Scripts\activate  
pip install -r requirements.txt  
python -m uvicorn app.main:app --reload  

### Frontend

cd frontend  
npm install  
npm run dev  

Then open:

http://localhost:3000  

---

## 📌 Author

Built as a full-stack AI engineering portfolio project with startup-grade architecture and scalable design in mind.
