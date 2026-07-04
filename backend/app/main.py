from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import time
import os
import tempfile
import requests

import numpy as np
from dataclasses import is_dataclass


from src.llm.parser import (
    parse_resume_with_llm,
)
from src.pdf_extractor import extract_pdf_text

from src.ranker import rank_candidates

from app.routes.jobs import router as jobs_router

from src.resume_parser import parse_resume
from src.comparison import (
    compare_candidates,
)

from app.routes.matching import (
    router as matching_router
)

from app.routes import (
    shortlisting
)

from app.routes import interview

from app.routes import search

from app.routes import (
    semantic_search
)

from app.routes import (
    clustering
)

from app.routes import duplicates

from app.routes import (
    duplicate_resolution
)

##from app.routes import copilot

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

##app.include_router(copilot.router)

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
    
def find_numpy(obj, path="root"):

        if isinstance(obj, np.generic):
            print(f"NUMPY FOUND -> {path}: {type(obj)} = {obj}")
            return

        if isinstance(obj, dict):
            for k, v in obj.items():
                find_numpy(v, f"{path}.{k}")

        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                find_numpy(v, f"{path}[{i}]")

        elif is_dataclass(obj):
            for k, v in vars(obj).items():
                find_numpy(v, f"{path}.{k}")

@app.post("/rank", response_model=RankingResponse)
def rank(request: RankingRequest):
    if not request.resumes:
        return {
            "latency_seconds": 0.0,
            "results": []
        }

    start = time.time()

    parsed_candidates = [
        parse_resume(resume)
        
        for resume in request.resumes
    ]
    
    results = rank_candidates(
        parsed_candidates,
        request.job_description,
    )
    
    find_numpy(results)

    latency = time.time() - start

    return {
        "latency_seconds": round(latency, 4),
        "results": results
    }

@app.post("/compare")
def compare(
    request: ComparisonRequest
):

    parsed_candidates = [
        parse_resume(resume)
        for resume in request.resumes
    ]
    
    for c in parsed_candidates:
        print(c["parsed_name"], c["parsed_experience_years"])
    
    comparison_results = compare_candidates(
        parsed_candidates,
        request.job_description
    )

    return comparison_results

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

@app.post("/llm-test")
def llm_test(request: ResumeParseRequest):

    return parse_resume_with_llm(
        request.resume_text
    )

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