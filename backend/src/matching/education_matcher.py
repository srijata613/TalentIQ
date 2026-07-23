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

        if not resume_text.strip():

            result.evidence.append(
                "Resume text unavailable."
            )

            return result

        if not jd_text.strip():

            result.score = 100.0

            result.evidence.append(
                "Job description unavailable."
            )

            return result

        score = compute_education_score(
            jd_text,
            resume_text,
        )

        result.score = round(
            max(
                0.0,
                min(score, 1.0),
            )
            * 100,
            2,
        )

        degrees = list(
            dict.fromkeys(
                candidate.get(
                    "parsed_degrees",
                    [],
                )
            )
        )

        universities = list(
            dict.fromkeys(
                candidate.get(
                    "parsed_universities",
                    [],
                )
            )
        )

        cgpa = candidate.get(
            "parsed_cgpa",
        )

        if degrees:

            result.evidence.append(
                "Degree information detected."
            )

            result.matched.extend(
                degrees
            )

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