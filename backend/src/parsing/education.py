from __future__ import annotations

import logging
import re
from typing import Final

from .core import (
    CERTIFICATION_HEADERS,
    CERTIFICATION_STOP_HEADERS,
    CGPA_PATTERNS,
    UNIVERSITY_KEYWORDS,
    _extract_lines_with_dictionary,
    _unique,
    _normalize,
    _validate_text,
)

logger = logging.getLogger(__name__)

# Education Extraction
def extract_education_requirement(
    text: str,
) -> list[str]:
    """
    Extract education requirements from a job description.
    """
    try:
        text_lower = _normalize(text)

        education_patterns: Final[tuple[str, ...]] = (
            r"bachelor'?s degree",
            r"master'?s degree",
            r"phd",
            r"b\.tech",
            r"m\.tech",
            r"computer science",
        )

        matches: list[str] = []

        for pattern in education_patterns:
            if re.search(pattern, text_lower):
                matches.append(pattern)

        return matches

    except Exception:
        logger.exception(
            "Error in extract_education_requirement"
        )
        raise

# Certifications
def extract_certifications(
    text: str,
) -> list[str]:
    """
    Extract certification requirements from a job description.
    """
    try:
        _validate_text(text)

        lines = text.splitlines()

        certifications: list[str] = []

        collecting = False

        for line in lines:

            line_lower = line.lower().strip()

            if (
                not collecting
                and any(
                    header in line_lower
                    for header in CERTIFICATION_HEADERS
                )
            ):
                collecting = True
                continue

            if collecting:

                if any(
                    line_lower.startswith(header)
                    for header in CERTIFICATION_STOP_HEADERS
                ):
                    break

                if line.strip():
                    certifications.append(
                        line.strip()
                    )

        return _unique(certifications)

    except Exception:
        logger.exception(
            "Error in extract_certifications"
        )
        raise


# Universities
def extract_universities(
    text: str,
) -> list[str]:
    """
    Extract university names from text.
    """
    try:
        return _extract_lines_with_dictionary(
            text,
            UNIVERSITY_KEYWORDS,
        )

    except Exception:
        logger.exception(
            "Error in extract_universities"
        )
        raise

# CGPA
def extract_cgpa(
    text: str,
) -> float | None:
    """
    Extract CGPA/GPA from text.
    """
    try:
        _validate_text(text)

        for pattern in CGPA_PATTERNS:

            match = pattern.search(text)

            if match:
                return float(
                    match.group(1)
                )

        return None

    except Exception:
        logger.exception(
            "Error in extract_cgpa"
        )
        raise