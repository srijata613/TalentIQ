from __future__ import annotations

import logging
import re
from typing import Any, Dict, Iterable, List, Set

from .models import MatchResult
from src.knowledge_graph.services.taxonomy_service import (
    TaxonomyService,
)

logger = logging.getLogger(__name__)


class SkillMatcher:
    """
    Performs deterministic skill matching between
    candidate skills and job requirements.
    """

    SEMANTIC_ALIASES: Dict[str, List[str]] = {
        "leadership experience": [
            "led",
            "lead",
            "leading",
            "team lead",
            "managed",
            "management",
            "manager",
        ],
        "mentoring engineers": [
            "mentor",
            "mentored",
            "mentoring",
            "coached",
            "trained",
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

    def __init__(
        self,
        taxonomy: TaxonomyService | None = None,
    ) -> None:

        self.taxonomy = (
            taxonomy
            if taxonomy is not None
            else TaxonomyService()
        )

    @staticmethod
    def _normalize(
        text: str,
    ) -> str:

        return (
            str(text)
            .strip()
            .lower()
            .replace("-", " ")
        )

    @classmethod
    def _normalize_many(
        cls,
        values: Iterable[Any],
    ) -> Dict[str, str]:

        normalized: Dict[str, str] = {}

        for value in values:

            if not value:
                continue

            key = cls._normalize(value)

            normalized.setdefault(
                key,
                str(value),
            )

        return normalized

    @classmethod
    def _candidate_skill_map(
        cls,
        candidate: Dict[str, Any],
    ) -> Dict[str, str]:

        skills = cls._normalize_many(
            candidate.get(
                "parsed_skills",
                [],
            )
        )

        projects = cls._normalize_many(
            candidate.get(
                "parsed_project_technologies",
                [],
            )
        )

        skills.update(
            {
                k: v
                for k, v in projects.items()
                if k not in skills
            }
        )

        return skills

    @classmethod
    def _alias_patterns(
        cls,
        required_skill: str,
        display_name: str,
    ) -> List[re.Pattern]:

        aliases = cls.SEMANTIC_ALIASES.get(
            required_skill,
            [display_name],
        )

        return [
            re.compile(
                rf"\b{re.escape(cls._normalize(alias))}\b"
            )
            for alias in aliases
        ]

    def match(
        self,
        candidate: Dict[str, Any],
        required_skills: List[str],
    ) -> MatchResult:

        if not isinstance(candidate, dict):
            raise TypeError(
                "Candidate must be a dictionary."
            )

        result = MatchResult()

        try:

            if not required_skills:

                result.score = 100.0
                result.evidence.append(
                    "Job does not specify required skills."
                )

                return result

            required_lookup = self._normalize_many(
                required_skills
            )

            candidate_map = self._candidate_skill_map(
                candidate
            )

            resume_text = self._normalize(
                candidate.get(
                    "resume_text",
                    "",
                )
            )

            matched: List[str] = []
            missing: List[str] = []
            evidence: List[str] = []

            for (
                normalized_required,
                display_name,
            ) in required_lookup.items():

                matched_flag = (
                    normalized_required
                    in candidate_map
                )

                if not matched_flag:

                    patterns = self._alias_patterns(
                        normalized_required,
                        display_name,
                    )

                    matched_flag = any(
                        pattern.search(
                            resume_text
                        )
                        for pattern in patterns
                    )

                if matched_flag:

                    matched.append(
                        display_name
                    )

                    category = (
                        self.taxonomy.get_skill_category(
                            normalized_required
                        )
                    )

                    if category:

                        evidence.append(
                            f"Matched '{display_name}' ({category})"
                        )

                    else:

                        evidence.append(
                            f"Matched '{display_name}'"
                        )

                else:

                    missing.append(
                        display_name
                    )

                    evidence.append(
                        f"Missing '{display_name}'"
                    )

            result.matched = sorted(
                set(matched)
            )

            result.missing = sorted(
                set(missing)
            )

            result.evidence = evidence

            result.score = round(
                len(result.matched)
                / len(required_lookup)
                * 100,
                2,
            )

            return result

        except Exception:

            logger.exception(
                "Skill matching failed."
            )

            raise