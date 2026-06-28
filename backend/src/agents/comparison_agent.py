from typing import Dict

from src.agents.base_agent import BaseAgent
from src.comparison import compare_candidates


class ComparisonAgent(BaseAgent):

    def run(
        self,
        context: Dict
    ) -> Dict:

        candidates = context.get(
            "results",
            []
        )

        parsed_query = context.get(
            "parsed_query",
            {}
        )

        artifacts = context.setdefault(
            "artifacts",
            {}
        )

        artifacts.setdefault(
            "comparison",
            {}
        )

        if len(candidates) < 2:
            return context

        job_description = parsed_query.get(
            "job_description",
            ""
        )

        resumes = [

            candidate.get(
                "resume_text",
                ""
            )

            for candidate in candidates

        ]

        comparison = compare_candidates(

            job_description,

            resumes

        )

        artifacts[
            "comparison"
        ] = comparison

        context[
            "comparison"
        ] = comparison

        return context