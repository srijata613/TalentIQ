from __future__ import annotations

import logging
import re
from functools import lru_cache
from typing import Any, Final, Iterable, Sequence, TypedDict

from nltk.tokenize import sent_tokenize

from .config import DOMAIN_KEYWORDS
from src.knowledge_graph.services.taxonomy_service import (
    TaxonomyService,
)

# Configure logger
logger = logging.getLogger(__name__)

class SalaryRange(TypedDict):
    min: int
    max: int

# 1. Define the functions FIRST
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
        logger.exception("Error fetching technologies from taxonomy")
        raise


@lru_cache(maxsize=1)
def get_all_skills() -> list[str]:
    return sorted(
        set(
            get_technologies()
            + get_soft_skills()
        )
    )

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

SENIORITY_PATTERNS: Final[tuple[tuple[str, str], ...]] = (
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


CERTIFICATION_HEADERS: Final[tuple[str, ...]] = (
    "certifications",
    "certification",
    "certificate",
    "certificates",
    "licenses",
    "licenses & certifications",
    "professional certificates",
    "courses & certifications",
)

HIDDEN_REQUIREMENTS: Final[tuple[str, ...]] = (
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

UNIVERSITY_KEYWORDS: Final[tuple[str, ...]] = (
    "university",
    "institute",
    "college",
    "iit",
    "nit",
    "iiit",
)

COMPANY_SUFFIXES: Final[tuple[str, ...]] = (
    "inc",
    "ltd",
    "llc",
    "technologies",
    "systems",
    "solutions",
    "labs",
)

SECTION_STOP_HEADERS: Final[tuple[str, ...]] = (
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

CERTIFICATION_STOP_HEADERS: Final[tuple[str, ...]] = (
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


def _validate_text(text: Any) -> None:
    if not isinstance(text, str):
        logger.error(f"Validation failed: expected string, got {type(text).__name__}.")
        raise TypeError("text must be a string.")


def _normalize(text: str) -> str:
    _validate_text(text)
    return text.lower()


def _unique(items: Iterable[str]) -> list[str]:
    return list(dict.fromkeys(items))


def _contains(text: str, keyword: str) -> bool:
    try:
        return bool(
            re.search(
                rf"\b{re.escape(keyword)}\b",
                text,
            )
        )
    except re.error:
        logger.exception(f"Regex error while checking for keyword '{keyword}'")
        raise
    
WORD_PATTERN = re.compile(r"\b[a-zA-Z]{4,}\b")
INT_PATTERN = re.compile(r"\d+")

EXPERIENCE_PATTERNS = (
    re.compile(r"(\d+\+?\s*years?\s*experience)", re.IGNORECASE),
    re.compile(r"(\d+\+?\s*yrs?\s*experience)", re.IGNORECASE),
    re.compile(r"(\d+\+?\s*years?)", re.IGNORECASE),
    re.compile(r"(\d+\+?\s*yrs?)", re.IGNORECASE),
)

CGPA_PATTERNS = (
    re.compile(r"cgpa[: ]+(\d+\.\d+)", re.IGNORECASE),
    re.compile(r"gpa[: ]+(\d+\.\d+)", re.IGNORECASE),
    re.compile(r"(\d+\.\d+)\s*/\s*10", re.IGNORECASE),
)

BULLET_PATTERN = re.compile(
    r"^(\-|\*|•|✓|\d+\.)\s*"
)


def _find_matches(
    text: str,
    patterns: Sequence[re.Pattern[str]],
) -> list[str]:
    matches: list[str] = []
    for pattern in patterns:
        matches.extend(pattern.findall(text))
    return matches


def _extract_first_int(text: str) -> int:
    match = INT_PATTERN.search(text)
    return int(match.group()) if match else 0


def _extract_dictionary_matches(
    text: str,
    dictionary: Sequence[str],
) -> list[str]:
    text_lower = _normalize(text)
    return _unique([
        item for item in dictionary
        if _contains(text_lower, item.lower())
    ])


def _extract_lines_with_dictionary(
    text: str,
    dictionary: Sequence[str],
) -> list[str]:
    _validate_text(text)
    lines: list[str] = []
    for line in text.splitlines():
        lower = line.lower()
        if any(_contains(lower, item.lower()) for item in dictionary):
            lines.append(line.strip())
    return _unique(lines)

def _extract_section_skills(
    text: str,
    section_headers: Sequence[str],
    dictionary: Sequence[str] | None = None,
) -> list[str]:
    """
    Extract dictionary matches from a specific section.
    """
    section = extract_section(text, section_headers)
    return extract_skills_dictionary(section, dictionary)


def _extract_section_lines(
    text: str,
    section_headers: Sequence[str],
    *,
    bullet_only: bool = False,
) -> list[str]:
    """
    Extract cleaned lines from a section.
    """
    section = extract_section(text, section_headers)

    results: list[str] = []

    for line in section.splitlines():
        line = line.strip()

        if not line:
            continue

        if bullet_only:
            if not BULLET_PATTERN.match(line):
                continue

            line = BULLET_PATTERN.sub("", line)

        results.append(line)

    return _unique(results)

# Generic Skill Extraction

def extract_skills_dictionary(
    text: str,
    skill_list: Sequence[str] | None = None
) -> list[str]:
    """
    Dictionary-based skill extraction.
    """
    try:
        if skill_list is None:
            skill_list = get_all_skills()
        return _extract_dictionary_matches(text, skill_list)
    except Exception:
        logger.exception("Error in extract_skills_dictionary")
        raise


# Sentence Extraction

def extract_sentences(text: str) -> list[str]:
    """
    Extract meaningful sentences.
    """
    try:
        _validate_text(text)
        sentences = sent_tokenize(text)
        return [
            s.strip()
            for s in sentences
            if len(s.strip()) > MIN_SENTENCE_LENGTH
        ]
    except Exception:
        logger.exception("Error in extract_sentences")
        raise


# Experience Extraction

def extract_experience_requirement(text: str) -> str | None:
    try:
        text_lower = _normalize(text)
        matches = _find_matches(
            text_lower,
            EXPERIENCE_PATTERNS,
        )

        if not matches:
            return None

        return max(matches, key=_extract_first_int)
    except Exception:
        logger.exception("Error in extract_experience_requirement")
        raise


# Education Extraction

def extract_education_requirement(text: str) -> list[str]:
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
        logger.exception("Error in extract_education_requirement")
        raise


# Certification Extraction

def extract_certifications(text: str) -> list[str]:
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
                    certifications.append(line.strip())

        return _unique(certifications)
    except Exception:
        logger.exception("Error in extract_certifications")
        raise


# Preferred Skills

def extract_preferred_skills(text: str) -> list[str]:
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
        )
    except Exception:
        logger.exception("Error in extract_preferred_skills")
        raise


# Soft Skills

def extract_soft_skills(text: str) -> list[str]:
    try:
        return _extract_dictionary_matches(text, get_soft_skills())
    except Exception:
        logger.exception("Error in extract_soft_skills")
        raise


# Tools

def extract_tools(text: str) -> list[str]:
    try:
        return _extract_dictionary_matches(text, get_tools())
    except Exception:
        logger.exception("Error in extract_tools")
        raise


# Technologies

def extract_technologies(text: str) -> list[str]:
    try:
        _validate_text(text)
        return extract_skills_dictionary(
            text,
            get_technologies()
        )
    except Exception:
        logger.exception("Error in extract_technologies")
        raise


# Keywords

def extract_keywords(text: str) -> list[str]:
    try:
        text_lower = _normalize(text)
        words = WORD_PATTERN.findall(text_lower)

        stopwords = {
            "with", "from", "that", "this", "will", "must",
            "have", "your", "their", "into", "using", "used",
            "ability", "strong", "candidate", "required",
            "preferred", "experience",
        }

        freq: dict[str, int] = {}
        for word in words:
            if word in stopwords:
                continue
            freq[word] = freq.get(word, 0) + 1

        sorted_words = sorted(
            freq.items(),
            key=lambda x: x[1],
            reverse=True
        )

        return [
            word for word, _ in sorted_words[:MAX_KEYWORDS]
        ]
    except Exception:
        logger.exception("Error in extract_keywords")
        raise


# Seniority

def extract_seniority(text: str) -> str | None:
    try:
        _validate_text(text)
        lines = text.splitlines()
        title_area = " ".join(lines[:TITLE_SCAN_LINES]).lower()

        for level, pattern in SENIORITY_PATTERNS:
            if re.search(pattern, title_area):
                return level
        return None
    except Exception:
        logger.exception("Error in extract_seniority")
        raise


# Industry

def extract_industry(text: str) -> str | None:
    try:
        matches = _extract_dictionary_matches(text, INDUSTRIES)
        return matches[0] if matches else None
    except Exception:
        logger.exception("Error in extract_industry")
        raise


# Domain

def extract_domain(text: str) -> str | None:
    try:
        text_lower = _normalize(text)
        scores: dict[str, int] = {}

        for domain, keywords in DOMAIN_KEYWORDS.items():
            score = sum(1 for kw in keywords if _contains(text_lower, kw.lower()))
            scores[domain] = score

        if not scores:
            return None

        best_domain = max(scores, key=scores.get)
        return best_domain if scores[best_domain] > 0 else None
    except Exception:
        logger.exception("Error in extract_domain")
        raise


# Responsibilities

def extract_responsibilities(text: str) -> list[str]:
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
        logger.exception("Error in extract_responsibilities")
        raise


# Must Have

def classify_must_have(text: str) -> list[str]:
    try:
        _validate_text(text)
        return _extract_section_skills(
            text,
            (
                "required qualifications",
                "requirements",
                "must have",
            ),
        )
    except Exception:
        logger.exception("Error in classify_must_have")
        raise


# Nice To Have

def classify_nice_to_have(text: str) -> list[str]:
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
        )
    except Exception:
        logger.exception("Error in classify_nice_to_have")
        raise


# Readability

def readability_score(text: str) -> float:
    try:
        _validate_text(text)
        words = len(text.split())
        sentences = max(len(sent_tokenize(text)), 1)
        avg_words = words / sentences

        score = max(
            0,
            min(100, 100 - avg_words)
        )
        return round(score, 2)
    except Exception:
        logger.exception("Error in readability_score")
        raise


def extract_section(text: str, section_keywords: Sequence[str]) -> str:
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


# Detect duplicate requirements

def detect_duplicate_requirements(skills: Iterable[str]) -> list[str]:
    if not isinstance(skills, (list, tuple, set)):
        logger.error(f"detect_duplicate_requirements expected collection, got {type(skills).__name__}")
        raise TypeError("skills must be a collection of strings.")

    try:
        seen: set[str] = set()
        duplicates: list[str] = []

        for skill in skills:
            if skill in seen:
                duplicates.append(skill)
            seen.add(skill)
            
        return _unique(duplicates)
    except Exception:
        logger.exception("Error in detect_duplicate_requirements")
        raise


# Missing qualifications

def detect_missing_requirements(
    experience: Any,
    education: Any,
    skills: Any
) -> list[str]:
    missing: list[str] = []
    if not experience:
        missing.append("experience requirement")
    if not education:
        missing.append("education requirement")
    if not skills:
        missing.append("skill requirement")
    return missing


# Hidden requirements

def detect_hidden_requirements(text: str) -> list[str]:
    try:
        return _extract_dictionary_matches(text, HIDDEN_REQUIREMENTS)
    except Exception:
        logger.exception("Error in detect_hidden_requirements")
        raise


def extract_semantic_requirements(text: str) -> list[str]:
    try:
        _validate_text(text)
        sentences = sent_tokenize(text)
        semantic = []

        patterns = (
            "build", "design", "develop", "deploy",
            "maintain", "lead", "optimize", "architect",
        )

        for sentence in sentences:
            lower = sentence.lower()
            if any(_contains(lower, pattern) for pattern in patterns):
                semantic.append(sentence.strip())

        return semantic[:MAX_SEMANTIC_RESULTS]
    except Exception:
        logger.exception("Error in extract_semantic_requirements")
        raise


def benchmark_salary(seniority: str | None) -> SalaryRange | None:
    ranges: dict[str, SalaryRange] = {
        "intern": {"min": 0, "max": 5},
        "junior": {"min": 5, "max": 12},
        "associate": {"min": 8, "max": 15},
        "mid": {"min": 12, "max": 25},
        "senior": {"min": 25, "max": 50},
        "lead": {"min": 40, "max": 70},
        "manager": {"min": 50, "max": 90},
        "director": {"min": 80, "max": 150},
    }
    return ranges.get(seniority) if seniority else None


def detect_skill_gaps(technologies: Iterable[str]) -> list[str]:
    if not isinstance(technologies, (list, tuple, set)):
        logger.error(f"detect_skill_gaps expected collection, got {type(technologies).__name__}")
        raise TypeError("technologies must be a collection of strings.")

    try:
        gaps: list[str] = []
        cloud: Final[set[str]] = {"aws", "azure", "gcp"}
        databases: Final[set[str]] = {"sql", "postgresql", "mysql", "mongodb", "snowflake"}
        tech_set = set(technologies)

        if not tech_set.intersection(cloud):
            gaps.append("No cloud platform specified")

        if not tech_set.intersection(databases):
            gaps.append("No database technology specified")
            
        return gaps
    except Exception:
        logger.exception("Error in detect_skill_gaps")
        raise


def extract_location(text: str) -> str | None:
    try:
        _validate_text(text)
        lines = text.splitlines()

        for line in lines[:10]:
            if "," in line:
                if len(line.split()) <= MAX_LOCATION_WORDS:
                    return line.strip()
        return None
    except Exception:
        logger.exception("Error in extract_location")
        raise


def extract_universities(text: str) -> list[str]:
    try:
        return _extract_lines_with_dictionary(text, UNIVERSITY_KEYWORDS)
    except Exception:
        logger.exception("Error in extract_universities")
        raise


def extract_cgpa(text: str) -> float | None:
    try:
        _validate_text(text)
        for pattern in CGPA_PATTERNS:
            match = pattern.search(text)
            if match:
                return float(match.group(1))
        return None
    except Exception:
        logger.exception("Error in extract_cgpa")
        raise


def extract_companies(text: str) -> list[str]:
    try:
        return _extract_lines_with_dictionary(text, COMPANY_SUFFIXES)
    except Exception:
        logger.exception("Error in extract_companies")
        raise


def extract_leadership_signals(text: str) -> list[str]:
    try:
        leadership_terms = (
            "lead", "led", "leadership",
            "mentor", "managed", "owner",
        )
        return _extract_dictionary_matches(text, leadership_terms)
    except Exception:
        logger.exception("Error in extract_leadership_signals")
        raise