from fastapi import APIRouter
from pydantic import BaseModel

from src.semantic_search import (
    search_similar_candidates
)

router = APIRouter()


class SemanticSearchRequest(
    BaseModel
):

    query: str

    candidates: list

    top_k: int = 10


@router.post(
    "/semantic-search"
)
def semantic_search(
    request:
    SemanticSearchRequest
):

    return search_similar_candidates(
        request.query,
        request.candidates,
        request.top_k
    )