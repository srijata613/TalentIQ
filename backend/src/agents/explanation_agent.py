from typing import Dict

from src.agents.base_agent import BaseAgent
from src.ranking_explainer import RankingExplainer


class ExplanationAgent(BaseAgent):

    def __init__(self):

        super().__init__()

        self.explainer = RankingExplainer()

    def run(
        self,
        context: Dict
    ) -> Dict:

        if context["results"]:

            context["explanation"] = (

                self.explainer.explain(

                    context["results"][0]

                )

            )

        return context