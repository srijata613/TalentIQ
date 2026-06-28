from fastapi import APIRouter
from pydantic import BaseModel

from src.interview_engine import (
    generate_interview_pack
)

router = APIRouter()


class InterviewRequest(
    BaseModel
):
    candidate: dict


@router.post(
    "/interview-pack"
)
def create_interview_pack(
    request:
    InterviewRequest
):

    return generate_interview_pack(
        request.candidate
    )