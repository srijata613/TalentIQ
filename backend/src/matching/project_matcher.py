from __future__ import annotations

import logging
import re
from typing import Any, Dict, Iterable, List, Set

from .models import MatchResult

logger = logging.getLogger(__name__)

MAX_LEADERSHIP_SIGNALS = 5

SEMANTIC_ALIASES: Dict[str, List[str]] = {
    "leadership": [
        "led",
        "lead",
        "leading",
        "team lead",
        "managed",
        "management",
        "manager",
    ],
    "leadership experience": [
        "led",
        "lead",
        "leading",
        "team lead",
        "managed",
        "management",
        "manager",
    ],
    "mentoring": [
        "mentor",
        "mentored",
        "mentoring",
        "coached",
        "trained",
    ],
    "mentoring engineers": [
        "mentor",
        "mentored",
        "mentoring",
        "coached",
        "trained",
    ],
    "rest api": [
        "rest api",
        "rest apis",
        "restful api",
        "restful apis",
        "api development",
        "built rest api",
        "built rest apis",
    ],
    "rest api development": [
        "rest api",
        "rest apis",
        "restful api",
        "restful apis",
        "api development",
        "built rest api",
        "built rest apis",
    ],
    "cloud deployment": [
        "deploy",
        "deployed",
        "deployment",
        "deployed applications",
        "deployed services",
    ],
}


class ProjectMatcher:
    @staticmethod
    def _normalize(text: str) -> str:
        return (
            str(text)
            .strip()
            .lower()
            .replace("-", " ")
        )

    @classmethod
    def _normalize_set(
        cls,
        values: Iterable[Any],
    ) -> Set[str]:

        return {
            cls._normalize(value)
            for value in values
            if value
        }

    @classmethod
    def _match_alias(
        cls,
        required: str,
        project_text: str,
    ) -> bool:

        aliases = SEMANTIC_ALIASES.get(
            required,
            [required],
        )

        for alias in aliases:

            pattern = re.compile(
                rf"\b{re.escape(cls._normalize(alias))}\b"
            )

            if pattern.search(project_text):
                return True

        return False

    def match(
        self,
        candidate: Dict[str, Any],
        job: Dict[str, Any],
    ) -> MatchResult:

        if not isinstance(candidate, dict):
            raise TypeError(
                "Candidate must be a dictionary."
            )

        if not isinstance(job, dict):
            raise TypeError(
                "Job must be a dictionary."
            )

        result = MatchResult()

        try:

            project_tech = self._normalize_set(
                candidate.get(
                    "parsed_project_technologies",
                    [],
                )
            )

            required_skills = self._normalize_set(
                job.get(
                    "required_skills",
                    [],
                )
            )

            if not required_skills:

                result.score = 100.0
                result.evidence.append(
                    "No project technology requirements."
                )

                return result

            project_text = self._normalize(
                " ".join(
                    candidate.get(
                        "parsed_projects",
                        [],
                    )
                )
            )

            matched: List[str] = []
            missing: List[str] = []

            for required in sorted(required_skills):

                matched_flag = (
                    required in project_tech
                )

                if not matched_flag:
                    matched_flag = self._match_alias(
                        required,
                        project_text,
                    )

                if matched_flag:

                    matched.append(required)

                    result.evidence.append(
                        f"Project experience with {required}"
                    )

                else:

                    missing.append(required)

                    result.evidence.append(
                        f"Missing project experience with {required}"
                    )

            result.matched = matched
            result.missing = missing

            result.score = round(
                (
                    len(matched)
                    / len(required_skills)
                )
                * 100,
                2,
            )

            leadership_score = (
                min(
                    len(
                        candidate.get(
                            "parsed_leadership_signals",
                            [],
                        )
                    )
                    / MAX_LEADERSHIP_SIGNALS,
                    1.0,
                )
                * 100
            )

            if leadership_score > 0:

                result.evidence.append(
                    "Leadership demonstrated in projects."
                )

            return result

        except Exception:

            logger.exception(
                "Project matching failed."
            )

            raise