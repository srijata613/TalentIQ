from fastapi import APIRouter
from pydantic import BaseModel

from src.duplicate_detection import (
    detect_duplicates
)

router = APIRouter()


class DuplicateRequest(
    BaseModel
):
    candidates: list
    threshold: float = 0.75


@router.post(
    "/detect-duplicates"
)
def detect(
    request:
    DuplicateRequest
):

    return detect_duplicates(
        request.candidates,
        request.threshold
    )