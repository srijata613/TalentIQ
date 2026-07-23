import re
import os
from venv import logger
from .parsing import (
    extract_skills_dictionary,
    ALL_SKILLS,
)

from src.llm.parser import (
    parse_resume_with_llm,
)

EMAIL_REGEX = (
    r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
)

PHONE_REGEX = (
    r"(\+?\d[\d\s\-]{8,}\d)"
)

LINKEDIN_REGEX = (
    r"https?://(?:www\.)?linkedin\.com/in/[^\s]+"
)

GITHUB_REGEX = (
    r"https?://(?:www\.)?github\.com/[^\s]+"
)

PORTFOLIO_REGEX = (
    r"https?://(?!.*linkedin)(?!.*github)[^\s]+"
)

YEAR_REGEX = (r"\b(?:19|20)\d{2}\b")

CGPA_REGEX = r'(?:cgpa|gpa)\s*[:\-]?\s*(\d+(?:\.\d+)?)'

EXPERIENCE_REGEX = (
    r'(\d+)\+?\s*years?'
)

UNIVERSITY_KEYWORDS = [
    "university",
    "institute",
    "college",
    "iit",
    "nit",
]

COMPANY_KEYWORDS = [
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
]

LEADERSHIP_KEYWORDS = [
    "led",
    "lead",
    "managed",
    "mentored",
    "owner",
    "ownership",
    "team lead",
    "coordinated",
]

DEGREE_PATTERNS = [
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
]

DESIGNATIONS = [
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
]

PROJECT_KEYWORDS = [
    "project",
    "projects",
    "developed",
    "built",
    "created",
    "implemented",
]

CERTIFICATION_KEYWORDS = [
    "certification",
    "certificate",
    "coursera",
    "udemy",
    "forage",
    "aws certification",
]

ACHIEVEMENT_KEYWORDS = [
    "award",
    "winner",
    "rank",
    "scholarship",
    "achievement",
    "recognition",
]

IMPACT_KEYWORDS = [
    "%",
    "improved",
    "increased",
    "reduced",
    "saved",
    "optimized",
]

PUBLICATION_KEYWORDS = [
    "publication",
    "paper",
    "research",
    "journal",
    "conference",
    "ieee",
    "springer",
]

OPEN_SOURCE_KEYWORDS = [
    "open source",
    "github contributor",
    "contributor",
    "maintainer",
    "pull request",
]

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

USE_LLM = os.getenv("USE_LLM", "false").lower() == "true"

def extract_projects(lines):

    projects = []

    for line in lines:

        lower = line.lower().strip()

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
        
        if (
            2 <= len(line.split()) <= 8
            and line[0].isupper()
        ):
            projects.append(line)

    return list(dict.fromkeys(projects))


def extract_certifications(lines):

    certifications = []

    for line in lines:

        lower = line.lower().strip()

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
            rf"\b{re.escape('certified')}\b",
            lower,
        ):
            certifications.append(line)

    return list(dict.fromkeys(certifications))


def extract_achievements(lines):

    achievements = []

    for line in lines:

        lower = line.lower().strip()

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

    return list(dict.fromkeys(achievements))


def extract_summary(lines):

    summary_started = False
    summary = []

    for line in lines:

        lower = line.lower()

        if re.search(rf"\b{re.escape('summary')}\b", lower):
            summary_started = True
            continue

        if summary_started:

            if re.fullmatch(
                r"(professional\s+)?(experience|education|projects|skills|certifications):?",
                lower.strip(),
            ):
                break

            summary.append(line)

    if summary:
        return " ".join(summary)

    return None


def extract_experience_years(text):

    matches = re.findall(
        EXPERIENCE_REGEX,
        text,
        re.IGNORECASE
    )

    if not matches:
        return 0

    return max(
        int(year)
        for year in matches
    )

def extract_location(lines):

    for line in lines[:10]:
        
        if (
            "," in line
            and len(line.split()) <=8
        ):
            return line.strip(
        )

    return None

def extract_universities(lines):

    universities = []

    for line in lines:

        lower = line.lower()

        if any(
            re.search(rf"\b{re.escape(keyword)}\b", lower)
            for keyword in UNIVERSITY_KEYWORDS
        ):
            universities.append(line)

    return list(dict.fromkeys(universities))

def extract_cgpa(text):

    match = re.search(
        CGPA_REGEX,
        text,
        re.IGNORECASE
    )

    if not match:
        return None

    try:
        return float(match.group(1))
    except ValueError:
        return None
    
def extract_companies(text):

    companies = []

    lines = text.splitlines()

    company_suffixes = (
        "pvt ltd",
        "private limited",
        "limited",
        "ltd",
        "inc",
        "llc",
        "technologies",
        "solutions",
        "systems",
        "labs",
    )

    for line in lines:

        stripped = line.strip()

        lower = stripped.lower()

        if any(
            re.search(
                rf"\b{re.escape(suffix)}\b",
                lower,
            )
            for suffix in company_suffixes
        ):
            companies.append(stripped)

    for company in COMPANY_KEYWORDS:

        if re.search(
            rf"\b{re.escape(company)}\b",
            text.lower(),
        ):
            companies.append(company.title())

    return list(dict.fromkeys(companies))

