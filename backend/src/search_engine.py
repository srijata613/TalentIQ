from typing import Dict, List


def matches_skills(
    candidate: Dict,
    required_skills: List[str]
):

    if not required_skills:
        return True

    candidate_skills = {

        skill.lower()

        for skill in candidate.get(
            "parsed_skills",
            []
        )
    }

    required_skills = {

        skill.lower()

        for skill in required_skills
    }

    return required_skills.issubset(
        candidate_skills
    )


def matches_domain(
    candidate: Dict,
    domain: str
):

    if not domain:
        return True

    candidate_domains = [

        d.lower()

        for d in candidate.get(
            "implicit_skills",
            []
        )
    ]

    return domain.lower() in candidate_domains


def matches_experience(
    candidate: Dict,
    min_years: float
):

    experience = candidate.get(
        "parsed_experience_years",
        0
    )

    return experience >= min_years


def matches_certification(
    candidate: Dict,
    certification: str
):

    if not certification:
        return True

    certs = [

        c.lower()

        for c in candidate.get(
            "parsed_certifications",
            []
        )
    ]

    return certification.lower() in certs


def matches_fit(
    candidate: Dict,
    fit_type: str,
    threshold: int = 60
):

    if not fit_type:
        return True

    score = candidate.get(
        fit_type,
        0
    )

    return score >= threshold


def search_candidates(
    candidates: List[Dict],
    skills: List[str] = None,
    domain: str = None,
    min_experience: float = 0,
    certification: str = None,
    fit_type: str = None,
    min_score: float = 0
):

    results = []

    for candidate in candidates:

        if not matches_skills(
            candidate,
            skills or []
        ):
            continue

        if not matches_domain(
            candidate,
            domain
        ):
            continue

        if not matches_experience(
            candidate,
            min_experience
        ):
            continue

        if not matches_certification(
            candidate,
            certification
        ):
            continue

        if not matches_fit(
            candidate,
            fit_type
        ):
            continue

        if (
            candidate.get(
                "final_score",
                0
            ) < min_score
        ):
            continue

        results.append(
            candidate
        )

    results.sort(
        key=lambda x: (
            x.get("final_score", 0),
            x.get("startup_fit", 0),
            -x.get("risk_score", 0),
        ),
        reverse=True,
    )

    return results