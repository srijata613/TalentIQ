from typing import Dict, List


class RecruiterSummary:
    def build(
        self,
        explanation: Dict,
    ) -> Dict:

        recommendation = explanation.get(
            "hiring_recommendation",
            {}
        )

        confidence = explanation.get(
            "confidence",
            {}
        )

        strengths = self._flatten_items(
            explanation.get(
                "strengths",
                []
            )
        )

        gaps = self._flatten_items(
            explanation.get(
                "gaps",
                []
            )
        )

        interview_topics = []

        for item in explanation.get(
            "interview_focus",
            []
        ):

            interview_topics.extend(
                item.get(
                    "topics",
                    []
                )
            )

        return {

            "headline":
                recommendation.get(
                    "decision",
                    "Unknown"
                ),

            "executive_summary":
                explanation.get(
                    "executive_summary",
                    ""
                ),

            "overall_score":
                explanation.get(
                    "score_breakdown",
                    {}
                ).get(
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
                strengths[:5],

            "top_gaps":
                gaps[:5],

            "recommended_interview_focus":
                interview_topics[:5],

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

    @staticmethod
    def _flatten_items(
        grouped_items: List[Dict],
    ) -> List[str]:

        items = []

        seen = set()

        for group in grouped_items:

            for value in group.get(
                "items",
                [],
            ):

                if value not in seen:

                    seen.add(value)

                    items.append(value)

        return items