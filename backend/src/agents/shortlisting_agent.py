from typing import Dict

from src.agents.base_agent import BaseAgent
from src.shortlisting import generate_shortlist


class ShortlistingAgent(BaseAgent):

    def run(
        self,
        context: Dict
    ) -> Dict:

        context["shortlist"] = generate_shortlist(

            context["results"]

        )

        return context