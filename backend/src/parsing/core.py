from __future__ import annotations

import logging
import re
from functools import lru_cache
from typing import Any, Final, Iterable, Sequence, TypedDict

from src.knowledge_graph.services.taxonomy_service import (
    TaxonomyService,
)
from collections.abc import Callable
logger = logging.getLogger(__name__)


class SalaryRange(TypedDict):
    min: int
    max: int

# Taxonomy

@lru_cache(maxsize=1)
def get_taxonomy() -> TaxonomyService:
    """
    Lazily initialize the taxonomy service.
    """
    try:
        return TaxonomyService()
    except Exception:
        logger.exception("Failed to initialize TaxonomyService")
        raise


@lru_cache(maxsize=1)
def get_soft_skills() -> list[str]:
    return get_taxonomy().get_category("soft_skills")


@lru_cache(maxsize=1)
def get_tools() -> list[str]:
    return get_taxonomy().get_category("tools")


@lru_cache(maxsize=1)
def get_technologies() -> list[str]:
    try:
        taxonomy = get_taxonomy()

        return (
            taxonomy.get_category("programming")
            + taxonomy.get_category("frontend")
            + taxonomy.get_category("backend")
            + taxonomy.get_category("database")
            + taxonomy.get_category("cloud")
            + taxonomy.get_category("devops")
            + taxonomy.get_category("ml_ai")
        )

    except Exception:
        logger.exception(
            "Error fetching technologies from taxonomy"
        )
        raise


@lru_cache(maxsize=1)
def get_all_skills() -> list[str]:
    return sorted(
        set(
            get_technologies()
            + get_soft_skills()
        )
    )


# Constants

INDUSTRIES: Final[tuple[str, ...]] = (
    "healthcare",
    "finance",
    "banking",
    "insurance",
    "education",
    "retail",
    "ecommerce",
    "aerospace",
    "manufacturing",
)

SENIORITY_PATTERNS: Final[
    tuple[tuple[str, str], ...]
] = (
    ("principal", r"\bprincipal\b"),
    ("director", r"\bdirector\b"),
    ("manager", r"\bmanager\b"),
    ("lead", r"\blead\b"),
    ("senior", r"\bsenior\b"),
    ("mid", r"\bmid(?:\s|-)?level\b|\bmid\b"),
    ("associate", r"\bassociate\b"),
    ("junior", r"\bjunior\b"),
    ("intern", r"\bintern\b"),
)

CERTIFICATION_HEADERS: Final[
    tuple[str, ...]
] = (
    "certifications",
    "certification",
    "certificate",
    "certificates",
    "licenses",
    "licenses & certifications",
    "professional certificates",
    "courses & certifications",
)

HIDDEN_REQUIREMENTS: Final[
    tuple[str, ...]
] = (
    "ownership",
    "initiative",
    "stakeholder management",
    "leadership",
    "mentoring",
    "presentation",
    "self starter",
    "self-starter",
    "cross functional",
    "client facing",
    "adaptability",
)

UNIVERSITY_KEYWORDS: Final[
    tuple[str, ...]
] = (
    "university",
    "institute",
    "college",
    "iit",
    "nit",
    "iiit",
)

COMPANY_SUFFIXES: Final[
    tuple[str, ...]
] = (
    "inc",
    "ltd",
    "llc",
    "technologies",
    "systems",
    "solutions",
    "labs",
)

SECTION_STOP_HEADERS: Final[
    tuple[str, ...]
] = (
    "job responsibilities",
    "required qualifications",
    "requirements",
    "must have",
    "preferred qualifications",
    "preferred",
    "industry",
    "soft skills",
    "responsibilities",
    "required certifications",
)

CERTIFICATION_STOP_HEADERS: Final[
    tuple[str, ...]
] = (
    "responsibilities",
    "requirements",
    "required qualifications",
    "preferred qualifications",
    "education",
    "experience",
    "skills",
    "industry",
)

MIN_SENTENCE_LENGTH: Final[int] = 20
TITLE_SCAN_LINES: Final[int] = 5
MAX_KEYWORDS: Final[int] = 20
MAX_SEMANTIC_RESULTS: Final[int] = 10
MAX_LOCATION_WORDS: Final[int] = 8


# Validation Helpers
def _validate_text(text: Any) -> None:
    if not isinstance(text, str):
        logger.error(
            "Validation failed: expected string, got %s.",
            type(text).__name__,
        )
        raise TypeError("text must be a string.")


def _normalize(text: str) -> str:
    _validate_text(text)
    return text.lower()


def _unique(items: Iterable[str]) -> list[str]:
    return list(dict.fromkeys(items))


