import re

BEHAVIORAL_TERMS = {
    "ownership": [
        "ownership",
        "owned",
        "responsible for",
        "accountable",
    ],

    "initiative": [
        "initiated",
        "created",
        "founded",
        "started",
        "built",
    ],

    "leadership": [
        "lead",
        "led",
        "leadership",
        "mentor",
        "mentored",
        "managed",
    ],

    "collaboration": [
        "team",
        "collaborated",
        "cross-functional",
        "partnership",
    ],

    "communication": [
        "presentation",
        "stakeholder",
        "communication",
        "documentation",
    ]
}


IMPLICIT_SKILL_RULES = {

    "machine learning": [
        "pytorch",
        "tensorflow",
        "scikit-learn",
        "xgboost",
        "lightgbm",
    ],

    "nlp": [
        "transformers",
        "hugging face",
        "bert",
        "llm",
        "rag",
        "langchain",
    ],

    "computer vision": [
        "opencv",
        "yolo",
        "image processing",
    ],

    "cloud engineering": [
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
    ],

    "backend engineering": [
        "fastapi",
        "django",
        "flask",
        "spring boot",
        "microservices",
    ],

    "data engineering": [
        "airflow",
        "spark",
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

        score = sum(
            keyword in text_lower
            for keyword in keywords
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

        if matches >= 2:
            inferred.append(
                parent_skill
            )

    return list(
        set(inferred)
    )
