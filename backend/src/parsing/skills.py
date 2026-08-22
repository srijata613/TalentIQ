from __future__ import annotations

import logging
from typing import Sequence

from .core import (
    _extract_dictionary_matches,
    _extract_section_skills,
    _validate_text,
    get_all_skills,
    get_soft_skills,
    get_tools,
    get_technologies,
)

logger = logging.getLogger(__name__)

# Generic Skill Extraction

def extract_skills_dictionary(
    text: str,
    skill_list: Sequence[str] | None = None,
) -> list[str]:
    """
    Dictionary-based skill extraction.
    """
    try:
        if skill_list is None:
            skill_list = get_all_skills()

        return _extract_dictionary_matches(
            text,
            skill_list,
        )

    except Exception:
        logger.exception(
            "Error in extract_skills_dictionary"
        )
        raise


# Preferred Skills
def extract_preferred_skills(
    text: str,
) -> list[str]:
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
            "Error in extract_preferred_skills"
        )
        raise

# Soft Skills

def extract_soft_skills(
    text: str,
) -> list[str]:
    try:
        return _extract_dictionary_matches(
            text,
            get_soft_skills(),
        )

    except Exception:
        logger.exception(
            "Error in extract_soft_skills"
        )
        raise

# Tools

def extract_tools(
    text: str,
) -> list[str]:
    try:
        return _extract_dictionary_matches(
            text,
            get_tools(),
        )

    except Exception:
        logger.exception(
            "Error in extract_tools"
        )
        raise

# Technologies

def extract_technologies(
    text: str,
) -> list[str]:
    try:
        _validate_text(text)

        return extract_skills_dictionary(
            text,
            get_technologies(),
        )

    except Exception:
        logger.exception(
            "Error in extract_technologies"
        )
        raise


# Must Have

def classify_must_have(
    text: str,
) -> list[str]:
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