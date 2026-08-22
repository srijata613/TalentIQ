from __future__ import annotations

import logging
from typing import Any, Dict

from src.config import MAX_MATCH_SCORE

logger = logging.getLogger(__name__)

STARTUP_PROJECT_WEIGHT = 5.0
STARTUP_OPEN_SOURCE_WEIGHT = 10.0
STARTUP_LEADERSHIP_WEIGHT = 5.0

ENTERPRISE_EXPERIENCE_WEIGHT = 5.0
ENTERPRISE_CERTIFICATION_WEIGHT = 5.0

REMOTE_BASE_SCORE = 50.0
REMOTE_PROJECT_WEIGHT = 3.0
REMOTE_GITHUB_BONUS = 10.0

LEADERSHIP_SIGNAL_WEIGHT = 15.0


def _clamp(score: float) -> float:
    return max(0.0, min(score, MAX_MATCH_SCORE))


def _safe_float(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _count(candidate: Dict[str, Any], key: str) -> int:
    value = candidate.get(key)

    if not value:
        return 0

    if isinstance(value, (list, tuple, set)):
        return len(value)

    return 1


def startup_fit_score(
    candidate: Dict[str, Any],
) -> float:

    score = (
        _count(candidate, "parsed_projects")
        * STARTUP_PROJECT_WEIGHT
        + _count(candidate, "parsed_open_source")
        * STARTUP_OPEN_SOURCE_WEIGHT
        + _count(candidate, "parsed_leadership_signals")
        * STARTUP_LEADERSHIP_WEIGHT
    )

    return _clamp(score)


def enterprise_fit_score(
    candidate: Dict[str, Any],
) -> float:

    score = (
        _safe_float(
            candidate.get(
                "parsed_experience_years"
            )
        )
        * ENTERPRISE_EXPERIENCE_WEIGHT
        + _count(
            candidate,
            "parsed_certifications",
        )
        * ENTERPRISE_CERTIFICATION_WEIGHT
    )

    return _clamp(score)


def remote_fit_score(
    candidate: Dict[str, Any],
) -> float:

    score = REMOTE_BASE_SCORE

    score += (
        _count(
            candidate,
            "parsed_projects",
        )
        * REMOTE_PROJECT_WEIGHT
    )

    if candidate.get("parsed_github"):
        score += REMOTE_GITHUB_BONUS

    return _clamp(score)


def leadership_fit_score(
    candidate: Dict[str, Any],
) -> float:

    score = (
        _count(
            candidate,
            "parsed_leadership_signals",
        )
        * LEADERSHIP_SIGNAL_WEIGHT
    )

    return _clamp(score)


def generate_fit_scores(
    candidate: Dict[str, Any],
) -> Dict[str, float]:

    if not isinstance(candidate, dict):
        raise TypeError(
            "Candidate must be a dictionary."
        )

    try:

        return {
            "startup_fit": startup_fit_score(
                candidate
            ),
            "enterprise_fit": enterprise_fit_score(
                candidate
            ),
            "remote_fit": remote_fit_score(
                candidate
            ),
            "leadership_fit": leadership_fit_score(
                candidate
            ),
        }

    except Exception:

        logger.exception(
            "Failed to generate fit scores."
        )

        raise