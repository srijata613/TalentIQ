from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import time

from src.ranker import rank_candidates

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

class RankingRequest(BaseModel):
    job_description: str
    resumes: List[str]


class RankingResponse(BaseModel):
    latency_seconds: float
    results: List[Dict[str, Any]]


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