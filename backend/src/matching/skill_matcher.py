from __future__ import annotations

from .models import MatchResult

from src.knowledge_graph.services.taxonomy_service import (
    TaxonomyService,
)


class SkillMatcher:

    def __init__(self):

        self.taxonomy = TaxonomyService()

    @staticmethod
    def _normalize(skill: str) -> str:

        return (
            skill.strip()
            .lower()
            .replace("-", " ")
        )

    def match(
        self,
        candidate_skills: list[str],
        required_skills: list[str],
    ) -> MatchResult:

        result = MatchResult()

        if not required_skills:
            result.score = 100.0
            result.evidence.append(
                "Job does not specify required skills."
            )
            return result

        candidate_map = {}

        for skill in candidate_skills:

            normalized = self._normalize(skill)

            candidate_map[normalized] = skill

        matched = []
        missing = []
        evidence = []

        for required in required_skills:

            normalized_required = self._normalize(
                required
            )

            if normalized_required in candidate_map:

                matched.append(required)

                category = (
                    self.taxonomy.get_skill_category(
                        normalized_required
                    )
                )

                if category:

                    evidence.append(
                        f"Matched '{required}' ({category})"
                    )

                else:

                    evidence.append(
                        f"Matched '{required}'"
                    )

            else:

                missing.append(required)

                evidence.append(
                    f"Missing '{required}'"
                )

        result.matched = sorted(
            list(set(matched))
        )

        result.missing = sorted(
            list(set(missing))
        )

        result.evidence = evidence

        result.score = round(
            (
                len(result.matched)
                /
                len(required_skills)
            )
            * 100,
            2,
        )

        return result