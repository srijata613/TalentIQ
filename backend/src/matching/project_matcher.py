from __future__ import annotations

from .models import MatchResult


class ProjectMatcher:

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
        "leadership": [
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

        "rest api": [
            "rest api",
            "rest apis",
            "restful api",
            "restful apis",
            "api development",
            "built rest api",
            "built rest apis",
        ],
    }

    @staticmethod
    def _normalize(text: str) -> str:

        return (
            text.strip()
            .lower()
            .replace("-", " ")
        )

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> MatchResult:

        result = MatchResult()

        project_tech = {
            self._normalize(skill)
            for skill in candidate.get(
                "parsed_project_technologies",
                [],
            )
            if skill
        }

        required_skills = {
            self._normalize(skill)
            for skill in job.get(
                "required_skills",
                [],
            )
            if skill
        }

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

        matched = []
        missing = []

        for required in required_skills:

            matched_flag = False

            if required in project_tech:

                matched_flag = True

            else:

                aliases = self.SEMANTIC_ALIASES.get(
                    required,
                    [required],
                )

                matched_flag = any(
                    self._normalize(alias) in project_text
                    for alias in aliases
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

        result.matched = sorted(set(matched))

        result.missing = sorted(set(missing))

        result.score = round(
            (
                len(result.matched)
                / len(required_skills)
            )
            * 100,
            2,
        )

        leadership = min(
            len(
                candidate.get(
                    "parsed_leadership_signals",
                    [],
                )
            ) / 5,
            1.0,
        ) * 100

        if leadership >= 0.3:

            result.evidence.append(
                "Leadership demonstrated in projects."
            )

        return result