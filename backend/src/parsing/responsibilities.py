from __future__ import annotations

import logging

from .core import (
    _extract_section_lines,
    _extract_section_skills,
    _validate_text,
)
from .skills import (
    extract_skills_dictionary,
)

logger = logging.getLogger(__name__)

# Responsibilities
def extract_responsibilities(
    text: str,
) -> list[str]:
    """
    Extract responsibility bullet points from a job description.
    """
    try:
        _validate_text(text)

        return _extract_section_lines(
            text,
            (
                "responsibilities",
                "what you'll do",
                "what you will do",
                "job responsibilities",
            ),
            bullet_only=True,
        )

    except Exception:
        logger.exception(
            "Error in extract_responsibilities"
        )
        raise

# Must Have
def classify_must_have(
    text: str,
) -> list[str]:
    """
    Extract required skills from the required qualifications section.
    """
    try:
        _validate_text(text)

        return _extract_section_skills(
            text,
            (
                "required qualifications",
                "requirements",
                "must have",
            ),
            extractor=extract_skills_dictionary,
        )

    except Exception:
        logger.exception(
            "Error in classify_must_have"
        )
        raise

# Nice To Have
def classify_nice_to_have(
    text: str,
) -> list[str]:
    """
    Extract preferred skills from the preferred qualifications section.
    """
    try:
        _validate_text(text)

        return _extract_section_skills(
            text,
            (
                "preferred qualifications",
                "preferred skills",
                "nice to have",
                "good to have",
                "desired qualifications",
                "bonus points",
            ),
            extractor=extract_skills_dictionary,
        )

    except Exception:
        logger.exception(
            "Error in classify_nice_to_have"
        )
        raise