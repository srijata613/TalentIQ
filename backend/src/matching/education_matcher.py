from __future__ import annotations

from .models import MatchResult

from src.education_bonus import (
    compute_education_score,
)


class EducationMatcher:

    def match(
        self,
        candidate: dict,
        jd_text: str,
    ) -> MatchResult:

        result = MatchResult()

        resume_text = candidate.get(
            "resume_text",
            "",
        )

        score = compute_education_score(
            jd_text,
            resume_text,
        )

        result.score = round(
            score * 100,
            2,
        )

        degrees = candidate.get(
            "parsed_degrees",
            [],
        )

        universities = candidate.get(
            "parsed_universities",
            [],
        )

        cgpa = candidate.get(
            "parsed_cgpa",
        )

        if degrees:

            result.evidence.append(
                "Degree information detected."
            )

            result.matched.extend(degrees)

        else:

            result.evidence.append(
                "No degree information detected."
            )

        if universities:

            result.evidence.append(
                f"{len(universities)} university record(s) detected."
            )

        if cgpa is not None:

            result.evidence.append(
                f"CGPA: {cgpa}"
            )

        return result