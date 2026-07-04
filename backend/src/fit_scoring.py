from typing import Dict


def startup_fit_score(candidate):

    score = 0

    score += len(
        candidate.get(
            "parsed_projects",
        ) or []
    ) * 5

    score += len(
        candidate.get(
            "parsed_open_source",
        ) or []
    ) * 10

    score += len(
        candidate.get(
            "parsed_leadership_signals",
        ) or []
    ) * 5

    return min(score, 100)


def enterprise_fit_score(candidate):

    score = 0

    experience = float(candidate.get(
        "parsed_experience_years") or 0)
    score += experience * 5

    score += len(
        candidate.get(
            "parsed_certifications",
        ) or []
    ) * 5

    return min(score, 100)


def remote_fit_score(candidate):

    score = 50

    score += len(
        candidate.get(
            "parsed_projects",
        ) or []
    ) * 3

    if candidate.get(
        "parsed_github"
    ):
        score += 10

    return min(score, 100)


def leadership_fit_score(candidate):

    score = (
        len(
            candidate.get(
                "parsed_leadership_signals",
            ) or []
        ) * 15
    )

    return min(score, 100)


def generate_fit_scores(candidate):

    return {
        "startup_fit":
            startup_fit_score(candidate),

        "enterprise_fit":
            enterprise_fit_score(candidate),

        "remote_fit":
            remote_fit_score(candidate),

        "leadership_fit":
            leadership_fit_score(candidate)
    }