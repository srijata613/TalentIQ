from __future__ import annotations

import logging
from typing import Any, Final, Iterable

from nltk.tokenize import sent_tokenize

from .core import (
    HIDDEN_REQUIREMENTS,
    MAX_SEMANTIC_RESULTS,
    MIN_SENTENCE_LENGTH,
    _contains,
    _extract_dictionary_matches,
    _unique,
    _validate_text,
)

logger = logging.getLogger(__name__)

# Sentence Extraction
def extract_sentences(
    text: str,
) -> list[str]:
    """
    Extract meaningful sentences from text.
    """
    try:
        _validate_text(text)

        return [
            sentence.strip()
            for sentence in sent_tokenize(text)
            if len(sentence.strip()) > MIN_SENTENCE_LENGTH
        ]

    except Exception:
        logger.exception(
            "Error in extract_sentences"
        )
        raise

# Readability
def readability_score(
    text: str,
) -> float:
    """
    Compute a simple readability score.
    """
    try:
        _validate_text(text)

        words = len(text.split())
        sentences = max(
            len(sent_tokenize(text)),
            1,
        )

        average_words = words / sentences

        score = max(
            0,
            min(
                100,
                100 - average_words,
            ),
        )

        return round(score, 2)

    except Exception:
        logger.exception(
            "Error in readability_score"
        )
        raise

# Duplicate Requirements
def detect_duplicate_requirements(
    skills: Iterable[str],
) -> list[str]:
    """
    Detect duplicate skill requirements.
    """
    if not isinstance(
        skills,
        (list, tuple, set),
    ):
        logger.error(
            "detect_duplicate_requirements expected collection, got %s",
            type(skills).__name__,
        )
        raise TypeError(
            "skills must be a collection of strings."
        )

    try:
        seen: set[str] = set()
        duplicates: list[str] = []

        for skill in skills:

            if skill in seen:
                duplicates.append(skill)

            seen.add(skill)

        return _unique(duplicates)

    except Exception:
        logger.exception(
            "Error in detect_duplicate_requirements"
        )
        raise

# Missing Requirements
def detect_missing_requirements(
    experience: Any,
    education: Any,
    skills: Any,
) -> list[str]:
    """
    Detect missing core job requirements.
    """
    missing: list[str] = []

    if not experience:
        missing.append(
            "experience requirement"
        )

    if not education:
        missing.append(
            "education requirement"
        )

    if not skills:
        missing.append(
            "skill requirement"
        )

    return missing

# Hidden Requirements
def detect_hidden_requirements(
    text: str,
) -> list[str]:
    """
    Detect implicit requirements.
    """
    try:
        return _extract_dictionary_matches(
            text,
            HIDDEN_REQUIREMENTS,
        )

    except Exception:
        logger.exception(
            "Error in detect_hidden_requirements"
        )
        raise

# Semantic Requirements
def extract_semantic_requirements(
    text: str,
) -> list[str]:
    """
    Extract action-oriented requirement sentences.
    """
    try:
        _validate_text(text)

        patterns = (
            "build",
            "design",
            "develop",
            "deploy",
            "maintain",
            "lead",
            "optimize",
            "architect",
        )

        semantic: list[str] = []

        for sentence in sent_tokenize(text):

            lower = sentence.lower()

            if any(
                _contains(lower, pattern)
                for pattern in patterns
            ):
                semantic.append(
                    sentence.strip()
                )

        return semantic[
            :MAX_SEMANTIC_RESULTS
        ]

    except Exception:
        logger.exception(
            "Error in extract_semantic_requirements"
        )
        raise

# Skill Gaps
def detect_skill_gaps(
    technologies: Iterable[str],
) -> list[str]:
    """
    Detect missing foundational technologies.
    """
    if not isinstance(
        technologies,
        (list, tuple, set),
    ):
        logger.error(
            "detect_skill_gaps expected collection, got %s",
            type(technologies).__name__,
        )
        raise TypeError(
            "technologies must be a collection of strings."
        )

    try:
        cloud: Final[set[str]] = {
            "aws",
            "azure",
            "gcp",
        }

        databases: Final[set[str]] = {
            "sql",
            "postgresql",
            "mysql",
            "mongodb",
            "snowflake",
        }

        technology_set = set(technologies)

        gaps: list[str] = []

        if not technology_set.intersection(cloud):
            gaps.append(
                "No cloud platform specified"
            )

        if not technology_set.intersection(databases):
            gaps.append(
                "No database technology specified"
            )

        return gaps

    except Exception:
        logger.exception(
            "Error in detect_skill_gaps"
        )
        raise