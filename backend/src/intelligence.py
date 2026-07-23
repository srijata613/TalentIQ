import re

BEHAVIORAL_TERMS = {

    "ownership": [
        "ownership",
        "owned",
        "owner",
        "responsible for",
        "accountable",
        "took ownership",
        "independently",
    ],

    "initiative": [
        "initiated",
        "created",
        "built",
        "developed",
        "designed",
        "implemented",
        "launched",
        "introduced",
        "founded",
        "started",
        "improved",
        "optimized",
    ],

    "leadership": [
        "lead",
        "led",
        "leadership",
        "team lead",
        "managed",
        "mentored",
        "guided",
        "supervised",
        "coached",
        "headed",
    ],

    "collaboration": [
        "team",
        "collaborated",
        "collaboration",
        "cross-functional",
        "partnered",
        "partnership",
        "worked with",
        "coordinated",
    ],

    "communication": [
        "presentation",
        "presented",
        "stakeholder",
        "communication",
        "documentation",
        "client",
        "customer",
        "training",
        "explained",
    ],
}


IMPLICIT_SKILL_RULES = {

    "machine learning": [
        "tensorflow",
        "pytorch",
        "scikit-learn",
        "keras",
        "xgboost",
        "lightgbm",
    ],

    "deep learning": [
        "tensorflow",
        "pytorch",
        "keras",
    ],

    "nlp": [
        "transformers",
        "hugging face",
        "bert",
        "llm",
        "langchain",
        "rag",
        "sentence transformers",
    ],

    "computer vision": [
        "opencv",
        "yolo",
        "image processing",
        "cnn",
    ],

    "backend engineering": [
        "fastapi",
        "django",
        "flask",
        "spring boot",
        "express",
        "microservices",
        "rest api",
    ],

    "frontend engineering": [
        "react",
        "next.js",
        "vue",
        "angular",
        "tailwind",
    ],

    "cloud engineering": [
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
    ],

    "devops": [
        "docker",
        "kubernetes",
        "jenkins",
        "github actions",
        "terraform",
    ],

    "database engineering": [
        "postgresql",
        "mysql",
        "mongodb",
        "redis",
        "oracle",
    ],

    "data engineering": [
        "spark",
        "airflow",
        "hadoop",
        "etl",
    ],
}


def detect_behavioral_signals(
    text: str
):

    text_lower = text.lower()

    signals = {}

    for category, keywords in (
        BEHAVIORAL_TERMS.items()
    ):

        score = 0
        
        for keyword in keywords:
            
            score += len(
                re.findall(
                    rf"\b{re.escape(keyword)}\b",
                    text_lower,
                )
            )

        signals[category] = score

    return signals


def detect_implicit_skills(
    explicit_skills
):

    inferred = []

    explicit_lower = {
        skill.lower()
        for skill in explicit_skills
    }

    for parent_skill, child_skills in (
        IMPLICIT_SKILL_RULES.items()
    ):

        matches = sum(
            skill.lower() in explicit_lower
            for skill in child_skills
        )

        threshold = 2
        
        if len(child_skills) <= 3:
            threshold = 1
            
        if matches >= threshold:
            inferred.append(parent_skill)

    return sorted(
        set(inferred)
    )
