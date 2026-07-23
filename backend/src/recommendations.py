from typing import List, Dict


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
        "Azure Fundamentals"
    ],
    "aws": [
        "AWS Solutions Architect Associate"
    ],
    "gcp": [
        "Google Associate Cloud Engineer"
    ],
    "data engineering": [
        "Databricks Data Engineer Associate"
    ],
    "machine learning": [
        "AWS Machine Learning Specialty"
    ]
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
        "AI Research Engineer"
    ],
    "backend": [
        "Backend Engineer",
        "Platform Engineer"
    ],
    "cloud": [
        "Cloud Engineer",
        "DevOps Engineer"
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


def recommend_courses(missing_skills: List[str]) -> List[str]:
    recommendations = []

    for skill in missing_skills:
        recommendations.extend(
            COURSE_MAP.get(skill.lower(), [])
        )

    return sorted(set(recommendations))


def recommend_certifications(
    missing_skills: List[str]
) -> List[str]:

    certs = []

    for skill in missing_skills:
        certs.extend(
            CERTIFICATION_MAP.get(skill.lower(), [])
        )

    return sorted(set(certs))


def recommend_projects(
    missing_skills: List[str]
) -> List[str]:

    projects = []

    for skill in missing_skills:
        projects.extend(
            PROJECT_MAP.get(skill.lower(), [])
        )

    return sorted(set(projects))


def recommend_career_paths(
    detected_skills: List[str]
) -> List[str]:

    paths = []

    for skill in detected_skills:
        paths.extend(
            CAREER_PATHS.get(skill.lower(), [])
        )

    return sorted(set(paths))


def generate_recommendations(
    missing_skills: List[str],
    candidate_skills: List[str]
) -> Dict:

    courses = recommend_courses(
        missing_skills
    )

    certifications = recommend_certifications(
        missing_skills
    )

    projects = recommend_projects(
        missing_skills
    )

    career_paths = recommend_career_paths(
        candidate_skills
    )

    if len(missing_skills) >= 8:

        priority = "High"

    elif len(missing_skills) >= 4:

        priority = "Medium"

    else:

        priority = "Low"

    roadmap = []

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

    roadmap.append(
        "Practice technical interview questions"
    )

    roadmap.append(
        "Apply for progressively challenging roles"
    )

    roadmap = list(
        dict.fromkeys(roadmap)
    )

    return {

        "skill_gap_summary": {

            "missing_skill_count":
                len(missing_skills),

            "missing_skills":
                missing_skills

        },

        "priority":
            priority,

        "courses":
            courses,

        "certifications":
            certifications,

        "projects":
            projects,

        "career_paths":
            career_paths,

        "learning_roadmap":
            roadmap,
    }