from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

MAX_TAKEAWAY_ITEMS = 3

class RecruiterInsights:

    def build(
        self,
        explanation: dict[str, Any],
        summary: dict[str, Any],
    ) -> dict[str, Any]:

        if not isinstance(explanation, dict):
            raise TypeError(
                "explanation must be a dictionary."
            )

        if not isinstance(summary, dict):
            raise TypeError(
                "summary must be a dictionary."
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

            return {

                "key_takeaways":
                    self._key_takeaways(
                        summary,
                    ),

                "positive_signals":
                    self._positive_signals(
                        explanation,
                    ),

                "risk_flags":
                    self._risk_flags(
                        explanation,
                    ),

                "interview_priorities":
                    self._interview_priorities(
                        explanation,
                    ),

                "decision_support": {

                    "decision":
                        recommendation.get(
                            "decision",
                            "Unknown",
                        ),

                    "priority":
                        recommendation.get(
                            "priority",
                            "Medium",
                        ),

                    "confidence":
                        confidence.get(
                            "level",
                            "Unknown",
                        ),
                },
            }

        except Exception:

            logger.exception(
                "Failed to build recruiter insights."
            )

            raise

    def _key_takeaways(
        self,
        summary: dict[str, Any],
    ) -> list[str]:

        takeaways: list[str] = []

        executive_summary = summary.get(
            "executive_summary",
            "",
        )

        if executive_summary:
            takeaways.append(
                executive_summary
            )

        strengths = summary.get(
            "top_strengths",
            [],
        )

        if strengths:

            takeaways.append(
                "Strongest areas: "
                + ", ".join(
                    strengths[
                        :MAX_TAKEAWAY_ITEMS
                    ]
                )
            )

        gaps = summary.get(
            "top_gaps",
            [],
        )

        if gaps:

            takeaways.append(
                "Primary gaps: "
                + ", ".join(
                    gaps[
                        :MAX_TAKEAWAY_ITEMS
                    ]
                )
            )

        return takeaways

    def _positive_signals(
        self,
        explanation: dict[str, Any],
    ) -> list[str]:

        signals: list[str] = []

        for feature in explanation.get(
            "feature_attribution",
            [],
        ):

            if not isinstance(
                feature,
                dict,
            ):
                continue

            impact = feature.get(
                "impact",
                "",
            )

            if impact not in (
                "Strong Positive",
                "Positive",
            ):
                continue

            name = feature.get(
                "feature",
                "Unknown",
            )

            score = float(
                feature.get(
                    "score",
                    0.0,
                )
            )

            signals.append(
                f"{name} ({score:.2f})"
            )

        return signals

    def _risk_flags(
        self,
        explanation: dict[str, Any],
    ) -> list[str]:

        flags: list[str] = []

        for gap in explanation.get(
            "gaps",
            [],
        ):

            if not isinstance(
                gap,
                dict,
            ):
                continue

            items = gap.get(
                "items",
                [],
            )

            if not items:
                continue

            category = gap.get(
                "category",
                "Unknown",
            )

            flags.append(
                f"{category}: "
                + ", ".join(items)
            )

        return flags

    def _interview_priorities(
        self,
        explanation: dict[str, Any],
    ) -> list[dict[str, Any]]:

        priorities: list[
            dict[str, Any]
        ] = []

        for item in explanation.get(
            "interview_focus",
            [],
        ):

            if not isinstance(
                item,
                dict,
            ):
                continue

            priorities.append(
                {

                    "category":
                        item.get(
                            "category",
                            "Unknown",
                        ),

                    "topics":
                        item.get(
                            "topics",
                            [],
                        ),

                    "reason":
                        item.get(
                            "reason",
                            "",
                        ),
                }
            )

        return priorities