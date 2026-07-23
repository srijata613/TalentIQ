import re

from .config import (
    DEGREE_KEYWORDS,
    FIELD_KEYWORDS,
)


def _contains_keyword(
    text: str,
    keywords: list[str],
) -> bool:

    text = text.lower()

    return any(
        re.search(
            rf"\b{re.escape(keyword.lower())}\b",
            text,
        )
        for keyword in keywords
    )


# Education scoring
def compute_education_score(
    jd_text: str,
    resume_text: str,
) -> float:

    if not jd_text or not resume_text:
        return 0.0

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

    score = 0.0

    if degree_required and degree_present:
        score += 0.5

    if field_required and field_present:
        score += 0.5

    return min(score, 1.0)


# Bonus scoring
def compute_bonus_score(
    jd_skills: list[str],
    resume_skills: list[str],
    matched_skills: list[str],
) -> float:

    jd = {
        skill.lower().strip()
        for skill in jd_skills
        if skill
    }

    resume = {
        skill.lower().strip()
        for skill in resume_skills
        if skill
    }

    matched = {
        skill.lower().strip()
        for skill in matched_skills
        if skill
    }

    extra_skills = resume - jd - matched

    count = len(extra_skills)

    if count >= 5:
        return 1.0

    if count >= 3:
        return 0.75

    if count >= 2:
        return 0.50

    if count == 1:
        return 0.25

    return 0.0