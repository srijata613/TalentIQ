from src.recruiter_summary import (
    build_recruiter_summary
)

understanding = {
    "career_stage": "Mid Level",
    "adaptability": 0.7,
    "strengths": [
        "Strong technical breadth",
        "Leadership indicators"
    ],
    "risks": [
        "Limited communication evidence"
    ]
}

evaluation = {
    "final_score": 0.82,
    "missing_skills": [
        "communication"
    ]
}

risk_assessment = {
    "risk_score": 15,
    "risk_level": "Low",
    "job_hopping_risk": 0,
    "employment_gap_risk": 0
}

result = build_recruiter_summary(
    understanding,
    evaluation,
    risk_assessment
)

print(result)