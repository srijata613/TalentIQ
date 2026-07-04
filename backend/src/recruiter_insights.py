from typing import Dict, List


class RecruiterInsights:
    def build(
        self,
        explanation: Dict,
        summary: Dict,
    ) -> Dict:

        recommendation = explanation.get(
            "hiring_recommendation",
            {}
        )

        confidence = explanation.get(
            "confidence",
            {}
        )

        return {

            "key_takeaways":
                self._key_takeaways(
                    explanation,
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

    def _key_takeaways(
        self,
        explanation: Dict,
        summary: Dict,
    ) -> List[str]:

        takeaways = [

            summary.get(
                "executive_summary",
                ""
            )
        ]

        strengths = summary.get(
            "top_strengths",
            []
        )

        if strengths:

            takeaways.append(

                "Strongest areas: "
                + ", ".join(
                    strengths[:3]
                )

            )

        gaps = summary.get(
            "top_gaps",
            []
        )

        if gaps:

            takeaways.append(

                "Primary gaps: "
                + ", ".join(
                    gaps[:3]
                )

            )

        return takeaways

    def _positive_signals(
        self,
        explanation: Dict,
    ) -> List[str]:

        signals = []

        for feature in explanation.get(
            "feature_attribution",
            []
        ):

            if feature.get(
                "impact"
            ) in (
                "Strong Positive",
                "Positive",
            ):

                signals.append(

                    f"{feature['feature']} "
                    f"({feature['score']:.2f})"

                )

        return signals

    def _risk_flags(
        self,
        explanation: Dict,
    ) -> List[str]:

        flags = []

        for gap in explanation.get(
            "gaps",
            []
        ):

            items = gap.get(
                "items",
                []
            )

            if items:

                flags.append(

                    f"{gap['category']}: "
                    + ", ".join(items)

                )

        return flags

    def _interview_priorities(
        self,
        explanation: Dict,
    ) -> List[Dict]:

        priorities = []

        for item in explanation.get(
            "interview_focus",
            []
        ):

            priorities.append({

                "category":
                    item.get(
                        "category"
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
            })

        return priorities