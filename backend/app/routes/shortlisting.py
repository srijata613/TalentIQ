from fastapi import APIRouter
from pydantic import BaseModel

from src.shortlisting import (
    generate_shortlist
)

router = APIRouter()


class ShortlistRequest(
    BaseModel
):
    candidates: list


@router.post(
    "/shortlist"
)
def shortlist(
    request:
    ShortlistRequest
):
    return generate_shortlist(
        request.candidates
    )