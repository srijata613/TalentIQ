from typing import Dict


def generate_executive_summary(
    understanding: Dict,
    evaluation: Dict,
    risk_assessment: Dict
):

    career_stage = understanding.get(
        "career_stage",
        "Unknown"
    )

    strengths = understanding.get(
        "strengths",
        []
    )

    risks = understanding.get(
        "risks",
        []
    )

    score = evaluation.get(
        "final_score",
        0
    )

    risk_level = risk_assessment.get(
        "risk_level",
        "Unknown"
    )

    summary = (
        f"{career_stage} candidate "
        f"with match score "
        f"{round(score * 100)}%. "
    )

    if strengths:

        summary += (
            f"Key strengths include "
            f"{', '.join(strengths[:3])}. "
        )

    if risks:

        summary += (
            f"Potential concerns include "
            f"{', '.join(risks[:2])}. "
        )

    summary += (
        f"Overall hiring risk is "
        f"{risk_level}."
    )

    return summary


def generate_hiring_verdict(
    evaluation: Dict,
    risk_assessment: Dict
):

    score = evaluation.get(
        "final_score",
        0
    )

    risk = risk_assessment.get(
        "risk_score",
        0
    )

    if (
        score >= 0.85
        and risk < 30
    ):
        return "Strong Hire"

    if (
        score >= 0.70
        and risk < 50
    ):
        return "Hire"

    if (
        score >= 0.50
    ):
        return "Consider"

    return "Reject"


def generate_interview_focus(
    evaluation: Dict,
    understanding: Dict,
    risk_assessment: Dict
):

    focus = []

    missing = evaluation.get(
        "missing_skills",
        []
    )

    if missing:

        focus.append(
            "Validate missing skills"
        )

    if (
        risk_assessment.get(
            "job_hopping_risk",
            0
        ) > 0
    ):

        focus.append(
            "Career stability"
        )

    if (
        risk_assessment.get(
            "employment_gap_risk",
            0
        ) > 0
    ):

        focus.append(
            "Employment gaps"
        )

    if (
        understanding.get(
            "adaptability",
            0
        ) < 0.5
    ):

        focus.append(
            "Learning ability"
        )

    return focus


def build_recruiter_summary(
    understanding: Dict,
    evaluation: Dict,
    risk_assessment: Dict
):

    return {

        "executive_summary":
            generate_executive_summary(
                understanding,
                evaluation,
                risk_assessment
            ),

        "hiring_verdict":
            generate_hiring_verdict(
                evaluation,
                risk_assessment
            ),

        "interview_focus":
            generate_interview_focus(
                evaluation,
                understanding,
                risk_assessment
            ),

        "candidate_strengths":
            understanding.get(
                "strengths",
                []
            ),

        "candidate_risks":
            understanding.get(
                "risks",
                []
            )
    }