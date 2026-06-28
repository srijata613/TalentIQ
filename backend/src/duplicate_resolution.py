from typing import Dict

from .duplicate_registry import (
    create_merge_record,
    create_archive_record
)

def merge_unique_lists(
    first,
    second
):

    merged = []

    seen = set()

    for item in (
        first + second
    ):

        value = str(
            item
        ).strip()

        if (
            value
            and value.lower()
            not in seen
        ):

            merged.append(
                value
            )

            seen.add(
                value.lower()
            )

    return merged


def candidate_completeness_score(
    candidate: Dict
):

    score = 0

    important_fields = [

        "parsed_email",
        "parsed_phone",
        "parsed_linkedin",
        "parsed_github",
        "parsed_location",
        "parsed_summary",
    ]

    for field in important_fields:

        if candidate.get(field):
            score += 10

    score += len(
        candidate.get(
            "parsed_skills",
            []
        )
    )

    score += len(
        candidate.get(
            "parsed_projects",
            []
        )
    )

    score += len(
        candidate.get(
            "parsed_companies",
            []
        )
    )

    score += len(
        candidate.get(
            "parsed_certifications",
            []
        )
    )

    return score


def choose_primary_candidate(
    candidate_a,
    candidate_b
):

    score_a = (
        candidate_completeness_score(
            candidate_a
        )
    )

    score_b = (
        candidate_completeness_score(
            candidate_b
        )
    )

    if score_b > score_a:

        return (
            candidate_b,
            candidate_a
        )

    return (
        candidate_a,
        candidate_b
    )


def merge_candidates(
    candidate_a,
    candidate_b
):

    primary, archive = (
        choose_primary_candidate(
            candidate_a,
            candidate_b
        )
    )

    merged = dict(primary)

    merged[
        "parsed_skills"
    ] = merge_unique_lists(
        primary.get(
            "parsed_skills",
            []
        ),
        archive.get(
            "parsed_skills",
            []
        )
    )

    merged[
        "parsed_projects"
    ] = merge_unique_lists(
        primary.get(
            "parsed_projects",
            []
        ),
        archive.get(
            "parsed_projects",
            []
        )
    )

    merged[
        "parsed_companies"
    ] = merge_unique_lists(
        primary.get(
            "parsed_companies",
            []
        ),
        archive.get(
            "parsed_companies",
            []
        )
    )

    merged[
        "parsed_certifications"
    ] = merge_unique_lists(
        primary.get(
            "parsed_certifications",
            []
        ),
        archive.get(
            "parsed_certifications",
            []
        )
    )
    
    merge_record = create_merge_record(
        primary,
        archive,
        similarity=1.0,
        reason="Duplicate merge"
    )
    
    archive_record = create_archive_record(
        archive
    )

    return {

        "primary_candidate":
            primary.get(
                "name"
            ),

        "archive_candidate":
            archive.get(
                "name"
            ),

        "merged_profile":
            merged,
            
        "merge_record":
            merge_record,
            
        "archive_record":
            archive_record
    }