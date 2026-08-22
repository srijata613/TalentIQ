import logging
import os
import re
from typing import Iterable, List, Optional

from .parsing import (
    get_all_skills,
    extract_skills_dictionary,
)
from src.llm.parser import parse_resume_with_llm

logger = logging.getLogger(__name__)

EMAIL_REGEX = re.compile(
    r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
    re.IGNORECASE,
)

PHONE_REGEX = re.compile(
    r"(\+?\d[\d\s\-()]{8,}\d)",
    re.IGNORECASE,
)

LINKEDIN_REGEX = re.compile(
    r"https?://(?:www\.)?linkedin\.com/in/[^\s]+",
    re.IGNORECASE,
)

GITHUB_REGEX = re.compile(
    r"https?://(?:www\.)?github\.com/[^\s]+",
    re.IGNORECASE,
)

PORTFOLIO_REGEX = re.compile(
    r"https?://(?:www\.)?(?!linkedin\.com)(?!github\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}[^\s]*",
    re.IGNORECASE,
)

YEAR_REGEX = re.compile(
    r"\b(?:19|20)\d{2}\b"
)

CGPA_REGEX = re.compile(
    r"(?:cgpa|gpa)\s*[:\-]?\s*(\d+(?:\.\d+)?)",
    re.IGNORECASE,
)

EXPERIENCE_REGEX = re.compile(
    r"(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yoe)\+?",
    re.IGNORECASE,
)

UNIVERSITY_KEYWORDS = (
    "university",
    "institute",
    "college",
    "iit",
    "nit",
)

COMPANY_KEYWORDS = (
    "google",
    "microsoft",
    "amazon",
    "meta",
    "openai",
    "infosys",
    "tcs",
    "wipro",
    "accenture",
    "ibm",
    "oracle",
    "salesforce",
    "adobe",
    "nvidia",
    "intel",
    "capgemini",
    "cognizant",
    "hcl",
)

LEADERSHIP_KEYWORDS = (
    "led",
    "lead",
    "managed",
    "mentored",
    "owner",
    "ownership",
    "team lead",
    "coordinated",
)

DEGREE_PATTERNS = (
    "b.tech",
    "bachelor",
    "b.e",
    "b.sc",
    "bca",
    "m.tech",
    "master",
    "msc",
    "mca",
    "mba",
    "phd",
)

DESIGNATIONS = (
    "software engineer",
    "machine learning engineer",
    "data scientist",
    "ai engineer",
    "backend developer",
    "frontend developer",
    "full stack developer",
    "developer",
    "intern",
    "research intern",
    "research assistant",
    "data analyst",
)

PROJECT_KEYWORDS = (
    "project",
    "projects",
    "developed",
    "built",
    "created",
    "implemented",
)

CERTIFICATION_KEYWORDS = (
    "certification",
    "certificate",
    "coursera",
    "udemy",
    "forage",
    "aws certification",
)

ACHIEVEMENT_KEYWORDS = (
    "award",
    "winner",
    "rank",
    "scholarship",
    "achievement",
    "recognition",
)

IMPACT_KEYWORDS = (
    "%",
    "improved",
    "increased",
    "reduced",
    "saved",
    "optimized",
)

PUBLICATION_KEYWORDS = (
    "publication",
    "paper",
    "research",
    "journal",
    "conference",
    "ieee",
    "springer",
)

OPEN_SOURCE_KEYWORDS = (
    "open source",
    "github contributor",
    "contributor",
    "maintainer",
    "pull request",
)

IGNORE_HEADERS = {
    "summary",
    "professional summary",
    "experience",
    "education",
    "skills",
    "projects",
    "project",
    "certifications",
    "certification",
    "achievements",
    "achievement",
    "open source",
    "publications",
    "publication",
    "github",
}

USE_LLM = os.getenv("USE_LLM", "false").strip().lower() == "true"

def unique(items: Iterable[str]) -> List[str]:
    """Return unique items while preserving insertion order."""
    return list(dict.fromkeys(items))


def extract_projects(lines: List[str]) -> List[str]:
    """Extract probable project names from resume."""

    try:
        projects: List[str] = []

        for line in lines:
            line = line.strip()

            if not line:
                continue

            lower = line.lower()

            if lower in IGNORE_HEADERS:
                continue

            if any(
                re.search(
                    rf"\b{re.escape(keyword)}\b",
                    lower,
                )
                for keyword in PROJECT_KEYWORDS
            ):
                continue

            if lower in DESIGNATIONS:
                continue
            
            if (
                2 <= len(line.split()) <= 8
                and line[0].isupper()
            ):
                projects.append(line)

        return unique(projects)

    except Exception:
        logger.exception("Failed to extract projects.")
        return []


def extract_certifications(lines: List[str]) -> List[str]:
    """Extract certifications from resume."""

    try:
        certifications: List[str] = []

        for line in lines:
            line = line.strip()

            if not line:
                continue

            lower = line.lower()

            if lower in IGNORE_HEADERS:
                continue

            if any(
                re.search(
                    rf"\b{re.escape(keyword)}\b",
                    lower,
                )
                for keyword in CERTIFICATION_KEYWORDS
            ):
                certifications.append(line)

            elif re.search(
                r"\bcertified\b",
                lower,
                re.IGNORECASE,
            ):
                certifications.append(line)

        return unique(certifications)

    except Exception:
        logger.exception("Failed to extract certifications.")
        return []


