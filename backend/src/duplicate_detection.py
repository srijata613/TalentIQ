from __future__ import annotations

import logging
from typing import Any

from .config import DUPLICATE_THRESHOLD
from .embeddings import (
    cosine_similarity_matrix,
    embed_texts,
)

logger = logging.getLogger(__name__)

IDENTITY_FIELDS = (
    "parsed_email",
    "parsed_github",
    "parsed_linkedin",
)

SIGNATURE_FIELDS = (
    "parsed_name",
    "parsed_email",
    "parsed_linkedin",
    "parsed_github",
)

LIST_SIGNATURE_FIELDS = (
    "parsed_skills",
    "parsed_projects",
    "parsed_companies",
    "parsed_certifications",
)


def normalize(
    value: Any,
) -> str:

    if value is None:
        return ""

    return str(value).strip().lower()


def build_candidate_signature(
    candidate: dict[str, Any],
) -> str:

    if not isinstance(candidate, dict):
        raise TypeError(
            "candidate must be a dictionary."
        )

    parts: list[str] = []

    for field in SIGNATURE_FIELDS:

        value = normalize(
            candidate.get(field)
        )

        if value:
            parts.append(value)

    for field in LIST_SIGNATURE_FIELDS:

        values = candidate.get(field, [])

        if not isinstance(values, list):
            continue

        parts.extend(
            normalize(item)
            for item in values
            if item
        )

    return " ".join(parts)


def exact_identity_match(
    candidate_a: dict[str, Any],
    candidate_b: dict[str, Any],
) -> bool:

    for field in IDENTITY_FIELDS:

        value_a = normalize(
            candidate_a.get(field)
        )

        value_b = normalize(
            candidate_b.get(field)
        )

        if (
            value_a
            and value_b
            and value_a == value_b
        ):
            return True

    return False


def _candidate_name(
    candidate: dict[str, Any],
    index: int,
) -> str:

    return (
        candidate.get("parsed_name")
        or candidate.get("name")
        or f"candidate_{index}"
    )


def detect_duplicates(
    candidates: list[dict[str, Any]],
    threshold: float = DUPLICATE_THRESHOLD,
) -> list[dict[str, Any]]:

    if not isinstance(candidates, list):
        raise TypeError(
            "candidates must be a list."
        )

    try:

        if len(candidates) < 2:
            return []

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
                embeddings,
            )
        )

        duplicates: list[
            dict[str, Any]
        ] = []

        for i in range(
            len(candidates)
        ):

            for j in range(
                i + 1,
                len(candidates),
            ):

                if exact_identity_match(
                    candidates[i],
                    candidates[j],
                ):

                    duplicates.append(
                        {

                            "candidate_a":
                                _candidate_name(
                                    candidates[i],
                                    i,
                                ),

                            "candidate_b":
                                _candidate_name(
                                    candidates[j],
                                    j,
                                ),

                            "similarity":
                                1.0,

                            "reason":
                                "Exact identity match",
                        }
                    )

                    continue

                score = float(
                    similarity[i][j]
                )

                if score < threshold:
                    continue

                duplicates.append(
                    {

                        "candidate_a":
                            _candidate_name(
                                candidates[i],
                                i,
                            ),

                        "candidate_b":
                            _candidate_name(
                                candidates[j],
                                j,
                            ),

                        "similarity":
                            round(
                                score,
                                4,
                            ),

                        "reason":
                            "Semantic profile match",
                    }
                )

        return duplicates

    except Exception:

        logger.exception(
            "Duplicate detection failed."
        )

        raise