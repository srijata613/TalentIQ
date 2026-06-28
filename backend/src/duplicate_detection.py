from typing import Dict, List

from .embeddings import (
    embed_texts,
    cosine_similarity_matrix
)


def normalize(
    value
):
    if not value:
        return ""

    return str(value).strip().lower()


def build_candidate_signature(
    candidate: Dict
):

    parts = []

    parts.append(
        candidate.get(
            "parsed_name",
            ""
        )
    )

    parts.append(
        candidate.get(
            "parsed_email",
            ""
        )
    )

    parts.append(
        candidate.get(
            "parsed_linkedin",
            ""
        )
    )

    parts.append(
        candidate.get(
            "parsed_github",
            ""
        )
    )

    parts.extend(
        candidate.get(
            "parsed_skills",
            []
        )
    )

    parts.extend(
        candidate.get(
            "parsed_projects",
            []
        )
    )

    parts.extend(
        candidate.get(
            "parsed_companies",
            []
        )
    )

    parts.extend(
        candidate.get(
            "parsed_certifications",
            []
        )
    )

    return " ".join(
        str(x)
        for x in parts
        if x
    )


def exact_identity_match(
    candidate_a,
    candidate_b
):

    email_a = normalize(
        candidate_a.get(
            "parsed_email"
        )
    )

    email_b = normalize(
        candidate_b.get(
            "parsed_email"
        )
    )

    if (
        email_a
        and email_b
        and email_a == email_b
    ):
        return True

    github_a = normalize(
        candidate_a.get(
            "parsed_github"
        )
    )

    github_b = normalize(
        candidate_b.get(
            "parsed_github"
        )
    )

    if (
        github_a
        and github_b
        and github_a == github_b
    ):
        return True

    linkedin_a = normalize(
        candidate_a.get(
            "parsed_linkedin"
        )
    )

    linkedin_b = normalize(
        candidate_b.get(
            "parsed_linkedin"
        )
    )

    if (
        linkedin_a
        and linkedin_b
        and linkedin_a == linkedin_b
    ):
        return True

    return False


def detect_duplicates(
    candidates: List[Dict],
    threshold: float = 0.75
):

    duplicates = []

    signatures = [
        build_candidate_signature(
            candidate
        )
        for candidate in candidates
    ]

    embeddings = embed_texts(
        signatures
    )

    similarity = (
        cosine_similarity_matrix(
            embeddings,
            embeddings
        )
    )

    for i in range(
        len(candidates)
    ):

        for j in range(
            i + 1,
            len(candidates)
        ):

            if exact_identity_match(
                candidates[i],
                candidates[j]
            ):

                duplicates.append(
                    {
                        "candidate_a":
                            candidates[i].get(
                                "name",
                                f"candidate_{i}"
                            ),

                        "candidate_b":
                            candidates[j].get(
                                "name",
                                f"candidate_{j}"
                            ),

                        "similarity":
                            1.0,

                        "reason":
                            "Exact identity match"
                    }
                )

                continue

            score = float(
                similarity[i][j]
            )

            if score >= threshold:

                duplicates.append(
                    {
                        "candidate_a":
                            candidates[i].get(
                                "name",
                                f"candidate_{i}"
                            ),

                        "candidate_b":
                            candidates[j].get(
                                "name",
                                f"candidate_{j}"
                            ),

                        "similarity":
                            round(
                                score,
                                4
                            ),

                        "reason":
                            "Semantic profile match"
                    }
                )

    return duplicates