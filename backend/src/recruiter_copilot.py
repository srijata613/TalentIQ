from typing import Dict, List

from src.query_understanding import parse_query
from src.execution_planner import build_execution_plan
from src.execution_engine import ExecutionEngine
from src.response_builder import ResponseBuilder


class RecruiterCopilot:

    def __init__(self):

        self.engine = ExecutionEngine()


    def answer(
        self,
        query: str,
        candidates: List[Dict]
    ):

        parsed = parse_query(query)

        parsed["original_query"] = query

        execution_plan = build_execution_plan(
            parsed
        )

        try:

            context = self.engine.execute(

                execution_plan=execution_plan,

                parsed_query=parsed,

                candidates=candidates

            )

            return ResponseBuilder.success(

                intent=parsed["intent"],

                execution_plan=execution_plan,

                data={

                    "filters": parsed,

                    "results":
                        context.get(
                            "results",
                            []
                        ),

                    "shortlist":
                        context.get(
                            "shortlist"
                        ),

                    "interview_pack":
                        context.get(
                            "interview_pack"
                        ),

                    "explanation":
                        context.get(
                            "explanation"
                        )
                }
            )

        except Exception as e:

            return ResponseBuilder.error(

                message=str(e),

                execution_plan=execution_plan

            )