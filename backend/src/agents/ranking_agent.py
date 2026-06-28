from typing import Dict

from src.agents.base_agent import BaseAgent


class RankingAgent(BaseAgent):

    def run(
        self,
        context: Dict
    ) -> Dict:

        for candidate in context["results"]:

            candidate["ranking_score"] = (

                0.75 *
                candidate.get("final_score", 0)

                +

                0.25 *
                candidate.get("semantic_score", 0)

            )

        context["results"] = sorted(

            context["results"],

            key=lambda x:
                x["ranking_score"],

            reverse=True
        )

        return context