def _contains(
    text: str,
    keyword: str,
) -> bool:
    try:
        return bool(
            re.search(
                rf"\b{re.escape(keyword)}\b",
                text,
            )
        )

    except re.error:
        logger.exception(
            "Regex error while checking keyword '%s'",
            keyword,
        )
        raise


# Compiled Regex

WORD_PATTERN: Final[re.Pattern[str]] = re.compile(
    r"\b[a-zA-Z]{4,}\b"
)

INT_PATTERN: Final[re.Pattern[str]] = re.compile(
    r"\d+"
)

EXPERIENCE_PATTERNS: Final[
    tuple[re.Pattern[str], ...]
] = (
    re.compile(
        r"(\d+\+?\s*years?\s*experience)",
        re.IGNORECASE,
    ),
    re.compile(
        r"(\d+\+?\s*yrs?\s*experience)",
        re.IGNORECASE,
    ),
    re.compile(
        r"(\d+\+?\s*years?)",
        re.IGNORECASE,
    ),
    re.compile(
        r"(\d+\+?\s*yrs?)",
        re.IGNORECASE,
    ),
)

CGPA_PATTERNS: Final[
    tuple[re.Pattern[str], ...]
] = (
    re.compile(
        r"cgpa[: ]+(\d+\.\d+)",
        re.IGNORECASE,
    ),
    re.compile(
        r"gpa[: ]+(\d+\.\d+)",
        re.IGNORECASE,
    ),
    re.compile(
        r"(\d+\.\d+)\s*/\s*10",
        re.IGNORECASE,
    ),
)

BULLET_PATTERN: Final[re.Pattern[str]] = re.compile(
    r"^(\-|\*|•|✓|\d+\.)\s*"
)


# Generic Helpers
def _find_matches(
    text: str,
    patterns: Sequence[re.Pattern[str]],
) -> list[str]:

    matches: list[str] = []

    for pattern in patterns:
        matches.extend(pattern.findall(text))

    return matches


def _extract_first_int(
    text: str,
) -> int:

    match = INT_PATTERN.search(text)

    return int(match.group()) if match else 0


def _extract_dictionary_matches(
    text: str,
    dictionary: Sequence[str],
) -> list[str]:

    text_lower = _normalize(text)

    return _unique(
        [
            item
            for item in dictionary
            if _contains(
                text_lower,
                item.lower(),
            )
        ]
    )


def _extract_lines_with_dictionary(
    text: str,
    dictionary: Sequence[str],
) -> list[str]:

    _validate_text(text)

    lines: list[str] = []

    for line in text.splitlines():

        lower = line.lower()

        if any(
            _contains(
                lower,
                item.lower(),
            )
            for item in dictionary
        ):
            lines.append(
                line.strip()
            )

    return _unique(lines)

# Section Extraction
def extract_section(
    text: str,
    section_keywords: Sequence[str],
) -> str:
    """
    Extract the contents of a logical section from text.

    Collection starts after the first matching section header and
    stops when another known section header is encountered.
    """
    try:
        _validate_text(text)

        lines = text.splitlines()

        collecting = False
        collected: list[str] = []

        for line in lines:
            line_lower = line.lower().strip()

            if (
                not collecting
                and any(
                    keyword in line_lower
                    for keyword in section_keywords
                )
            ):
                collecting = True
                continue

            if collecting:
                if any(
                    line_lower.startswith(header)
                    for header in SECTION_STOP_HEADERS
                ):
                    break

                collected.append(line)

        return "\n".join(collected)

    except Exception:
        logger.exception("Error in extract_section")
        raise

# Generic Section Helpers

def _extract_section_skills(
    text: str,
    section_headers: Sequence[str],
    extractor: Callable[[str, Sequence[str] | None], list[str]],
    dictionary: Sequence[str] | None = None,
) -> list[str]:
    """
    Generic helper used by skills.py.

    The extractor argument is injected by the caller to avoid
    circular imports between core.py and skills.py.
    """
    section = extract_section(
        text,
        section_headers,
    )

    return extractor(
        section,
        dictionary,
    )


def _extract_section_lines(
    text: str,
    section_headers: Sequence[str],
    *,
    bullet_only: bool = False,
) -> list[str]:
    """
    Extract cleaned lines from a section.

    Optionally strips common bullet prefixes.
    """
    section = extract_section(
        text,
        section_headers,
    )

    results: list[str] = []

    for line in section.splitlines():

        line = line.strip()

        if not line:
            continue

        if bullet_only:

            if not BULLET_PATTERN.match(line):
                continue

            line = BULLET_PATTERN.sub(
                "",
                line,
            )

        results.append(line)

    return _unique(results)