from __future__ import annotations

import logging
import re
from functools import lru_cache
from typing import Iterable

from .config import (
    DEGREE_KEYWORDS,
    FIELD_KEYWORDS,
)

logger = logging.getLogger(__name__)

DEGREE_MATCH_SCORE = 0.5
FIELD_MATCH_SCORE = 0.5

BONUS_THRESHOLDS = (
    (5, 1.0),
    (3, 0.75),
    (2, 0.50),
    (1, 0.25),
)


@lru_cache(maxsize=None)
def _compiled_pattern(keyword: str) -> re.Pattern[str]:
    return re.compile(
        rf"\b{re.escape(keyword.lower())}\b"
    )


def _normalize_set(
    values: Iterable[str],
) -> set[str]:

    return {
        value.strip().lower()
        for value in values
        if isinstance(value, str)
        and value.strip()
    }


def _contains_keyword(
    text: str,
    keywords: Iterable[str],
) -> bool:

    normalized = text.lower()

    return any(
        _compiled_pattern(keyword).search(
            normalized
        )
        for keyword in keywords
    )


def compute_education_score(
    jd_text: str,
    resume_text: str,
) -> float:

    if not isinstance(jd_text, str):
        raise TypeError(
            "jd_text must be a string."
        )

    if not isinstance(resume_text, str):
        raise TypeError(
            "resume_text must be a string."
        )

    if not jd_text.strip() or not resume_text.strip():
        return 0.0

    try:

        score = 0.0

        degree_required = _contains_keyword(
            jd_text,
            DEGREE_KEYWORDS,
        )

        degree_present = _contains_keyword(
            resume_text,
            DEGREE_KEYWORDS,
        )

        field_required = _contains_keyword(
            jd_text,
            FIELD_KEYWORDS,
        )

        field_present = _contains_keyword(
            resume_text,
            FIELD_KEYWORDS,
        )

        if degree_required and degree_present:
            score += DEGREE_MATCH_SCORE

        if field_required and field_present:
            score += FIELD_MATCH_SCORE

        return min(score, 1.0)

    except Exception:

        logger.exception(
            "Education score computation failed."
        )

        raise


def compute_bonus_score(
    jd_skills: list[str],
    resume_skills: list[str],
    matched_skills: list[str],
) -> float:

    if (
        not isinstance(jd_skills, list)
        or not isinstance(resume_skills, list)
        or not isinstance(matched_skills, list)
    ):
        raise TypeError(
            "Skill inputs must be lists."
        )

    try:

        jd = _normalize_set(jd_skills)

        resume = _normalize_set(
            resume_skills
        )

        matched = _normalize_set(
            matched_skills
        )

        extra_skills = (
            resume
            - jd
            - matched
        )

        count = len(extra_skills)

        for minimum, score in BONUS_THRESHOLDS:

            if count >= minimum:
                return score

        return 0.0

    except Exception:

        logger.exception(
            "Bonus score computation failed."
        )

        raise