from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

DEFAULT_LIST: list[Any] = []
DEFAULT_DICT: dict[str, Any] = {}


class ResponseBuilder:

    @staticmethod
    def build(
        candidate: dict[str, Any],
        explanation: dict[str, Any],
        summary: dict[str, Any],
        insights: dict[str, Any],
    ) -> dict[str, Any]:

        for name, value in (
            ("candidate", candidate),
            ("explanation", explanation),
            ("summary", summary),
            ("insights", insights),
        ):

            if not isinstance(value, dict):
                raise TypeError(
                    f"{name} must be a dictionary."
                )

        try:

            score_breakdown = explanation.get(
                "score_breakdown",
                DEFAULT_DICT,
            )

            recommendation = explanation.get(
                "hiring_recommendation",
                DEFAULT_DICT,
            )

            confidence = explanation.get(
                "confidence",
                DEFAULT_DICT,
            )

            return {

                "candidate": {

                    "name":
                        candidate.get(
                            "parsed_name",
                        ),

                    "email":
                        candidate.get(
                            "parsed_email",
                        ),

                    "phone":
                        candidate.get(
                            "parsed_phone",
                        ),

                    "location":
                        candidate.get(
                            "parsed_location",
                        ),

                    "experience_years":
                        candidate.get(
                            "parsed_experience_years",
                        ),

                    "skills":
                        candidate.get(
                            "parsed_skills",
                            DEFAULT_LIST,
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
                        score_breakdown.get(
                            "overall",
                            0.0,
                        ),

                    "recommendation":
                        recommendation,

                    "confidence":
                        confidence,
                },
            }

        except Exception:

            logger.exception(
                "Failed to build response payload."
            )

            raise

    @staticmethod
    def success(
        intent: str,
        execution_plan: list[str],
        data: dict[str, Any],
    ) -> dict[str, Any]:

        if not isinstance(intent, str):
            raise TypeError(
                "intent must be a string."
            )

        if not isinstance(execution_plan, list):
            raise TypeError(
                "execution_plan must be a list."
            )

        if not isinstance(data, dict):
            raise TypeError(
                "data must be a dictionary."
            )

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
        execution_plan: list[str] | None = None,
    ) -> dict[str, Any]:

        if not isinstance(message, str):
            raise TypeError(
                "message must be a string."
            )

        return {

            "success": False,

            "message":
                message,

            "execution_plan":
                execution_plan or [],
        }