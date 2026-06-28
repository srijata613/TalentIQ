from typing import Dict

from src.agents.base_agent import BaseAgent
from src.recruiter_summary import build_recruiter_summary


class SummaryAgent(BaseAgent):

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
            "summary",
            {}
        )

        for index, candidate in enumerate(
            candidates
        ):

            understanding = candidate.get(
                "resume_understanding",
                {}
            )

            evaluation = candidate

            risk = candidate.get(
                "risk_assessment",
                {}
            )

            summary = build_recruiter_summary(

                understanding,

                evaluation,

                risk

            )

            candidate_id = candidate.get(
                "id",
                f"candidate_{index}"
            )

            artifacts[
                "summary"
            ][candidate_id] = summary

            candidate[
                "recruiter_summary"
            ] = summary

        return context