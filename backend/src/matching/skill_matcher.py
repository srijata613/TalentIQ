from __future__ import annotations

import re

from .models import MatchResult

from src.knowledge_graph.services.taxonomy_service import (
    TaxonomyService,
)


class SkillMatcher:

    SEMANTIC_ALIASES = {

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
        candidate : dict,
        required_skills: list[str],
    ) -> MatchResult:

        result = MatchResult()

        if not required_skills:
            result.score = 100.0
            result.evidence.append("Job does not specify required skills.")
            return result

        required_lookup = {}
        normalized_required_skills = []

        for skill in required_skills:
            if not skill:
                continue

            normalized = self._normalize(skill)

            if normalized not in required_lookup:
                required_lookup[normalized] = skill
                normalized_required_skills.append(normalized)

        candidate_map = {}

        for skill in candidate.get("parsed_skills", []):
            if not skill:
                continue
            candidate_map[self._normalize(skill)] = skill

        for skill in candidate.get("parsed_project_technologies", []):
            if not skill:
                continue
            candidate_map.setdefault(self._normalize(skill), skill)

        resume_text = self._normalize(candidate.get("resume_text", ""))

        matched = []
        missing = []
        evidence = []

        for normalized_required in normalized_required_skills:
            display_name = required_lookup[normalized_required]

            if normalized_required in candidate_map:
                matched_flag = True
            else:
                aliases = self.SEMANTIC_ALIASES.get(normalized_required, [display_name])

                matched_flag = any(
                    re.search(rf"\b{re.escape(self._normalize(alias))}\b", resume_text)
                    for alias in aliases
                )

            if matched_flag:
                matched.append(display_name)

                category = self.taxonomy.get_skill_category(normalized_required)

                if category:
                    evidence.append(f"Matched '{display_name}' ({category})")
                else:
                    evidence.append(f"Matched '{display_name}'")
            else:
                missing.append(display_name)
                evidence.append(f"Missing '{display_name}'")

        result.matched = sorted(matched)
        result.missing = sorted(missing)
        result.evidence = evidence

        result.score = round(len(matched) / len(normalized_required_skills) * 100, 2) if normalized_required_skills else 0.0

        return result