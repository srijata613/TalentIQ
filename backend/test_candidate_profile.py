from pprint import pprint

from src.candidate_pipeline import CandidatePipeline
from src.candidate_profile_generator import (
    CandidateProfileGenerator,
)

candidate = {

    "id": "candidate_001",

    "parsed_name": "Alice",

    "resume_text": """
Backend Engineer

Python
FastAPI
PostgreSQL

Led backend team.
""",

    "parsed_skills": [
        "Python",
        "FastAPI",
        "PostgreSQL",
    ],

    "parsed_companies": [
        "Google"
    ],

    "parsed_universities": [
        "IIT Delhi"
    ],

    "parsed_certifications": [
        "AWS Solutions Architect Associate"
    ],

    "parsed_project_technologies": [
        "Python",
        "FastAPI",
    ],

    "parsed_summary":
        "Results-driven backend engineer.",

    "parsed_experience_years": 5,

    "parsed_graduation_years": [
        "2020"
    ],

    "parsed_employment_duration": [],

    "parsed_employment_gaps": []
}

pipeline = CandidatePipeline()

candidate = pipeline.process(candidate)

generator = CandidateProfileGenerator()

profile = generator.generate(candidate)

pprint(profile)
