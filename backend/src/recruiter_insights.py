from .risk_assessment import (
    calculate_risk_score,
    risk_level,
)


def build_recruiter_insights(
    candidate,
    evaluation
):

    risk_data = (
        calculate_risk_score(
            candidate
        )
    )

    risk_score = (risk_data["risk_score"])
    risk = (risk_data["risk_level"])

    strengths = evaluation.get(
        "strengths",
        []
    )[:3]

    concerns = evaluation.get(
        "weaknesses",
        []
    )[:3]

    interview_focus = []

    if evaluation.get(
        "missing_skills"
    ):
        interview_focus.append(
            "Validate missing skills"
        )

    if risk != "Low":
        interview_focus.append(
            "Review career consistency"
        )

    hire_decision = bool(
        float(
            evaluation["final_score"]
        ) >= 0.70
    )

    insights = {
        "hire":
            hire_decision,    

        "risk_score":
            float(risk_score),

        "risk_level":
            risk,

        "top_strengths":
            strengths,

        "top_concerns":
            concerns,

        "interview_focus_areas":
            interview_focus,
    }
    print("INSIGHTS:", insights)
    return insights