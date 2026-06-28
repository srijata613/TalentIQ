from typing import Dict

from src.agents.base_agent import BaseAgent
from src.interview_engine import generate_interview_pack


class InterviewAgent(BaseAgent):

    def run(
        self,
        context: Dict
    ) -> Dict:

        if context["results"]:

            context["interview_pack"] = (

                generate_interview_pack(

                    context["results"][0]

                )

            )

        return context