def extract_achievements(lines: List[str]) -> List[str]:
    """Extract achievements from resume."""

    try:
        achievements: List[str] = []

        for line in lines:
            line = line.strip()

            if not line:
                continue

            lower = line.lower()

            if lower in IGNORE_HEADERS:
                continue

            if any(
                re.search(
                    rf"\b{re.escape(keyword)}\b",
                    lower,
                )
                for keyword in ACHIEVEMENT_KEYWORDS
            ):
                achievements.append(line)

        return unique(achievements)

    except Exception:
        logger.exception("Failed to extract achievements.")
        return []


def extract_summary(lines: List[str]) -> Optional[str]:
    """Extract professional summary."""

    try:
        summary_started = False
        summary: List[str] = []

        for line in lines:
            lower = line.lower().strip()

            if re.search(
                r"\bsummary\b",
                lower,
                re.IGNORECASE,
            ):
                summary_started = True
                continue

            if not summary_started:
                continue

            if re.fullmatch(
                r"(professional\s+)?(experience|education|projects|skills|certifications):?",
                lower,
            ):
                break

            if line.strip():
                summary.append(line.strip())

        return " ".join(summary) if summary else None

    except Exception:
        logger.exception("Failed to extract summary.")
        return None


def extract_experience_years(text: str) -> float:
    """Extract the highest experience value from resume."""

    try:
        matches = EXPERIENCE_REGEX.findall(text)

        if not matches:
            return 0.0

        return max(float(year) for year in matches)

    except Exception:
        logger.exception("Failed to extract experience.")
        return 0.0


def extract_location(lines: List[str]) -> Optional[str]:
    """Extract probable candidate location."""

    try:
        for line in lines[:10]:
            line = line.strip()

            if (
                "," in line
                and len(line.split()) <= 8
            ):
                return line

        return None

    except Exception:
        logger.exception("Failed to extract location.")
        return None


def extract_universities(lines: List[str]) -> List[str]:
    """Extract university names."""

    try:
        universities: List[str] = []

        for line in lines:
            lower = line.lower()

            if any(
                re.search(
                    rf"\b{re.escape(keyword)}\b",
                    lower,
                )
                for keyword in UNIVERSITY_KEYWORDS
            ):
                universities.append(line.strip())

        return unique(universities)

    except Exception:
        logger.exception("Failed to extract universities.")
        return []


def extract_cgpa(text: str) -> Optional[float]:
    """Extract candidate CGPA/GPA."""

    try:
        match = CGPA_REGEX.search(text)

        if not match:
            return None

        cgpa = float(match.group(1))

        if 0 <= cgpa <= 10:
            return cgpa

        return None

    except Exception:
        logger.exception("Failed to extract CGPA.")
        return None


def extract_companies(text: str) -> List[str]:
    """Extract company names from resume."""

    try:
        companies: List[str] = []

        company_suffixes = (
            "pvt ltd",
            "private limited",
            "limited",
            "ltd",
            "inc",
            "llc",
            "technologies",
            "technology",
            "solutions",
            "solution",
            "systems",
            "labs",
            "corp",
            "corporation",
        )

        for line in text.splitlines():
            stripped = line.strip()

            if not stripped:
                continue

            lower = stripped.lower()

            if any(
                re.search(
                    rf"\b{re.escape(suffix)}\b",
                    lower,
                )
                for suffix in company_suffixes
            ):
                companies.append(stripped)

        lower_text = text.lower()

        for company in COMPANY_KEYWORDS:
            if re.search(
                rf"\b{re.escape(company)}\b",
                lower_text,
            ):
                companies.append(company.title())

        return unique(companies)

    except Exception:
        logger.exception("Failed to extract companies.")
        return []


def extract_leadership_signals(text: str) -> List[str]:
    """Extract leadership-related statements."""

    try:
        signals: List[str] = []

        for line in text.splitlines():
            lower = line.lower()

            if any(
                re.search(
                    rf"\b{re.escape(keyword)}\b",
                    lower,
                )
                for keyword in LEADERSHIP_KEYWORDS
            ):
                signals.append(line.strip())

        return unique(signals)

    except Exception:
        logger.exception("Failed to extract leadership signals.")
        return []


def extract_project_impacts(lines: List[str]) -> List[str]:
    """Extract measurable project impact statements."""

    try:
        impacts: List[str] = []

        for line in lines:
            lower = line.lower()

            if (
                "%" in lower
                or any(
                    re.search(
                        rf"\b{re.escape(keyword)}\b",
                        lower,
                    )
                    for keyword in IMPACT_KEYWORDS
                    if keyword != "%"
                )
            ):
                impacts.append(line.strip())

        return unique(impacts)

    except Exception:
        logger.exception("Failed to extract project impacts.")
        return []
    

