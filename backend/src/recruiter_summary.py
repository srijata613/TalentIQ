from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

MAX_SUMMARY_ITEMS = 5


class RecruiterSummary:

    def build(
        self,
        explanation: dict[str, Any],
    ) -> dict[str, Any]:

        if not isinstance(explanation, dict):
            raise TypeError(
                "explanation must be a dictionary."
            )

        try:

            recommendation = explanation.get(
                "hiring_recommendation",
                {},
            )

            confidence = explanation.get(
                "confidence",
                {},
            )

            score_breakdown = explanation.get(
                "score_breakdown",
                {},
            )

            strengths = self._flatten_items(
                explanation.get(
                    "strengths",
                    [],
                )
            )

            gaps = self._flatten_items(
                explanation.get(
                    "gaps",
                    [],
                )
            )

            interview_topics = (
                self._flatten_topics(
                    explanation.get(
                        "interview_focus",
                        [],
                    )
                )
            )

            return {

                "headline":
                    recommendation.get(
                        "decision",
                        "Unknown",
                    ),

                "executive_summary":
                    explanation.get(
                        "executive_summary",
                        "",
                    ),

                "overall_score":
                    score_breakdown.get(
                        "overall",
                        0,
                    ),

                "confidence":
                    confidence.get(
                        "level",
                        "Unknown",
                    ),

                "confidence_score":
                    confidence.get(
                        "score",
                        0,
                    ),

                "top_strengths":
                    strengths[
                        :MAX_SUMMARY_ITEMS
                    ],

                "top_gaps":
                    gaps[
                        :MAX_SUMMARY_ITEMS
                    ],

                "recommended_interview_focus":
                    interview_topics[
                        :MAX_SUMMARY_ITEMS
                    ],

                "priority":
                    recommendation.get(
                        "priority",
                        "Medium",
                    ),

                "decision":
                    recommendation.get(
                        "decision",
                        "Unknown",
                    ),
            }

        except Exception:

            logger.exception(
                "Failed to build recruiter summary."
            )

            raise

    @staticmethod
    def _flatten_items(
        grouped_items: list[dict[str, Any]],
    ) -> list[str]:

        items: list[str] = []
        seen: set[str] = set()

        for group in grouped_items:

            if not isinstance(group, dict):
                continue

            for value in group.get(
                "items",
                [],
            ):

                if (
                    not isinstance(value, str)
                    or value in seen
                ):
                    continue

                seen.add(value)
                items.append(value)

        return items

    @staticmethod
    def _flatten_topics(
        grouped_topics: list[dict[str, Any]],
    ) -> list[str]:

        topics: list[str] = []
        seen: set[str] = set()

        for group in grouped_topics:

            if not isinstance(group, dict):
                continue

            for topic in group.get(
                "topics",
                [],
            ):

                if (
                    not isinstance(topic, str)
                    or topic in seen
                ):
                    continue

                seen.add(topic)
                topics.append(topic)

        return topics