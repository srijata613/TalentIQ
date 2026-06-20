import re

from .parsing import (
    extract_skills_dictionary,
    ALL_SKILLS,
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

YEAR_REGEX = re.findall(YEAR_REGEX, text)

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

def extract_projects(lines):

    projects = []

    for line in lines:

        lower = line.lower()

        if any(
            keyword in lower
            for keyword in PROJECT_KEYWORDS
        ):
            projects.append(line)

    return list(set(projects))


def extract_certifications(lines):

    certifications = []

    for line in lines:

        lower = line.lower()

        if any(
            keyword in lower
            for keyword in CERTIFICATION_KEYWORDS
        ):
            certifications.append(line)

    return list(set(certifications))


def extract_achievements(lines):

    achievements = []

    for line in lines:

        lower = line.lower()

        if any(
            keyword in lower
            for keyword in ACHIEVEMENT_KEYWORDS
        ):
            achievements.append(line)

    return list(set(achievements))


def extract_summary(lines):

    if len(lines) < 5:
        return None

    return " ".join(
        lines[0:5]
    )[:1000]


def extract_experience_years(text):

    matches = re.findall(
        EXPERIENCE_REGEX,
        text,
        re.IGNORECASE
    )

    if not matches:
        return None

    return max(
        int(year)
        for year in matches
    )

def extract_location(lines):

    for line in lines[:10]:

        if "," in line:
            return line

    return None

def extract_universities(lines):

    universities = []

    for line in lines:

        lower = line.lower()

        if any(
            keyword in lower
            for keyword in UNIVERSITY_KEYWORDS
        ):
            universities.append(line)

    return list(set(universities))

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
    except:
        return None
    
def extract_companies(text):

    companies = []

    lower = text.lower()

    for company in COMPANY_KEYWORDS:

        if company in lower:
            companies.append(company)

    return list(set(companies))

def extract_leadership_signals(text):

    signals = []

    lower = text.lower()

    for keyword in LEADERSHIP_KEYWORDS:

        if keyword in lower:
            signals.append(keyword)

    return list(set(signals))

def extract_project_technologies(text):

    return extract_skills_dictionary(
        text,
        ALL_SKILLS
    )

def extract_project_impacts(lines):

    impacts = []

    for line in lines:

        lower = line.lower()

        if any(
            keyword in lower
            for keyword in IMPACT_KEYWORDS
        ):
            impacts.append(line)

    return list(set(impacts))

def extract_publications(lines):

    publications = []

    for line in lines:

        lower = line.lower()

        if any(
            keyword in lower
            for keyword in PUBLICATION_KEYWORDS
        ):
            publications.append(line)

    return list(set(publications))

def extract_open_source(lines):

    results = []

    for line in lines:

        lower = line.lower()

        if any(
            keyword in lower
            for keyword in OPEN_SOURCE_KEYWORDS
        ):
            results.append(line)

    return list(set(results))

def parse_resume(text: str):

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

        if degree in text_lower:
            degrees.append(degree)

    degrees = list(set(degrees))

    graduation_years = list(
        set(
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

        if designation in text_lower:
            designations.append(
                designation
            )

    designations = list(
        set(designations)
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

        "identity": {
            "name": name,

            "email":
                email_match.group(0)
                if email_match
                else None,

            "phone":
                phone_match.group(0)
                if phone_match
                else None,

            "linkedin":
                linkedin_match.group(0)
                if linkedin_match
                else None,

            "github":
                github_match.group(0)
                if github_match
                else None,

            "portfolio":
                portfolio_match.group(0)
                if portfolio_match
                else None,
        },

        "education": {
            "degrees":
                degrees,

            "graduation_years":
                graduation_years,
        },

        "experience": {
            "designations":
                designations,
        },

        "skills": skills,
        
        "projects": projects,

        "certifications": certifications,
        
        "achievements": achievements,
        
        "summary": summary,
        
        "experience_years": experience_years,
        
        "location": location,
        
        "universities": universities,
        
        "cgpa": cgpa,
        
        "companies": companies,
        
        "leadership_signals": leadership_signals,
        
        "project_technologies": project_technologies,
        
        "project_impacts": project_impacts,
        
        "publications": publications,
        
        "open_source": open_source,
    }