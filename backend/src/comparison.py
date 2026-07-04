from __future__ import annotations

from copy import deepcopy
from typing import Dict, List

from src.candidate_pipeline import (
    CandidatePipeline,
)


class ComparisonEngine:

    def __init__(self):

        self.pipeline = CandidatePipeline()

    def compare(
        self,
        candidates: List[Dict],
        jd_text: str = "",
    ) -> Dict:

        processed = []

        for candidate in candidates:

            processed.append(

                self.pipeline.process(
                    deepcopy(candidate),
                    jd_text,
                )

            )

        processed.sort(

            key=lambda c:
            c["candidate_match"].overall_score,

            reverse=True,

        )

        return {

            "ranking":
                processed,

            "strength_comparison":
                self._strengths(
                    processed
                ),

            "weakness_comparison":
                self._weaknesses(
                    processed
                ),

            "risk_comparison":
                self._risk(
                    processed
                ),

            "recommendation_comparison":
                self._recommendations(
                    processed
                ),

            "winner":
                processed[0]
                if processed
                else None,
        }

    def _strengths(
        self,
        candidates,
    ):

        return {

            candidate.get(
                "parsed_name",
                "Unknown",
            ):

            candidate.get(
                "ai_profile",
                {},
            ).get(
                "strengths",
                [],
            )

            for candidate in candidates

        }

    def _weaknesses(
        self,
        candidates,
    ):

        return {

            candidate.get(
                "parsed_name",
                "Unknown",
            ):

            candidate.get(
                "ai_profile",
                {},
            ).get(
                "concerns",
                [],
            )

            for candidate in candidates

        }

    def _risk(
        self,
        candidates,
    ):

        return {

            candidate.get(
                "parsed_name",
                "Unknown",
            ):

            candidate.get(
                "risk_assessment",
                {},
            )

            for candidate in candidates

        }

    def _recommendations(
        self,
        candidates,
    ):

        return {

            candidate.get(
                "parsed_name",
                "Unknown",
            ):

            candidate.get(
                "ai_profile",
                {},
            ).get(
                "recommendation",
                "",
            )

            for candidate in candidates

        }


engine = ComparisonEngine()


def compare_candidates(
    candidates,
    jd_text="",
):

    return engine.compare(
        candidates,
        jd_text,
    )