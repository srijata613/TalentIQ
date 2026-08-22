"""
Production parsing package.

This package contains all parsing utilities for
resume parsing and job description analysis.

Public API is re-exported here so existing imports
continue to work:

    from src.parsing import extract_skills_dictionary
"""

# Core
from .core import (
    SalaryRange,
    get_taxonomy,
    get_soft_skills,
    get_tools,
    get_technologies,
    get_all_skills,
)

# Skills
from .skills import (
    extract_skills_dictionary,
    extract_preferred_skills,
    extract_soft_skills,
    extract_tools,
    extract_technologies,
)
# Experience
from .experience import (
    extract_experience_requirement,
    extract_seniority,
    benchmark_salary,
)
# Education
from .education import (
    extract_education_requirement,
    extract_certifications,
    extract_universities,
    extract_cgpa,
)
# Responsibilities
from .responsibilities import (
    extract_responsibilities,
    classify_must_have,
    classify_nice_to_have,
)
# Metadata
from .metadata import (
    extract_keywords,
    extract_industry,
    extract_domain,
    extract_location,
    extract_companies,
    extract_leadership_signals,
)
# Analysis
from .analysis import (
    extract_sentences,
    readability_score,
    detect_duplicate_requirements,
    detect_missing_requirements,
    detect_hidden_requirements,
    extract_semantic_requirements,
    detect_skill_gaps,
)

__all__ = [
    # Core
    "SalaryRange",
    "get_taxonomy",
    "get_soft_skills",
    "get_tools",
    "get_technologies",
    "get_all_skills",

    # Skills
    "extract_skills_dictionary",
    "extract_preferred_skills",
    "extract_soft_skills",
    "extract_tools",
    "extract_technologies",

    # Experience
    "extract_experience_requirement",
    "extract_seniority",
    "benchmark_salary",

    # Education
    "extract_education_requirement",
    "extract_certifications",
    "extract_universities",
    "extract_cgpa",

    # Responsibilities
    "extract_responsibilities",
    "classify_must_have",
    "classify_nice_to_have",

    # Metadata
    "extract_keywords",
    "extract_industry",
    "extract_domain",
    "extract_location",
    "extract_companies",
    "extract_leadership_signals",

    # Analysis
    "extract_sentences",
    "readability_score",
    "detect_duplicate_requirements",
    "detect_missing_requirements",
    "detect_hidden_requirements",
    "extract_semantic_requirements",
    "detect_skill_gaps",
]