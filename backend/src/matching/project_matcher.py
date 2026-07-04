from __future__ import annotations

from .models import MatchResult


class ProjectMatcher:

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> MatchResult:

        result = MatchResult()

        project_tech = {
            tech.strip().lower()
            for tech in candidate.get(
                "parsed_project_technologies",
                []
            )
            if tech
        }

        required_skills = {
            skill.strip().lower()
            for skill in job.get(
                "required_skills",
                []
            )
            if skill
        }

        if not required_skills:

            result.score = 100.0

            result.evidence.append(
                "No project technology requirements."
            )

            return result

        result.matched = sorted(
            list(project_tech & required_skills)
        )

        result.missing = sorted(
            list(required_skills - project_tech)
        )

        result.score = round(
            (
                len(result.matched)
                / len(required_skills)
            )
            * 100,
            2,
        )

        leadership = candidate.get(
            "leadership_experience",
            0,
        )

        if leadership >= 0.3:

            result.evidence.append(
                "Leadership demonstrated in projects."
            )

        for tech in result.matched:

            result.evidence.append(
                f"Project experience with {tech}"
            )

        return result