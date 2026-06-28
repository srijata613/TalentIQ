from fastapi import APIRouter
from pydantic import BaseModel

from src.evaluator import evaluate_candidate

router = APIRouter()


class MatchRequest(BaseModel):
    job_text: str
    resume_text: str


@router.post("/match")
def match_candidate(
    request: MatchRequest
):
    return evaluate_candidate(
        request.job_text,
        request.resume_text
    )
    
class BulkMatchRequest(
    BaseModel
):
    job_text: str
    resumes: list[str]


@router.post(
    "/match-bulk"
)
def match_bulk(
    request: BulkMatchRequest
):

    results = []

    for resume in request.resumes:

        result = evaluate_candidate(
            request.job_text,
            resume
        )

        results.append(
            result
        )

    results.sort(
        key=lambda x:
        x["final_score"],
        reverse=True
    )

    return results