from datetime import datetime
from typing import Dict


def create_merge_record(
    candidate_a: Dict,
    candidate_b: Dict,
    similarity: float,
    reason: str
):

    return {

        "merge_timestamp":
            datetime.utcnow().isoformat(),

        "candidate_a":
            candidate_a.get(
                "parsed_name",
            ),

        "candidate_b":
            candidate_b.get(
                "parsed_name",
            ),

        "similarity_score":
            similarity,

        "merge_reason":
            reason,

        "status":
            "merged"
    }


def create_archive_record(
    archived_candidate
):

    return {

        "candidate":
            archived_candidate.get(
                "parsed_name"
            ),

        "archived_at":
            datetime.utcnow().isoformat(),

        "status":
            "archived"
    }