def extract_publications(lines: List[str]) -> List[str]:
    """Extract publications, journals, conference papers, and research."""

    try:
        publications: List[str] = []

        for line in lines:
            line = line.strip()

            if not line:
                continue

            lower = line.lower()

            if any(
                re.search(
                    rf"\b{re.escape(keyword)}\b",
                    lower,
                )
                for keyword in PUBLICATION_KEYWORDS
            ):
                publications.append(line)

        return unique(publications)

    except Exception:
        logger.exception("Failed to extract publications.")
        return []


def extract_open_source(lines: List[str]) -> List[str]:
    """Extract open-source contributions and GitHub activities."""

    try:
        results: List[str] = []

        for line in lines:
            line = line.strip()

            if not line:
                continue

            lower = line.lower()

            if lower in IGNORE_HEADERS:
                continue

            if any(
                re.search(
                    rf"\b{re.escape(keyword)}\b",
                    lower,
                )
                for keyword in OPEN_SOURCE_KEYWORDS
            ):
                results.append(line)

        return unique(results)

    except Exception:
        logger.exception("Failed to extract open-source contributions.")
        return []
    
def extract_name(lines: List[str]) -> Optional[str]:
    """Extract candidate name from the first few lines."""

    try:
        ignored = {
            "resume",
            "curriculum vitae",
            "cv",
            "software engineer",
            "backend developer",
            "frontend developer",
        }

        for line in lines[:5]:
            value = line.strip()

            if (
                2 <= len(value.split()) <= 4
                and value.lower() not in ignored
                and not EMAIL_REGEX.search(value)
                and not PHONE_REGEX.search(value)
            ):
                return value

        return None

    except Exception:
        logger.exception("Failed to extract candidate name.")
        return None


def parse_resume(
    text: str,
    use_llm: bool = USE_LLM,
) -> dict:
    """Parse resume using LLM (optional) with regex fallback."""

    if not text or not text.strip():
        raise ValueError("Resume text cannot be empty.")

    try:
        if use_llm:
            try:
                candidate = parse_resume_with_llm(text)

                if candidate.get("parsed_name"):
                    return candidate

                logger.warning(
                    "LLM could not extract candidate name. Falling back to rule-based parser."
                )

            except Exception:
                logger.exception("LLM parsing failed. Using fallback parser.")

        text_lower = text.lower()

        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        # ---------------- Contact ----------------

        email_match = EMAIL_REGEX.search(text)
        phone_match = PHONE_REGEX.search(text)
        linkedin_match = LINKEDIN_REGEX.search(text)
        github_match = GITHUB_REGEX.search(text)
        portfolio_match = PORTFOLIO_REGEX.search(text)

        # ---------------- Basic ----------------

        name = extract_name(lines)

        skills = extract_skills_dictionary(
            text,
            get_all_skills(),
        )

        projects = extract_projects(lines)
        certifications = extract_certifications(lines)
        achievements = extract_achievements(lines)
        summary = extract_summary(lines)

        experience_years = extract_experience_years(text)

        location = extract_location(lines)
        universities = extract_universities(lines)
        cgpa = extract_cgpa(text)
        companies = extract_companies(text)
        leadership_signals = extract_leadership_signals(text)

        # Avoid duplicate parsing
        project_technologies = skills

        project_impacts = extract_project_impacts(lines)
        publications = extract_publications(lines)
        open_source = extract_open_source(lines)

        # ---------------- Education ----------------

        degrees = unique(
            degree
            for degree in DEGREE_PATTERNS
            if re.search(
                rf"\b{re.escape(degree)}\b",
                text_lower,
            )
        )

        graduation_years = sorted(
            unique(YEAR_REGEX.findall(text))
        )

        # ---------------- Experience ----------------

        designations = unique(
            designation
            for designation in DESIGNATIONS
            if re.search(
                rf"\b{re.escape(designation)}\b",
                text_lower,
            )
        )

        return {
            "parsed_name": name,
            "parsed_email": email_match.group(0) if email_match else None,
            "parsed_phone": phone_match.group(0) if phone_match else None,
            "parsed_linkedin": linkedin_match.group(0) if linkedin_match else None,
            "parsed_github": github_match.group(0) if github_match else None,
            "parsed_portfolio": portfolio_match.group(0) if portfolio_match else None,
            "parsed_skills": skills,
            "parsed_degrees": degrees,
            "parsed_graduation_years": graduation_years,
            "parsed_designations": designations,
            "parsed_projects": projects,
            "parsed_certifications": certifications,
            "parsed_achievements": achievements,
            "parsed_summary": summary,
            "parsed_experience_years": experience_years,
            "parsed_location": location,
            "parsed_universities": universities,
            "parsed_cgpa": cgpa,
            "parsed_companies": companies,
            "parsed_leadership_signals": leadership_signals,
            "parsed_project_technologies": project_technologies,
            "parsed_project_impacts": project_impacts,
            "parsed_publications": publications,
            "parsed_open_source": open_source,
            "resume_text": text,
        }

    except Exception:
        logger.exception("Resume parsing failed.")
        raise