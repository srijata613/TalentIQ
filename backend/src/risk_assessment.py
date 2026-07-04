from typing import Dict, List
import re

from src.config import (
    LOW_RISK_THRESHOLD,
    MEDIUM_RISK_THRESHOLD,
)


def detect_skill_inflation(
    skills: List[str],
    project_technologies: List[str]
) -> float:

    if not skills:
        return 0

    claimed = {
        s.lower().strip()
        for s in skills
        if s
    }

    proven = {
        s.lower().strip()
        for s in project_technologies
        if s
    }

    supported = len(
        claimed.intersection(proven)
    )

    unsupported = len(claimed) - supported

    return round(
        (unsupported / max(len(claimed), 1)) * 100,
        2
    )


def detect_keyword_stuffing(
    skills: List[str]
) -> float:

    if not skills:
        return 0

    count = len(skills)

    if count <= 20:
        return 0

    if count <= 30:
        return 25

    if count <= 40:
        return 50

    return 100


def detect_employment_gap_risk(
    employment_gaps
) -> float:

    if not employment_gaps:
        return 0

    risk = 0

    for gap in employment_gaps:

        try:
            months = float(gap)

            if months >= 12:
                risk += 30

            elif months >= 6:
                risk += 15

            elif months >= 3:
                risk += 5

        except Exception:
            risk += 10

    return min(risk, 100)


def detect_job_hopping_risk(
    employment_duration
) -> float:

    if not employment_duration:
        return 0

    risk = 0

    for duration in employment_duration:

        try:
            months = float(duration)

            if months < 6:
                risk += 25

            elif months < 12:
                risk += 15

        except Exception:
            risk += 10

    return min(risk, 100)


def detect_resume_inconsistency(
    graduation_years,
    experience_years
) -> float:

    if not graduation_years:
        return 0

    try:

        latest_grad_year = max(
            int(y)
            for y in graduation_years
            if str(y).isdigit()
        )

        estimated_max_experience = (
            2026 - latest_grad_year
        )

        if experience_years > (
            estimated_max_experience + 2
        ):
            return 100

        if experience_years > (
            estimated_max_experience
        ):
            return 50

        return 0

    except Exception:
        return 0


def detect_ai_generated_resume(
    summary: str
) -> float:

    if not summary:
        return 0

    summary = summary.lower()

    phrases = [
        "results-driven",
        "highly motivated",
        "dynamic professional",
        "seasoned professional",
        "passionate individual",
        "team player",
        "detail-oriented",
        "self-starter",
        "fast-paced environment",
        "proven track record"
    ]

    matches = sum(
        1
        for phrase in phrases
        if phrase in summary
    )

    return min(matches * 10, 100)


def get_risk_level(
    score: float
) -> str:

    if score < LOW_RISK_THRESHOLD:
        return "Low"

    if score < MEDIUM_RISK_THRESHOLD:
        return "Medium"

    return "High"


def calculate_risk_score(
    candidate: Dict
) -> Dict:

    skill_risk = detect_skill_inflation(
        candidate.get(
            "parsed_skills",
            []
        ),
        candidate.get(
            "parsed_project_technologies",
            []
        )
    )

    keyword_risk = detect_keyword_stuffing(
        candidate.get(
            "parsed_skills",
            []
        )
    )

    gap_risk = detect_employment_gap_risk(
        candidate.get(
            "parsed_employment_gaps",
            []
        )
    )

    hopping_risk = detect_job_hopping_risk(
        candidate.get(
            "parsed_employment_duration",
            []
        )
    )

    inconsistency_risk = (
        detect_resume_inconsistency(
            candidate.get(
                "parsed_graduation_years",
                []
            ),
            candidate.get(
                "parsed_experience_years",
                0
            )
        )
    )

    ai_risk = detect_ai_generated_resume(
        candidate.get(
            "parsed_summary",
            ""
        )
    )

    weights = {
        "skill": 0.25,
        "keyword": 0.15,
        "gap": 0.20,
        "hopping": 0.15,
        "inconsistency": 0.10,
        "ai": 0.15
    }

    final_score = round(
        (
            skill_risk * weights["skill"]
            + keyword_risk * weights["keyword"]
            + gap_risk * weights["gap"]
            + hopping_risk * weights["hopping"]
            + inconsistency_risk * weights["inconsistency"]
            + ai_risk * weights["ai"]
        ),
        2
    )
    
    return {
    "risk_score": final_score,
    "risk_level": get_risk_level(
        final_score
    ),

    "skill_inflation_risk":
        skill_risk,

    "keyword_stuffing_risk":
        keyword_risk,

    "employment_gap_risk":
        gap_risk,

    "job_hopping_risk":
        hopping_risk,

    "resume_inconsistency_risk":
        inconsistency_risk,

    "ai_generated_resume_risk":
        ai_risk
    }
