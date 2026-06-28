from typing import List, Dict


COURSE_MAP = {
    "python": [
        "Python for Everybody",
        "Advanced Python Programming"
    ],
    "machine learning": [
        "Machine Learning Specialization",
        "Hands-On Machine Learning"
    ],
    "deep learning": [
        "Deep Learning Specialization"
    ],
    "nlp": [
        "Natural Language Processing Specialization"
    ],
    "cloud": [
        "AWS Cloud Practitioner",
        "Google Cloud Fundamentals"
    ],
    "docker": [
        "Docker Mastery"
    ],
    "kubernetes": [
        "Kubernetes for Developers"
    ]
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
    "machine learning": [
        "End-to-End ML Pipeline",
        "Customer Churn Prediction"
    ],
    "nlp": [
        "Resume Parser",
        "Chatbot Assistant"
    ],
    "computer vision": [
        "Object Detection System",
        "Medical Image Analyzer"
    ],
    "backend": [
        "Microservice Architecture Project",
        "API Gateway System"
    ]
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
    ]
}


def recommend_courses(missing_skills: List[str]) -> List[str]:
    recommendations = []

    for skill in missing_skills:
        recommendations.extend(
            COURSE_MAP.get(skill.lower(), [])
        )

    return list(set(recommendations))


def recommend_certifications(
    missing_skills: List[str]
) -> List[str]:

    certs = []

    for skill in missing_skills:
        certs.extend(
            CERTIFICATION_MAP.get(skill.lower(), [])
        )

    return list(set(certs))


def recommend_projects(
    missing_skills: List[str]
) -> List[str]:

    projects = []

    for skill in missing_skills:
        projects.extend(
            PROJECT_MAP.get(skill.lower(), [])
        )

    return list(set(projects))


def recommend_career_paths(
    detected_skills: List[str]
) -> List[str]:

    paths = []

    for skill in detected_skills:
        paths.extend(
            CAREER_PATHS.get(skill.lower(), [])
        )

    return list(set(paths))


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

    return {

        "skill_gap_summary": {

            "missing_skill_count":
                len(missing_skills),

            "missing_skills":
                missing_skills

        },

        "priority": (

            "High"

            if len(missing_skills) >= 5

            else

            "Medium"

            if len(missing_skills) >= 2

            else

            "Low"

        ),

        "courses":
            courses,

        "certifications":
            certifications,

        "projects":
            projects,

        "career_paths":
            career_paths,

        "learning_roadmap": [

            "Complete recommended courses",

            "Build suggested projects",

            "Earn relevant certifications",

            "Apply for progressively challenging roles"

        ]
    }