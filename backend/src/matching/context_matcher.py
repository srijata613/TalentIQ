from __future__ import annotations

import logging
from typing import Any, Dict

from .models import MatchResult
from src.fit_scoring import generate_fit_scores

logger = logging.getLogger(__name__)

MATCH_THRESHOLD = 70.0


class ContextMatcher:
    """
    Matches candidate contextual fit signals against
    organization expectations using the fit scoring engine.
    """

    @staticmethod
    def _clamp(score: float) -> float:
        return max(0.0, min(score, 100.0))

    @staticmethod
    def _build_result(
        scores: Dict[str, float],
    ) -> MatchResult:

        result = MatchResult()

        if not scores:

            result.score = 0.0

            result.evidence.append(
                "No contextual fit signals available."
            )

            return result

        numeric_scores = [
            float(value)
            for value in scores.values()
        ]

        result.score = round(
            max(
                0.0,
                min(
                    sum(numeric_scores)
                    / len(numeric_scores),
                    100.0,
                ),
            ),
            2,
        )

        for key in sorted(scores):

            value = float(scores[key])

            result.evidence.append(
                f"{key}: {value:.2f}"
            )

            if value >= MATCH_THRESHOLD:

                result.matched.append(key)

            else:

                result.missing.append(key)

        return result

    def match(
        self,
        candidate: Dict[str, Any],
        job: Dict[str, Any],
    ) -> MatchResult:

        if not isinstance(candidate, dict):
            raise TypeError(
                "Candidate must be a dictionary."
            )

        if not isinstance(job, dict):
            raise TypeError(
                "Job must be a dictionary."
            )

        try:

            scores = generate_fit_scores(
                candidate
            )

            if not isinstance(scores, dict):

                raise TypeError(
                    "generate_fit_scores() must return a dictionary."
                )

            normalized_scores: Dict[str, float] = {}

            for key, value in scores.items():

                try:

                    normalized_scores[key] = self._clamp(
                        float(value)
                    )

                except (TypeError, ValueError):

                    logger.debug(
                        "Ignoring invalid context score '%s'=%r",
                        key,
                        value,
                    )

            return self._build_result(
                normalized_scores
            )

        except Exception:

            logger.exception(
                "Context matching failed."
            )

            raise