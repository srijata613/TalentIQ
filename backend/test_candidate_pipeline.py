from pprint import pprint

from src.candidate_pipeline import (
    CandidatePipeline,
)

candidate = {

    "parsed_name": "Alice",

    "resume_text": """

Python developer

FastAPI

PostgreSQL

AWS

Led backend team

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

    "parsed_summary": "Results-driven backend engineer.",

    "parsed_experience_years": 5,

    "parsed_graduation_years": [

        "2020"

    ],

    "parsed_employment_duration": [],

    "parsed_employment_gaps": []

}

pipeline = CandidatePipeline()

result = pipeline.process(candidate)

from pprint import pprint

print("\n========== AI PROFILE ==========\n")

pprint(
    result["ai_profile"]
)