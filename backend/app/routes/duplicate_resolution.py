from fastapi import APIRouter
from pydantic import BaseModel

from src.duplicate_resolution import (
    merge_candidates
)

router = APIRouter()


class MergeRequest(
    BaseModel
):

    candidate_a: dict

    candidate_b: dict


@router.post(
    "/merge-candidates"
)
def merge(
    request:
    MergeRequest
):

    return merge_candidates(
        request.candidate_a,
        request.candidate_b
    )