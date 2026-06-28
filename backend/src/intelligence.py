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


def estimate_adaptability(
    text: str
):

    text_lower = text.lower()

    adaptability_terms = [

        "adaptability",
        "self-learning",
        "self taught",
        "quick learner",
        "cross-functional",
        "multiple technologies",
        "research",
        "learning",
    ]

    score = sum(
        term in text_lower
        for term in adaptability_terms
    )

    return min(
        round(score / 5, 2),
        1.0
    )


def estimate_growth_potential(
    text: str
):

    text_lower = text.lower()

    growth_terms = [

        "promotion",
        "mentor",
        "lead",
        "leadership",
        "research",
        "publication",
        "open source",
        "certification",
        "award",
        "achievement",
    ]

    score = sum(
        term in text_lower
        for term in growth_terms
    )

    return min(
        round(score / 5, 2),
        1.0
    )


def build_candidate_graph(
    candidate
):

    graph = {

        "skills":
            candidate.get(
                "skills",
                []
            ),

        "projects":
            candidate.get(
                "projects",
                []
            ),

        "certifications":
            candidate.get(
                "certifications",
                []
            ),

        "companies":
            candidate.get(
                "companies",
                []
            ),

        "relationships": [],
    }

    for skill in graph["skills"]:

        for project in graph["projects"]:

            graph[
                "relationships"
            ].append({

                "source": skill,

                "target": project,

                "type":
                    "skill_to_project",
            })

    return graph