from .evaluator import evaluate_candidate


def shortlist_candidates(
    ranking_results,
    threshold=0.70
):
    return [
        candidate
        for candidate in ranking_results
        if candidate["final_score"] >= threshold
    ]


def candidate_risk_score(
    candidate_result
):
    risk = 0

    if len(
        candidate_result.get(
            "missing_skills",
            []
        )
    ) >= 5:
        risk += 40

    if (
        candidate_result.get(
            "experience_score",
            0
        ) < 0.40
    ):
        risk += 30

    if (
        candidate_result.get(
            "education_score",
            0
        ) == 0
    ):
        risk += 15

    if (
        candidate_result.get(
            "communication_score",
            0
        ) < 0.30
    ):
        risk += 15

    return min(risk, 100)


def compare_candidates(
    jd_text,
    resumes
):
    results = []

    for idx, resume in enumerate(
        resumes
    ):
        candidate = (
            evaluate_candidate(
                jd_text,
                resume
            )
        )

        candidate["candidate_id"] = (
            f"candidate_{idx+1}"
        )

        candidate["risk_score"] = (
            candidate_risk_score(
                candidate
            )
        )

        results.append(candidate)

    results.sort(
        key=lambda x:
        x["final_score"],
        reverse=True
    )

    return results


def generate_hiring_recommendation(
    candidate
):
    score = candidate[
        "final_score"
    ]

    risk = candidate[
        "risk_score"
    ]

    if (
        score >= 0.85
        and risk <= 30
    ):
        return "Strong Hire"

    if (
        score >= 0.70
        and risk <= 50
    ):
        return "Hire"

    if (
        score >= 0.50
    ):
        return "Consider"

    return "Reject"