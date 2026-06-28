from typing import Dict, List

import time

from src.agents.comparison_agent import ComparisonAgent
from src.agents.summary_agent import SummaryAgent
from src.agents.risk_agent import RiskAgent
from src.workflow_planner import WorkflowPlanner

from src.agents.search_agent import SearchAgent
from src.agents.ranking_agent import RankingAgent
from src.agents.interview_agent import InterviewAgent
from src.agents.explanation_agent import ExplanationAgent
from src.agents.shortlisting_agent import ShortlistingAgent
from src.agents.recommendation_agent import RecommendationAgent

class ExecutionEngine:

    def __init__(self):

        self.workflow = WorkflowPlanner()

        self.agents = {

            "semantic_search": SearchAgent(),

            "ranking": RankingAgent(),
            
            "risk_assessment": RiskAgent(),
            
            "recommendations": RecommendationAgent(),
            
            "summary": SummaryAgent(),
            
            "comparison": ComparisonAgent(),

            "interview": InterviewAgent(),

            "explanation": ExplanationAgent(),

            "shortlisting": ShortlistingAgent()

        }

    def execute(

        self,

        execution_plan: List[str],

        parsed_query: Dict,

        candidates: List[Dict]

    ):

        expanded_plan = self.workflow.expand(
            execution_plan
        )

        context = {

            "parsed_query": parsed_query,

            "candidates": candidates,

            "results": candidates,

            "requested_execution_plan":
                execution_plan,

            "expanded_execution_plan":
                expanded_plan,

            "execution_log": [],

            "metadata": {}

        }

        for step in expanded_plan:

            agent = self.agents.get(step)

            if agent is None:

                context["metadata"][step] = {

                    "status": "skipped",

                    "reason": "No registered agent."

                }

                continue

            context["execution_log"].append({

                "step": step,

                "agent": agent.__class__.__name__,

                "status": "started"

            })

            start = time.perf_counter()

            try:

                context = agent.run(
                    context
                )

                elapsed = (
                    time.perf_counter() - start
                ) * 1000

                context["metadata"][step] = {

                    "status": "success",

                    "agent":
                        agent.__class__.__name__,

                    "execution_ms":
                        round(
                            elapsed,
                            2
                        )

                }

                context["execution_log"][-1][
                    "status"
                ] = "completed"

            except Exception as e:

                elapsed = (
                    time.perf_counter() - start
                ) * 1000

                context["metadata"][step] = {

                    "status": "failed",

                    "agent":
                        agent.__class__.__name__,

                    "execution_ms":
                        round(
                            elapsed,
                            2
                        ),

                    "error":
                        str(e)

                }

                context["execution_log"][-1][
                    "status"
                ] = "failed"

                break

        return context