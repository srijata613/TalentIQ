from fastapi import APIRouter
from pydantic import BaseModel

from bs4 import BeautifulSoup
import requests
import tempfile
import os

from src.pdf_extractor import extract_pdf_text

from src.parsing import (
    TECHNICAL_SKILLS,
    extract_skills_dictionary,
    extract_experience_requirement,
    extract_education_requirement,
    extract_certifications,
    extract_preferred_skills,
    extract_soft_skills,
    extract_tools,
    extract_technologies,
    extract_keywords,
    extract_seniority,
    extract_industry,
    extract_domain,
    extract_responsibilities,
    classify_must_have,
    classify_nice_to_have,
    readability_score,
    detect_hidden_requirements,
    extract_semantic_requirements,
    detect_missing_requirements,
    detect_duplicate_requirements,
    detect_skill_gaps,
    benchmark_salary,
)

router = APIRouter()


class AnalyzeRequest(BaseModel):
    content: str


class PdfUrlRequest(BaseModel):
    pdf_url: str


class ImportUrlRequest(BaseModel):
    url: str


@router.post("/analyze")
def analyze_job(request: AnalyzeRequest):

    required_skills = extract_skills_dictionary(
        request.content,
        TECHNICAL_SKILLS
    )
    
    experience = extract_experience_requirement(
        request.content
    )
    
    education = extract_education_requirement(
        request.content
    )
    
    seniority = extract_seniority(
        request.content
    )
    
    technologies = extract_technologies(
        request.content
    )

    return {
        "required_skills": required_skills,

        "preferred_skills":
            extract_preferred_skills(
                request.content
            ),

        "responsibilities":
            extract_responsibilities(
                request.content
            ),

        "experience":
            extract_experience_requirement(
                request.content
            ),

        "education":
            extract_education_requirement(
                request.content
            ),

        "certifications":
            extract_certifications(
                request.content
            ),

        "seniority":
            extract_seniority(
                request.content
            ),

        "industry":
            extract_industry(
                request.content
            ),

        "domain":
            extract_domain(
                request.content
            ),

        "tools":
            extract_tools(
                request.content
            ),

        "technologies":
            extract_technologies(
                request.content
            ),

        "soft_skills":
            extract_soft_skills(
                request.content
            ),

        "keywords":
            extract_keywords(
                request.content
            ),

        "must_have":
            classify_must_have(
                request.content
            ),

        "nice_to_have":
            classify_nice_to_have(
                request.content
            ),

        "readability_score":
            readability_score(
                request.content
            ),
            
            "hidden_requirements":
                detect_hidden_requirements(
                    request.content
            ),

            "semantic_requirements":
                extract_semantic_requirements(
                    request.content
           ),

            "missing_requirements":
                detect_missing_requirements(
                    experience,
                    education,
                    required_skills
            ),

            "duplicate_requirements":
                detect_duplicate_requirements(
                    required_skills
            ),

            "skill_gaps":
                detect_skill_gaps(
                    technologies
            ),

            "salary_benchmark":
                benchmark_salary(
                    seniority
    ),
    }


@router.post("/analyze-pdf")
def analyze_pdf_job(
    request: PdfUrlRequest
):

    try:

        response = requests.get(
            request.pdf_url,
            timeout=30
        )

        response.raise_for_status()

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp_file:

            temp_file.write(
                response.content
            )

            temp_pdf_path = (
                temp_file.name
            )

        text = extract_pdf_text(
            temp_pdf_path
        )

        return {
            "content": text
        }

    finally:

        if (
            "temp_pdf_path"
            in locals()
        ):

            if os.path.exists(
                temp_pdf_path
            ):
                os.remove(
                    temp_pdf_path
                )


def extract_job_description_text(
    text: str
):

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    start_keywords = [
        "job description",
        "about the role",
        "about this role",
        "role overview",
        "the opportunity",
        "responsibilities",
        "requirements",
        "qualifications",
        "required qualifications",
        "preferred qualifications",
        "what you'll do",
        "what you will do",
    ]

    end_keywords = [
        "apply now",
        "privacy policy",
        "terms of use",
        "equal opportunity",
        "cookie policy",
        "share this job",
        "similar jobs",
        "related jobs",
    ]

    collecting = False
    extracted = []

    for line in lines:

        lower = line.lower()

        if not collecting:

            if any(
                keyword in lower
                for keyword in start_keywords
            ):
                collecting = True

        if collecting:

            if any(
                keyword in lower
                for keyword in end_keywords
            ):
                break

            extracted.append(line)

    return "\n".join(extracted)


def looks_like_job_posting(
    text: str
):

    text_lower = text.lower()

    strong_signals = [
        "required qualifications",
        "preferred qualifications",
        "job responsibilities",
        "what you'll do",
        "what you will do",
        "minimum qualifications",
        "years of experience",
        "experience required",
        "apply now",
        "job description",
    ]

    score = sum(
        signal in text_lower
        for signal in strong_signals
    )

    return score >= 2


@router.post("/import-url")
def import_url(
    request: ImportUrlRequest
):

    try:

        response = requests.get(
            request.url,
            timeout=20,
            headers={
                "User-Agent":
                "Mozilla/5.0"
            }
        )

        print(
            "IMPORT URL:",
            request.url
        )

        print(
            "STATUS:",
            response.status_code
        )

        response.raise_for_status()

    except Exception as e:

        return {
            "error":
                f"Failed to fetch URL: {str(e)}"
        }

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    for tag in soup(
        [
            "script",
            "style",
            "noscript",
            "header",
            "footer",
            "nav",
            "svg",
        ]
    ):
        tag.decompose()

    raw_text = soup.get_text(
        separator="\n",
        strip=True
    )

    if not looks_like_job_posting(
        raw_text
    ):
        return {
            "error":
                "This URL does not appear to contain a job description."
        }

    text = extract_job_description_text(
        raw_text
    )

    if len(text) < 500:
        text = raw_text

    text = text[:50000]

    return {
        "content": text
    }