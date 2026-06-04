from fastapi import APIRouter
from pydantic import BaseModel

from src.parsing import (
    extract_skills_dictionary,
    extract_experience_requirement,
    extract_education_requirement,
    extract_certifications,
)

router = APIRouter()


class AnalyzeRequest(BaseModel):
    content: str


@router.post("/analyze")
def analyze_job(request: AnalyzeRequest):

    skills = extract_skills_dictionary(
        request.content
    )

    experience = extract_experience_requirement(
        request.content
    )

    education = extract_education_requirement(
        request.content
    )

    certifications = extract_certifications(
        request.content
    )

    return {
        "skills": skills,
        "experience": experience,
        "education": education,
        "certifications": certifications,
    }