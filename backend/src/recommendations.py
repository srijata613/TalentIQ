from __future__ import annotations

import logging
from typing import Any, Dict, Iterable, List, Set

logger = logging.getLogger(__name__)

# Recommendation Catalogs
COURSE_MAP = {
    "python": [
        "Python for Everybody",
        "Advanced Python Programming",
    ],
    "fastapi": [
        "FastAPI - The Complete Course",
    ],
    "docker": [
        "Docker Mastery",
    ],
    "kubernetes": [
        "Kubernetes for Developers",
    ],
    "aws": [
        "AWS Cloud Practitioner",
        "AWS Developer Associate",
    ],
    "postgresql": [
        "PostgreSQL Bootcamp",
    ],
    "redis": [
        "Redis Essentials",
    ],
    "machine learning": [
        "Machine Learning Specialization",
    ],
    "deep learning": [
        "Deep Learning Specialization",
    ],
    "nlp": [
        "Natural Language Processing Specialization",
    ],
    "langchain": [
        "LangChain for LLM Applications",
    ],
    "rag": [
        "Retrieval-Augmented Generation",
    ],
}

CERTIFICATION_MAP = {
    "cloud": [
        "AWS Certified Cloud Practitioner",
        "Azure Fundamentals",
    ],
    "aws": [
        "AWS Solutions Architect Associate",
    ],
    "gcp": [
        "Google Associate Cloud Engineer",
    ],
    "data engineering": [
        "Databricks Data Engineer Associate",
    ],
    "machine learning": [
        "AWS Machine Learning Specialty",
    ],
}

PROJECT_MAP = {
    "fastapi": [
        "Production FastAPI REST API",
    ],
    "docker": [
        "Containerized Microservice Deployment",
    ],
    "aws": [
        "Deploy FastAPI on AWS ECS",
    ],
    "redis": [
        "Distributed Cache System",
    ],
    "postgresql": [
        "Database Optimization Dashboard",
    ],
    "machine learning": [
        "End-to-End ML Pipeline",
        "Customer Churn Prediction",
    ],
    "nlp": [
        "Resume Parser",
        "LLM Chatbot",
    ],
    "computer vision": [
        "YOLO Detection System",
    ],
}

CAREER_PATHS = {
    "machine learning": [
        "ML Engineer",
        "Applied AI Engineer",
        "AI Research Engineer",
    ],
    "backend": [
        "Backend Engineer",
        "Platform Engineer",
    ],
    "cloud": [
        "Cloud Engineer",
        "DevOps Engineer",
    ],
    "fastapi": [
        "Backend Engineer",
    ],
    "aws": [
        "Cloud Engineer",
    ],
    "docker": [
        "Platform Engineer",
    ],
    "langchain": [
        "LLM Engineer",
    ],
    "nlp": [
        "AI Engineer",
    ],
    "computer vision": [
        "Computer Vision Engineer",
    ],
}

HIGH_PRIORITY_THRESHOLD = 8
MEDIUM_PRIORITY_THRESHOLD = 4


def _normalize(values: Iterable[Any]) -> List[str]:
    """
    Normalize a collection of skill names while preserving order.
    """
    seen: Set[str] = set()
    normalized: List[str] = []

    for value in values:

        if not value:
            continue

        skill = str(value).strip().lower()

        if skill and skill not in seen:
            seen.add(skill)
            normalized.append(skill)

    return normalized


def _recommend(
    skills: List[str],
    mapping: Dict[str, List[str]],
) -> List[str]:

    recommendations: Set[str] = set()

    for skill in _normalize(skills):
        recommendations.update(
            mapping.get(skill, [])
        )

    return sorted(recommendations)


def recommend_courses(
    missing_skills: List[str],
) -> List[str]:

    return _recommend(
        missing_skills,
        COURSE_MAP,
    )


def recommend_certifications(
    missing_skills: List[str],
) -> List[str]:

    return _recommend(
        missing_skills,
        CERTIFICATION_MAP,
    )


def recommend_projects(
    missing_skills: List[str],
) -> List[str]:

    return _recommend(
        missing_skills,
        PROJECT_MAP,
    )


def recommend_career_paths(
    detected_skills: List[str],
) -> List[str]:

    return _recommend(
        detected_skills,
        CAREER_PATHS,
    )


def _priority(
    missing_count: int,
) -> str:

    if missing_count >= HIGH_PRIORITY_THRESHOLD:
        return "High"

    if missing_count >= MEDIUM_PRIORITY_THRESHOLD:
        return "Medium"

    return "Low"


def _roadmap(
    missing_skills: List[str],
    courses: List[str],
    certifications: List[str],
    projects: List[str],
) -> List[str]:

    roadmap: List[str] = []

    for skill in missing_skills[:5]:
        roadmap.append(
            f"Learn {skill.title()}"
        )

    if courses:
        roadmap.append(
            "Complete recommended courses"
        )

    if projects:
        roadmap.append(
            "Build recommended projects"
        )

    if certifications:
        roadmap.append(
            "Earn relevant certifications"
        )

    roadmap.extend(
        [
            "Practice technical interview questions",
            "Apply for progressively challenging roles",
        ]
    )

    return list(
        dict.fromkeys(roadmap)
    )


def generate_recommendations(
    missing_skills: List[str],
    candidate_skills: List[str],
) -> Dict[str, Any]:

    try:

        missing_skills = _normalize(
            missing_skills
        )

        candidate_skills = _normalize(
            candidate_skills
        )

        courses = recommend_courses(
            missing_skills
        )

        certifications = (
            recommend_certifications(
                missing_skills
            )
        )

        projects = recommend_projects(
            missing_skills
        )

        career_paths = (
            recommend_career_paths(
                candidate_skills
            )
        )

        return {
            "skill_gap_summary": {
                "missing_skill_count": len(
                    missing_skills
                ),
                "missing_skills": missing_skills,
            },
            "priority": _priority(
                len(missing_skills)
            ),
            "courses": courses,
            "certifications": certifications,
            "projects": projects,
            "career_paths": career_paths,
            "learning_roadmap": _roadmap(
                missing_skills,
                courses,
                certifications,
                projects,
            ),
        }

    except Exception:
        logger.exception(
            "Failed generating recommendations."
        )
        raise