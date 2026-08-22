from __future__ import annotations

import logging
import re

from .core import (
    EXPERIENCE_PATTERNS,
    SENIORITY_PATTERNS,
    TITLE_SCAN_LINES,
    SalaryRange,
    _extract_first_int,
    _find_matches,
    _normalize,
    _validate_text,
)

logger = logging.getLogger(__name__)

# Experience Extraction

def extract_experience_requirement(
    text: str,
) -> str | None:
    """
    Extract the highest experience requirement mentioned in the text.
    """
    try:
        text_lower = _normalize(text)

        matches = _find_matches(
            text_lower,
            EXPERIENCE_PATTERNS,
        )

        if not matches:
            return None

        return max(
            matches,
            key=_extract_first_int,
        )

    except Exception:
        logger.exception(
            "Error in extract_experience_requirement"
        )
        raise


# Seniority
def extract_seniority(
    text: str,
) -> str | None:
    """
    Detect the seniority level from the job title.
    """
    try:
        _validate_text(text)

        lines = text.splitlines()

        title_area = " ".join(
            lines[:TITLE_SCAN_LINES]
        ).lower()

        for level, pattern in SENIORITY_PATTERNS:
            if re.search(
                pattern,
                title_area,
            ):
                return level

        return None

    except Exception:
        logger.exception(
            "Error in extract_seniority"
        )
        raise

# Salary Benchmark

def benchmark_salary(
    seniority: str | None,
) -> SalaryRange | None:
    """
    Return an estimated salary range (LPA)
    based on the detected seniority.
    """

    ranges: dict[str, SalaryRange] = {
        "intern": {
            "min": 0,
            "max": 5,
        },
        "junior": {
            "min": 5,
            "max": 12,
        },
        "associate": {
            "min": 8,
            "max": 15,
        },
        "mid": {
            "min": 12,
            "max": 25,
        },
        "senior": {
            "min": 25,
            "max": 50,
        },
        "lead": {
            "min": 40,
            "max": 70,
        },
        "manager": {
            "min": 50,
            "max": 90,
        },
        "director": {
            "min": 80,
            "max": 150,
        },
    }

    return (
        ranges.get(seniority)
        if seniority
        else None
    )