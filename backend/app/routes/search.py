from fastapi import APIRouter
from pydantic import BaseModel
from pydantic import Field
from typing import Dict, Any


from src.search_engine import (
    search_candidates
)

router = APIRouter()


class SearchRequest(
    BaseModel
):

    candidates: list[Dict[str, Any]]

    skills: list[str] = Field(default_factory=list)

    domain: str | None = None

    min_experience: float = 0

    certification: str | None = None

    fit_type: str | None = None

    min_score: float = 0


@router.post(
    "/search-candidates"
)
def search(
    request: SearchRequest
):

    return search_candidates(

        candidates=request.candidates,

        skills=request.skills,

        domain=request.domain,

        min_experience=request.min_experience,

        certification=request.certification,

        fit_type=request.fit_type,

        min_score=request.min_score
    )