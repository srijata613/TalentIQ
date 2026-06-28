from typing import Dict

from src.agents.base_agent import BaseAgent
from src.recommendations import generate_recommendations


class RecommendationAgent(BaseAgent):

    def run(
        self,
        context: Dict
    ) -> Dict:

        candidates = context.get(
            "results",
            []
        )

        artifacts = context.setdefault(
            "artifacts",
            {}
        )

        artifacts.setdefault(
            "recommendations",
            {}
        )

        for index, candidate in enumerate(
            candidates
        ):

            recommendation = generate_recommendations(

                missing_skills=candidate.get(
                    "missing_skills",
                    []
                ),

                candidate_skills=candidate.get(
                    "matched_skills",
                    candidate.get(
                        "parsed_skills",
                        []
                    )
                )

            )

            candidate_id = candidate.get(
                "id",
                f"candidate_{index}"
            )

            artifacts[
                "recommendations"
            ][candidate_id] = recommendation

            candidate[
                "recommendations"
            ] = recommendation

        return context