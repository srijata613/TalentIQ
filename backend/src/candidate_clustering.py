from typing import List, Dict

from .config import DOMAIN_KEYWORDS


def detect_candidate_domain(
    candidate: Dict
):

    skills = [

        skill.lower()

        for skill in candidate.get(
            "parsed_skills",
            []
        )
    ]

    scores = {}

    for domain, keywords in (
        DOMAIN_KEYWORDS.items()
    ):

        score = len(
            set(skills).intersection(
                set(
                    keyword.lower()
                    for keyword in keywords
                )
            )
        )

        scores[domain] = score

    if not scores:
        return "unknown"

    best_domain = max(
        scores,
        key=scores.get
    )

    if scores[best_domain] == 0:
        return "unknown"

    return best_domain


def cluster_candidates(
    candidates: List[Dict]
):

    clusters = {}

    for candidate in candidates:

        domain = detect_candidate_domain(
            candidate
        )

        if domain not in clusters:
            clusters[domain] = []

        clusters[domain].append(
            candidate
        )

    return clusters