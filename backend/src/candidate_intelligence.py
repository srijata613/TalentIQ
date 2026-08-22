from __future__ import annotations

import logging
from typing import Any, Dict, Iterable, List, Set

from .intelligence import (
    detect_behavioral_signals,
    detect_implicit_skills,
)
from .resume_quality import (
    analyze_section_coverage,
    calculate_resume_completeness,
    calculate_resume_quality_score,
    detect_keyword_stuffing,
)

logger = logging.getLogger(__name__)

SKILL_MENTION_DIVISOR = 3
LEADERSHIP_DIVISOR = 5
OWNERSHIP_DIVISOR = 5
BEHAVIOR_DIVISOR = 3

DOMAIN_SKILLS = {
    "backend": {
        "fastapi",
        "django",
        "flask",
        "spring",
        "node",
        "express",
        "rest",
        "microservices",
    },
    "ai_ml": {
        "tensorflow",
        "pytorch",
        "scikit-learn",
        "llm",
        "langchain",
        "transformers",
    },
    "cloud": {
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
    },
    "frontend": {
        "react",
        "next.js",
        "vue",
        "angular",
    },
}


def _normalize(values: Iterable[Any]) -> Set[str]:
    return {
        str(v).strip().lower()
        for v in values
        if v
    }


def _clamp(value: float) -> float:
    return max(0.0, min(round(value, 2), 1.0))


def estimate_skill_proficiency(
    candidate: Dict[str, Any],
    resume_text: str,
    skills: List[str],
) -> Dict[str, float]:

    text_lower = resume_text.lower()

    project_technologies = _normalize(
        candidate.get(
            "parsed_project_technologies",
            [],
        )
    )

    proficiency: Dict[str, float] = {}

    for skill in skills:

        skill_name = str(skill).strip()

        if not skill_name:
            continue

        mentions = text_lower.count(
            skill_name.lower()
        )

        if skill_name.lower() in project_technologies:
            mentions += 2

        proficiency[skill_name] = _clamp(
            mentions / SKILL_MENTION_DIVISOR
        )

    return proficiency


def estimate_skill_relevance(
    jd_skills: List[str],
    resume_skills: List[str],
) -> float:

    if not jd_skills:
        return 0.0

    jd = _normalize(jd_skills)
    resume = _normalize(resume_skills)

    overlap = len(jd & resume)

    return round(
        overlap / len(jd),
        2,
    )


def estimate_domain_experience(
    candidate: Dict[str, Any],
) -> Dict[str, float]:

    skills = _normalize(
        candidate.get(
            "parsed_skills",
            [],
        )
    )

    scores: Dict[str, float] = {}

    for domain, required in DOMAIN_SKILLS.items():

        scores[domain] = round(
            len(skills & required)
            / len(required),
            2,
        )

    return scores


def estimate_leadership_experience(
    behavioral_signals: Dict[str, Any],
    candidate: Dict[str, Any],
) -> float:

    score = behavioral_signals.get(
        "leadership",
        0,
    )

    score += len(
        candidate.get(
            "parsed_leadership_signals",
            [],
        )
    )

    return _clamp(
        score / LEADERSHIP_DIVISOR
    )


def estimate_ownership_score(
    behavioral_signals: Dict[str, Any],
    candidate: Dict[str, Any],
) -> float:

    score = behavioral_signals.get(
        "ownership",
        0,
    )

    score += len(
        candidate.get(
            "parsed_leadership_signals",
            [],
        )
    )

    score += len(
        candidate.get(
            "parsed_open_source",
            [],
        )
    )

    return _clamp(
        score / OWNERSHIP_DIVISOR
    )


def estimate_initiative_score(
    behavioral_signals: Dict[str, Any],
) -> float:

    return _clamp(
        behavioral_signals.get(
            "initiative",
            0,
        )
        / BEHAVIOR_DIVISOR
    )


def estimate_collaboration_score(
    behavioral_signals: Dict[str, Any],
) -> float:

    return _clamp(
        behavioral_signals.get(
            "collaboration",
            0,
        )
        / BEHAVIOR_DIVISOR
    )


def build_candidate_intelligence(
    candidate: Dict[str, Any],
    jd_skills: List[str] | None = None,
) -> Dict[str, Any]:

    if not isinstance(candidate, dict):
        raise TypeError(
            "Candidate must be a dictionary."
        )

    try:

        resume_text = candidate.get(
            "resume_text",
            "",
        )

        explicit_skills = candidate.get(
            "parsed_skills",
            [],
        )

        jd_skills = jd_skills or []

        behavioral = candidate.get(
            "behavioral_signals",
            {}
        )

        if not behavioral:

            behavioral = detect_behavioral_signals(
                resume_text
            )

        inferred_skills = (
            detect_implicit_skills(
                explicit_skills
            )
        )

        coverage = (
            analyze_section_coverage(
                candidate
            )
        )

        stuffing = (
            detect_keyword_stuffing(
                resume_text
            )
        )

        completeness = (
            calculate_resume_completeness(
                coverage
            )
        )

        quality_score = (
            calculate_resume_quality_score(
                candidate,
                completeness,
                stuffing,
            )
        )

        return {
            "explicit_skills": explicit_skills,
            "inferred_skills": inferred_skills,
            "behavioral_signals": behavioral,
            "skill_proficiency": estimate_skill_proficiency(
                candidate,
                resume_text,
                explicit_skills,
            ),
            "skill_relevance": estimate_skill_relevance(
                jd_skills,
                explicit_skills,
            ),
            "domain_experience": estimate_domain_experience(
                candidate
            ),
            "leadership_experience": estimate_leadership_experience(
                behavioral,
                candidate,
            ),
            "ownership_score": estimate_ownership_score(
                behavioral,
                candidate,
            ),
            "initiative_score": estimate_initiative_score(
                behavioral,
            ),
            "collaboration_score": estimate_collaboration_score(
                behavioral,
            ),
            "resume_quality": {
                "section_coverage": coverage,
                "keyword_stuffing": stuffing,
                "completeness": completeness,
                "quality_score": quality_score,
            },
        }

    except Exception:
        logger.exception(
            "Failed to build candidate intelligence."
        )
        raise