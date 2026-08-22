import logging
import os
import tempfile
import time
from typing import Any, Dict, List
from datetime import datetime, UTC

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.routes import (
    clustering,
    duplicate_resolution,
    duplicates,
    interview,
    search,
    semantic_search,
    shortlisting,
)
from app.routes.jobs import router as jobs_router
from app.routes.matching import router as matching_router

from src.comparison import compare_candidates
from src.llm.parser import parse_resume_with_llm
from src.pdf_extractor import extract_pdf_text
from src.ranker import rank_candidates
from src.resume_parser import parse_resume

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

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

app.include_router(
    matching_router,
    tags=["matching"]
)

app.include_router(
    shortlisting.router,
    tags=["Shortlisting"]
)

app.include_router(
    interview.router,
    tags=["Interview"]
)

app.include_router(
    search.router,
    tags=["Search"]
)

app.include_router(
    semantic_search.router
)

app.include_router(
    clustering.router
)

app.include_router(
    duplicates.router
)

app.include_router(
    duplicate_resolution.router
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

class ComparisonRequest(
    BaseModel
):
    job_description: str
    resumes: List[str]

@app.post("/rank", response_model=RankingResponse)
def rank(request: RankingRequest):
    if not request.resumes:
        return {
            "latency_seconds": 0.0,
            "results": []
        }

    try:
        start = time.perf_counter()

        parsed_candidates = [
            parse_resume(resume)
            for resume in request.resumes
        ]

        results = rank_candidates(
            parsed_candidates,
            request.job_description,
        )

        latency = time.perf_counter() - start

        return {
            "latency_seconds": round(latency, 4),
            "results": results,
        }

    except Exception as e:
        logger.exception("Ranking failed")
        raise HTTPException(
            status_code=500,
            detail="Ranking failed."
        )

@app.post("/compare")
def compare(request: ComparisonRequest):

    try:
        parsed_candidates = [
            parse_resume(resume)
            for resume in request.resumes
        ]

        return compare_candidates(
            parsed_candidates,
            request.job_description,
        )

    except Exception as e:
        logger.exception("Comparison failed")
        raise HTTPException(
            status_code=500,
            detail=f"Comparison failed: {str(e)}"
        )

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "timestamp": datetime.now(UTC).isoformat(),
        "service": "TalentIQ Backend",
        "embedding_model": "BAAI/bge-large-en-v1.5",
        "version": "1.0.0",
    }
    
@app.post("/parse-resume")
def parse_resume_endpoint(request: ResumeParseRequest):

    try:
        return parse_resume(request.resume_text)

    except Exception as e:
        logger.exception("Resume parsing failed")
        raise HTTPException(
            status_code=500,
            detail=f"Resume parsing failed: {str(e)}"
        )

@app.post("/llm-test")
def llm_test(request: ResumeParseRequest):

    try:
        return parse_resume_with_llm(request.resume_text)

    except Exception as e:
        logger.exception("LLM parsing failed")
        raise HTTPException(
            status_code=500,
            detail=f"LLM parsing failed: {str(e)}"
        )

@app.post("/parse-resume-url")
def parse_resume_url(request: ResumeUrlRequest):

    temp_pdf_path = None

    try:
        response = requests.get(
            request.pdf_url,
            timeout=30,
        )

        response.raise_for_status()

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf",
        ) as temp_file:

            temp_file.write(response.content)
            temp_pdf_path = temp_file.name

        text = extract_pdf_text(temp_pdf_path)

        result = parse_resume(text)
        result["resume_text"] = text

        return result
        
    except requests.Timeout:
        logger.exception("PDF download timed out")
        raise HTTPException(
            status_code=408,
            detail="Downloading the resume timed out."
        )
        
    except requests.RequestException as e:
        logger.exception("Failed downloading PDF")
        raise HTTPException(
            status_code=400,
            detail=f"Unable to download PDF: {str(e)}"
        )
        
    except Exception as e:
        logger.exception("Resume URL parsing failed")
        raise HTTPException(
            status_code=500,
            detail=f"Resume parsing failed: {str(e)}"
        )

    finally:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)