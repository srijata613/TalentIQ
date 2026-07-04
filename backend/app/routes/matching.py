from fastapi import APIRouter
from pydantic import BaseModel

from src.candidate_pipeline import (
    CandidatePipeline,
)

from src.resume_parser import (
    parse_resume,
)

router = APIRouter()

pipeline = CandidatePipeline()


class MatchRequest(BaseModel):

    job_text: str

    resume_text: str


@router.post("/match")
def match_candidate(
    request: MatchRequest,
):

    candidate = parse_resume(
        request.resume_text
    )

    return pipeline.process(
        candidate,
        request.job_text,
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
    request: BulkMatchRequest,
):

    results = []

    for resume in request.resumes:

        candidate = parse_resume(
            resume
        )

        result = pipeline.process(
            candidate,
            request.job_text,
        )

        results.append(
            result
        )

    results.sort(
        key=lambda x: x[
            "candidate_match"
        ].overall_score,
        reverse=True,
    )

    return results