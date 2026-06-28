from ast import pattern
import keyword
import re
from typing import Dict, List

from src.config import (
    DOMAIN_KEYWORDS,
    SKILL_TAXONOMY,
)

# Experience Mapping
EXPERIENCE_LEVELS = {
    "intern": 0,
    "entry": 0,
    "junior": 1,
    "associate": 2,
    "mid": 3,
    "senior": 5,
    "lead": 7,
    "principal": 10,
}

# Fit Keywords
FIT_TYPES = {
    "startup": "startup_fit",
    "enterprise": "enterprise_fit",
    "remote": "remote_fit",
    "leadership": "leadership_fit",
}

# Risk Keywords
RISK_LEVELS = {
    "low": 30,
    "medium": 60,
    "high": 100,
}

# Intent Detection
def detect_intent(query: str) -> str:

    q = query.lower()

    if any(x in q for x in [
        "find",
        "search",
        "show",
        "list"
    ]):
        return "candidate_search"

    if any(x in q for x in [
        "compare",
        "difference",
        "vs",
        "versus"
    ]):
        return "candidate_comparison"

    if any(x in q for x in [
        "why",
        "reason",
        "explain"
    ]):
        return "candidate_explanation"

    if any(x in q for x in [
        "summary",
        "pipeline",
        "dashboard"
    ]):
        return "pipeline_summary"

    if any(x in q for x in [
        "interview",
        "questions"
    ]):
        return "interview"

    return "candidate_search"

# Skill Extraction
def extract_skills(query: str) -> List[str]:

    q = query.lower()

    skills = []

    for category in SKILL_TAXONOMY.values():

        for skill in category:
            
            pattern = (
                r"\b"
                + re.escape(skill.lower())
                + r"\b"
            )

            if re.search(pattern, q):
                skills.append(skill)

    return sorted(set(skills))

# Domain Extraction
def extract_domain(query: str):

    q = query.lower()

        
    aliases = {

        "backend engineering":[
            "backend",
            "backend engineer",
            "backend developer"
        ],

        "machine learning":[
            "ml",
            "machine learning",
            "ai engineer"
        ],

        "cloud engineering":[
            "cloud",
            "cloud engineer"
        ],

        "frontend engineering":[
            "frontend",
            "frontend engineer"
        ],

        "data engineering":[
            "data engineer",
            "data engineering"
        ]
    }
    
    for domain, words in aliases.items():
        
        if any(word in q for word in words):
            return domain
    
    for domain, keywords in DOMAIN_KEYWORDS.items():
        
        if any(keyword in q for keyword in keywords):
            return domain

    return None

# Experience Extraction
def extract_experience(query: str):

    q = query.lower()

    match = re.search(
        r"(\d+)\+?\s*years",
        q
    )

    if match:
        return int(match.group(1))

    for level, years in EXPERIENCE_LEVELS.items():

        if level in q:
            return years

    return 0

# Fit Extraction
def extract_fit(query: str):

    q = query.lower()

    for word, fit in FIT_TYPES.items():

        if word in q:
            return fit

    return None

# Risk Extraction
def extract_risk(query: str):

    q = query.lower()

    for level, value in RISK_LEVELS.items():

        if level in q:
            return value

    return None

# Sort Detection
def extract_sort(query: str):

    q = query.lower()

    if "highest score" in q:
        return "final_score"

    if "lowest risk" in q:
        return "risk_score"

    if "growth" in q:
        return "growth_score"

    return "final_score"

# Main Parser
def parse_query(query: str) -> Dict:

    parsed = {

        "intent":
            detect_intent(query),

        "skills":
            extract_skills(query),

        "domain":
            extract_domain(query),

        "experience":
            extract_experience(query),

        "fit":
            extract_fit(query),

        "risk":
            extract_risk(query),

        "sort_by":
            extract_sort(query)
    }

    parsed["original_query"] = query

    return parsed