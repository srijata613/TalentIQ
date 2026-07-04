from typing import Any, Dict, List, Optional


class ResponseBuilder:
    @staticmethod
    def build(
        candidate: Dict[str, Any],
        explanation: Dict[str, Any],
        summary: Dict[str, Any],
        insights: Dict[str, Any],
    ) -> Dict[str, Any]:

        return {

            "candidate": {

                "name":
                    candidate.get(
                        "parsed_name"
                    ),

                "email":
                    candidate.get(
                        "parsed_email"
                    ),

                "phone":
                    candidate.get(
                        "parsed_phone"
                    ),

                "location":
                    candidate.get(
                        "parsed_location"
                    ),

                "experience_years":
                    candidate.get(
                        "parsed_experience_years"
                    ),

                "skills":
                    candidate.get(
                        "parsed_skills",
                        [],
                    ),
            },

            "summary":
                summary,

            "insights":
                insights,

            "explanation":
                explanation,

            "match": {

                "overall_score":
                    explanation.get(
                        "score_breakdown",
                        {},
                    ).get(
                        "overall",
                        0,
                    ),

                "recommendation":
                    explanation.get(
                        "hiring_recommendation",
                        {},
                    ),

                "confidence":
                    explanation.get(
                        "confidence",
                        {},
                    ),
            },
        }

    @staticmethod
    def success(
        intent: str,
        execution_plan: List[str],
        data: Dict[str, Any],
    ) -> Dict[str, Any]:

        return {

            "success": True,

            "intent":
                intent,

            "execution_plan":
                execution_plan,

            "data":
                data,
        }

    @staticmethod
    def error(
        message: str,
        execution_plan: Optional[List[str]] = None,
    ) -> Dict[str, Any]:

        return {

            "success": False,

            "message":
                message,

            "execution_plan":
                execution_plan or [],
        }