def extract_leadership_signals(text):

    signals = []

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

    return list(dict.fromkeys(signals))

def extract_project_technologies(text):

    return extract_skills_dictionary(
        text,
        ALL_SKILLS
    )

def extract_project_impacts(lines):

    impacts = []

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
            impacts.append(line)

    return list(dict.fromkeys(impacts))

def extract_publications(lines):

    publications = []

    for line in lines:

        lower = line.lower()

        if any(
            re.search(rf"\b{re.escape(keyword)}\b", lower)
            for keyword in PUBLICATION_KEYWORDS
        ):
            publications.append(line)

    return list(dict.fromkeys(publications))

def extract_open_source(lines):

    results = []

    for line in lines:

        lower = line.lower().strip()

        if lower in IGNORE_HEADERS:
            continue

        if any(
            re.search(rf"\b{re.escape(keyword)}\b", lower)
            for keyword in OPEN_SOURCE_KEYWORDS
        ):
            results.append(line)

    return list(dict.fromkeys(results))

def parse_resume(
    text: str,
    use_llm: bool = USE_LLM,
    ) -> dict:
    
    
    if use_llm:
        try:
            candidate = parse_resume_with_llm(
                text
            )
        
            if candidate.get(
                "parsed_name"
            ):
                return candidate
        
            logger.warning(
                "LLM failed to extract name, falling back to regex-based parsing."
            )
        
        except Exception as e:
            logger.error(
                f"LLM parsing failed: {e}"
            )

    text_lower = text.lower()

    # Contact Information

    email_match = re.search(
        EMAIL_REGEX,
        text,
        re.IGNORECASE
    )

    phone_match = re.search(
        PHONE_REGEX,
        text,
        re.IGNORECASE
    )

    linkedin_match = re.search(
        LINKEDIN_REGEX,
        text,
        re.IGNORECASE
    )

    github_match = re.search(
        GITHUB_REGEX,
        text,
        re.IGNORECASE
    )

    portfolio_match = re.search(
        PORTFOLIO_REGEX,
        text,
        re.IGNORECASE
    )

    # Name

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]
    
    projects = extract_projects(
        lines
    )

    certifications = (
        extract_certifications(
            lines
        )
    )

    achievements = (
        extract_achievements(
            lines
        )
    )

    summary = extract_summary(
        lines
    )

    experience_years = (
        extract_experience_years(
            text
        )
    )

    name = lines[0] if lines else None

    # Skills

    skills = extract_skills_dictionary(
        text,
        ALL_SKILLS
    )
    # Education

    degrees = []

    for degree in DEGREE_PATTERNS:

        if re.search(
            rf"\b{re.escape(degree)}\b",
            text_lower,
        ):
            degrees.append(degree)

    degrees = list(dict.fromkeys(degrees))

    graduation_years = list(
        dict.fromkeys(
            re.findall(
                YEAR_REGEX,
                text
            )
        )
    )

    graduation_years.sort()

    # Experience

    designations = []

    for designation in DESIGNATIONS:

        if re.search(
            rf"\b{re.escape(designation)}\b",
            text_lower,
        ):
            designations.append(designation)

    designations = list(
        dict.fromkeys(designations)
    )
    
    location = extract_location(lines)
    
    universities = extract_universities(lines)
    
    cgpa = extract_cgpa(text)
    
    companies = extract_companies(text)
    
    leadership_signals = extract_leadership_signals(text)
    
    project_technologies = extract_project_technologies(text)
    
    project_impacts = extract_project_impacts(lines)
    
    publications = extract_publications(lines)
    
    open_source = extract_open_source(lines)
    

    return {

        "parsed_name": name,

        "parsed_email":
            email_match.group(0)
            if email_match
            else None,

        "parsed_phone":
            phone_match.group(0)
            if phone_match
            else None,

        "parsed_linkedin":
            linkedin_match.group(0)
            if linkedin_match
            else None,

        "parsed_github":
            github_match.group(0)
            if github_match
            else None,

        "parsed_portfolio":
            portfolio_match.group(0)
            if portfolio_match
            else None,

        "parsed_skills":
            skills,

        "parsed_degrees":
            degrees,

        "parsed_graduation_years":
            graduation_years,

        "parsed_designations":
            designations,

        "parsed_projects":
            projects,

        "parsed_certifications":
            certifications,

        "parsed_achievements":
            achievements,

        "parsed_summary":
            summary,

        "parsed_experience_years":
            experience_years,

        "parsed_location":
            location,

        "parsed_universities":
            universities,

        "parsed_cgpa":
            cgpa,

        "parsed_companies":
            companies,

        "parsed_leadership_signals":
            leadership_signals,

        "parsed_project_technologies":
            project_technologies,

        "parsed_project_impacts":
            project_impacts,

        "parsed_publications":
            publications,

        "parsed_open_source":
            open_source,

        "resume_text":
            text,
    }