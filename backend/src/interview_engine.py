from typing import Dict, List


TECHNICAL_QUESTION_BANK = {

    "python": [
        "Explain decorators and their practical use cases.",
        "Difference between multiprocessing and multithreading."
    ],

    "fastapi": [
        "Explain dependency injection in FastAPI.",
        "How would you secure a FastAPI application?"
    ],

    "docker": [
        "Difference between image and container.",
        "How would you optimize Docker images?"
    ],

    "aws": [
        "Difference between EC2 and Lambda.",
        "How would you design a scalable AWS architecture?"
    ],

    "machine learning": [
        "Explain bias-variance tradeoff.",
        "How do you evaluate ML models?"
    ],

    "deep learning": [
        "Explain overfitting in neural networks.",
        "Difference between CNN and Transformer architectures."
    ],

    "nlp": [
        "What are embeddings?",
        "Explain transformer architecture."
    ],

    "langchain": [
        "How does retrieval augmented generation work?",
        "How would you design a production RAG system?"
    ]
}


def generate_focus_areas(
    candidate: Dict
):

    focus = []

    matched = candidate.get(
        "matched_skills",
        []
    )

    missing = candidate.get(
        "missing_skills",
        []
    )

    if matched:
        focus.extend(
            matched[:3]
        )

    if missing:
        focus.append(
            "Skill Validation"
        )

    if (
        candidate.get(
            "leadership_fit",
            0
        ) >= 60
    ):
        focus.append(
            "Leadership"
        )

    return list(
        set(focus)
    )


def generate_technical_questions(
    candidate: Dict
):

    questions = []

    matched = candidate.get(
        "matched_skills",
        []
    )

    for skill in matched:

        questions.extend(
            TECHNICAL_QUESTION_BANK.get(
                skill.lower(),
                []
            )
        )

    return questions[:10]


def generate_behavioral_questions(
    candidate: Dict
):

    behavioral = []

    signals = candidate.get(
        "behavioral_signals",
        {}
    )

    if signals.get(
        "leadership",
        0
    ) > 0:

        behavioral.append(
            "Describe a time when you led a team through a difficult challenge."
        )

    if signals.get(
        "initiative",
        0
    ) > 0:

        behavioral.append(
            "Tell us about something you initiated without being asked."
        )

    if signals.get(
        "collaboration",
        0
    ) > 0:

        behavioral.append(
            "Describe a conflict within a team and how you handled it."
        )

    return behavioral


def generate_risk_questions(
    candidate: Dict
):

    questions = []

    risk = candidate.get(
        "risk_assessment",
        {}
    )

    if (
        risk.get(
            "employment_gap_risk",
            0
        ) > 0
    ):
        questions.append(
            "Can you explain your employment gap?"
        )

    if (
        risk.get(
            "job_hopping_risk",
            0
        ) > 0
    ):
        questions.append(
            "Can you explain your career transitions?"
        )

    if (
        risk.get(
            "skill_inflation_risk",
            0
        ) > 40
    ):
        questions.append(
            "Walk us through a project where you used the technologies listed on your resume."
        )

    return questions


def generate_interview_recommendation(
    candidate: Dict
):

    score = candidate.get(
        "final_score",
        0
    )

    risk = candidate.get(
        "risk_score",
        0
    )

    if (
        score >= 0.85
        and risk < 30
    ):
        return "Strong Interview Recommendation"

    if (
        score >= 0.70
        and risk < 60
    ):
        return "Proceed To Interview"

    return "Interview With Caution"


def generate_interview_pack(
    candidate: Dict
):

    return {

        "focus_areas":
            generate_focus_areas(
                candidate
            ),

        "technical_questions":
            generate_technical_questions(
                candidate
            ),

        "behavioral_questions":
            generate_behavioral_questions(
                candidate
            ),

        "risk_validation_questions":
            generate_risk_questions(
                candidate
            ),

        "interview_recommendation":
            generate_interview_recommendation(
                candidate
            )
    }