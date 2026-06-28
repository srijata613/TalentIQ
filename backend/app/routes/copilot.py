from fastapi import APIRouter
from pydantic import BaseModel, Field

from src.recruiter_copilot import RecruiterCopilot

router = APIRouter()

copilot = RecruiterCopilot()


class CopilotRequest(BaseModel):
    query: str = Field(...)

    candidates: list[dict] = Field(
        default_factory=list
    )


@router.post("/copilot")
def ask_copilot(
    request: CopilotRequest
):

    return copilot.answer(

        query=request.query,

        candidates=request.candidates

    )
    