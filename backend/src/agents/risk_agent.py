from typing import Dict

from src.agents.base_agent import BaseAgent
from src.risk_assessment import calculate_risk_score


class RiskAgent(BaseAgent):

    def run(
        self,
        context: Dict
    ) -> Dict:

        candidates = context.get(
            "results",
            []
        )

        for candidate in candidates:

            risk = calculate_risk_score(
                candidate
            )

            candidate[
                "risk_assessment"
            ] = risk

            candidate[
                "risk_score"
            ] = risk[
                "risk_score"
            ]

            candidate[
                "risk_level"
            ] = risk[
                "risk_level"
            ]

        return context