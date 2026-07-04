from __future__ import annotations

from copy import deepcopy
from typing import Dict, List

from src.candidate_pipeline import (
    CandidatePipeline,
)


class Ranker:

    def __init__(self):

        self.pipeline = CandidatePipeline()

    def rank(
        self,
        candidates: List[Dict],
        jd_text: str = "",
    ) -> List[Dict]:

        ranked = []

        for candidate in candidates:

            processed = self.pipeline.process(
                deepcopy(candidate),
                jd_text,
            )

            processed["final_score"] = (
                processed[
                    "candidate_match"
                ].overall_score
            )

            ranked.append(
                processed
            )

        ranked.sort(

            key=lambda c: c[
                "final_score"
            ],

            reverse=True,

        )

        return ranked


ranker = Ranker()


def rank_candidates(
    candidates: List[Dict],
    jd_text: str = "",
):

    return ranker.rank(
        candidates,
        jd_text,
    )