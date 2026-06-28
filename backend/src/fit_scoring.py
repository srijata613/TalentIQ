from typing import Dict


def startup_fit_score(candidate):

    score = 0

    score += len(
        candidate.get(
            "parsed_projects",
            []
        )
    ) * 5

    score += len(
        candidate.get(
            "parsed_open_source",
            []
        )
    ) * 10

    score += len(
        candidate.get(
            "parsed_leadership_signals",
            []
        )
    ) * 5

    return min(score, 100)


def enterprise_fit_score(candidate):

    score = 0

    score += candidate.get(
        "parsed_experience_years",
        0
    ) * 5

    score += len(
        candidate.get(
            "parsed_certifications",
            []
        )
    ) * 5

    return min(score, 100)


def remote_fit_score(candidate):

    score = 50

    score += len(
        candidate.get(
            "parsed_projects",
            []
        )
    ) * 3

    score += len(
        candidate.get(
            "parsed_github",
            []
        )
    ) * 10

    return min(score, 100)


def leadership_fit_score(candidate):

    score = (
        len(
            candidate.get(
                "parsed_leadership_signals",
                []
            )
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