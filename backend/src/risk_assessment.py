from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Iterable, List, Set

from src.config import (
    LOW_RISK_THRESHOLD,
    MEDIUM_RISK_THRESHOLD,
)

logger = logging.getLogger(__name__)

# Configuration
RISK_WEIGHTS = {
    "skill": 0.30,
    "keyword": 0.10,
    "gap": 0.20,
    "hopping": 0.15,
    "inconsistency": 0.20,
    "ai": 0.05,
}

AI_PHRASES: Set[str] = {
    "results-driven",
    "highly motivated",
    "dynamic professional",
    "seasoned professional",
    "passionate individual",
    "team player",
    "detail-oriented",
    "self-starter",
    "fast-paced environment",
    "proven track record",
    "results oriented",
    "excellent communication",
    "strong analytical skills",
    "works well under pressure",
    "hardworking",
    "go getter",
    "problem solver",
    "adaptable",
    "innovative",
}


def _normalize(values: Iterable[Any]) -> Set[str]:
    return {
        str(v).strip().lower()
        for v in values
        if v
    }


def _clamp(score: float) -> float:
    return round(max(0.0, min(score, 100.0)), 2)


# Individual Risk Detectors
def detect_skill_inflation(
    skills: List[str],
    project_technologies: List[str],
) -> float:

    claimed = _normalize(skills)
    proven = _normalize(project_technologies)

    if not claimed:
        return 0.0

    support_ratio = len(claimed & proven) / len(claimed)

    if support_ratio >= 0.70:
        return 0.0

    if support_ratio >= 0.50:
        return 20.0

    if support_ratio >= 0.30:
        return 45.0

    return 70.0


def detect_keyword_stuffing(
    skills: List[str],
) -> float:

    count = len(skills)

    if count <= 20:
        return 0.0

    if count <= 30:
        return 25.0

    if count <= 40:
        return 50.0

    return 100.0


def detect_employment_gap_risk(
    employment_gaps: List[Any],
) -> float:

    risk = 0.0

    for gap in employment_gaps:

        try:

            months = float(gap)

        except (TypeError, ValueError):

            logger.debug(
                "Invalid employment gap value: %s",
                gap,
            )

            risk += 10
            continue

        if months >= 12:
            risk += 30

        elif months >= 6:
            risk += 15

        elif months >= 3:
            risk += 5

    return _clamp(risk)


def detect_job_hopping_risk(
    employment_duration: List[Any],
) -> float:

    risk = 0.0

    for duration in employment_duration:

        try:

            months = float(duration)

        except (TypeError, ValueError):

            logger.debug(
                "Invalid employment duration: %s",
                duration,
            )

            risk += 10
            continue

        if months < 6:
            risk += 25

        elif months < 12:
            risk += 15

    return _clamp(risk)


def detect_resume_inconsistency(
    graduation_years: List[Any],
    experience_years: float,
) -> float:

    years = [
        int(y)
        for y in graduation_years
        if str(y).isdigit()
    ]

    if not years:
        return 0.0

    latest_grad = max(years)

    current_year = datetime.now().year

    estimated_max = current_year - latest_grad

    if experience_years > 35:
        return 100.0

    if (
        latest_grad >= current_year - 1
        and experience_years >= 8
    ):
        return 100.0

    if experience_years > estimated_max + 2:
        return 100.0

    if experience_years > estimated_max:
        return 50.0

    return 0.0


def detect_ai_generated_resume(
    summary: str,
) -> float:

    if not summary:
        return 0.0

    summary = summary.lower()

    matches = sum(
        phrase in summary
        for phrase in AI_PHRASES
    )

    return _clamp(matches * 5)


def get_risk_level(
    score: float,
) -> str:

    if score < LOW_RISK_THRESHOLD:
        return "Low"

    if score < MEDIUM_RISK_THRESHOLD:
        return "Medium"

    return "High"

# Main Entry Point
def calculate_risk_score(
    candidate: Dict[str, Any],
) -> Dict[str, Any]:

    if not isinstance(candidate, dict):
        raise TypeError(
            "Candidate must be a dictionary."
        )

    try:

        skill_risk = detect_skill_inflation(
            candidate.get(
                "parsed_skills",
                [],
            ),
            candidate.get(
                "parsed_project_technologies",
                [],
            ),
        )

        keyword_risk = detect_keyword_stuffing(
            candidate.get(
                "parsed_skills",
                [],
            )
        )

        gap_risk = detect_employment_gap_risk(
            candidate.get(
                "parsed_employment_gaps",
                [],
            )
        )

        hopping_risk = detect_job_hopping_risk(
            candidate.get(
                "parsed_employment_duration",
                [],
            )
        )

        inconsistency_risk = (
            detect_resume_inconsistency(
                candidate.get(
                    "parsed_graduation_years",
                    [],
                ),
                candidate.get(
                    "parsed_experience_years",
                    0,
                ),
            )
        )

        ai_risk = detect_ai_generated_resume(
            candidate.get(
                "parsed_summary",
                "",
            )
        )

        final_score = round(
            skill_risk * RISK_WEIGHTS["skill"]
            + keyword_risk * RISK_WEIGHTS["keyword"]
            + gap_risk * RISK_WEIGHTS["gap"]
            + hopping_risk * RISK_WEIGHTS["hopping"]
            + inconsistency_risk
            * RISK_WEIGHTS["inconsistency"]
            + ai_risk * RISK_WEIGHTS["ai"],
            2,
        )

        return {
            "risk_score": final_score,
            "risk_level": get_risk_level(
                final_score
            ),
            "skill_inflation_risk": skill_risk,
            "keyword_stuffing_risk": keyword_risk,
            "employment_gap_risk": gap_risk,
            "job_hopping_risk": hopping_risk,
            "resume_inconsistency_risk": inconsistency_risk,
            "ai_generated_resume_risk": ai_risk,
        }

    except Exception:
        logger.exception(
            "Failed calculating risk assessment."
        )
        raise