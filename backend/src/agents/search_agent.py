from typing import Dict

from src.agents.base_agent import BaseAgent
from src.semantic_search import search_similar_candidates


class SearchAgent(BaseAgent):

    def run(
        self,
        context: Dict
    ) -> Dict:

        results = search_similar_candidates(

            query_text=context["parsed_query"]["original_query"],

            candidates=context["results"]

        )

        context["results"] = results

        return context