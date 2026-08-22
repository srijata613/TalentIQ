from __future__ import annotations

import logging
from copy import deepcopy
from typing import Any, Dict, List, Optional

from src.candidate_pipeline import CandidatePipeline

logger = logging.getLogger(__name__)


class Ranker:
    """
    Production-grade candidate ranking service.

    Responsibilities
    ----------------
    - Execute the candidate pipeline
    - Compute final ranking score
    - Ignore malformed candidates
    - Return candidates sorted by score
    """

    def __init__(
        self,
        pipeline: Optional[CandidatePipeline] = None,
    ) -> None:
        self.pipeline = pipeline or CandidatePipeline()

    def rank(
        self,
        candidates: List[Dict[str, Any]],
        jd_text: str = "",
    ) -> List[Dict[str, Any]]:
        """
        Rank candidates against a job description.

        Parameters
        ----------
        candidates:
            Parsed candidate dictionaries.

        jd_text:
            Job description.

        Returns
        -------
        List[Dict[str, Any]]
            Ranked candidates.
        """

        if not candidates:
            return []

        ranked: List[Dict[str, Any]] = []

        for index, candidate in enumerate(candidates):

            if not isinstance(candidate, dict):
                logger.warning(
                    "Skipping candidate %d because it is not a dictionary.",
                    index,
                )
                continue

            try:
                processed = self.pipeline.process(
                    deepcopy(candidate),
                    jd_text,
                )

                candidate_match = processed.get("candidate_match")

                if candidate_match is None:
                    logger.warning(
                        "Candidate %d has no candidate_match.",
                        index,
                    )
                    continue

                score = getattr(
                    candidate_match,
                    "overall_score",
                    None,
                )

                if score is None:
                    logger.warning(
                        "Candidate %d has no overall_score.",
                        index,
                    )
                    continue

                processed["final_score"] = float(score)

                ranked.append(processed)

            except Exception:
                logger.exception(
                    "Failed processing candidate %d.",
                    index,
                )

        ranked.sort(
            key=lambda candidate: (
                candidate["final_score"],
                candidate.get("parsed_name") or "",
            ),
            reverse=True,
        )

        return ranked


ranker = Ranker()


def rank_candidates(
    candidates: List[Dict[str, Any]],
    jd_text: str = "",
) -> List[Dict[str, Any]]:
    """
    Convenience wrapper around Ranker.
    """

    return ranker.rank(
        candidates=candidates,
        jd_text=jd_text,
    )