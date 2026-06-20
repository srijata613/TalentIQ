from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import time
import os
import tempfile
import requests

from src.pdf_extractor import extract_pdf_text

from src.ranker import rank_candidates
from app.routes.jobs import router as jobs_router

from pydantic import BaseModel
from src.resume_parser import parse_resume


app = FastAPI(
    title="AI Resume Ranking Engine",
    description="Semantic, priority-aware resume–job matching system with explainable scoring.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    jobs_router,
    prefix="/jobs",
    tags=["jobs"]
)



class RankingRequest(BaseModel):
    job_description: str
    resumes: List[str]

class RankingResponse(BaseModel):
    latency_seconds: float
    results: List[Dict[str, Any]]
    
class ResumeParseRequest(BaseModel):
    resume_text: str

class ResumeUrlRequest(BaseModel):
    pdf_url: str

@app.post("/rank", response_model=RankingResponse)
def rank(request: RankingRequest):
    if not request.resumes:
        return {
            "latency_seconds": 0.0,
            "results": []
        }

    start = time.time()

    results = rank_candidates(
        request.job_description,
        request.resumes
    )

    latency = time.time() - start

    return {
        "latency_seconds": round(latency, 4),
        "results": results
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "bge-large-en-v1.5"
    }
    
@app.post("/parse-resume")
def parse_resume_endpoint(
    request: ResumeParseRequest
):
    result = parse_resume(
        request.resume_text
    )

    return result

@app.post("/parse-resume-url")
def parse_resume_url(request: ResumeUrlRequest):

    try:
        response = requests.get(request.pdf_url)

        print("STATUS:", response.status_code)
        print(
            "CONTENT TYPE:",
            response.headers.get("content-type")
        )

        response.raise_for_status()

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp_file:

            temp_file.write(response.content)

            temp_pdf_path = temp_file.name

        print("TEMP PDF:", temp_pdf_path)

        text = extract_pdf_text(temp_pdf_path)

        print("TEXT LENGTH:", len(text))

        result = parse_resume(text)

        result["resume_text"] = text

        return result

    except Exception as e:
        print("ERROR:", str(e))
        raise

    finally:
        if "temp_pdf_path" in locals():
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)