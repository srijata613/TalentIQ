from __future__ import annotations

import logging
from typing import Any, Dict, Iterable, List

from .models import MatchResult
from src.education_bonus import (
    compute_education_score,
)

logger = logging.getLogger(__name__)


class EducationMatcher:
    """
    Matches candidate education against the job description
    using the education scoring engine.
    """

    @staticmethod
    def _clamp(score: float) -> float:
        return max(0.0, min(score, 1.0))

    @staticmethod
    def _unique(values: Iterable[Any]) -> List[str]:
        seen = set()
        unique: List[str] = []

        for value in values:

            if not value:
                continue

            text = str(value).strip()

            if text not in seen:
                seen.add(text)
                unique.append(text)

        return unique

    def match(
        self,
        candidate: Dict[str, Any],
        jd_text: str,
    ) -> MatchResult:

        if not isinstance(candidate, dict):
            raise TypeError(
                "Candidate must be a dictionary."
            )

        if not isinstance(jd_text, str):
            raise TypeError(
                "Job description must be a string."
            )

        result = MatchResult()

        try:

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

            raw_score = compute_education_score(
                jd_text,
                resume_text,
            )

            result.score = round(
                self._clamp(
                    float(raw_score)
                )
                * 100,
                2,
            )

            degrees = self._unique(
                candidate.get(
                    "parsed_degrees",
                    [],
                )
            )

            universities = self._unique(
                candidate.get(
                    "parsed_universities",
                    [],
                )
            )

            cgpa = candidate.get(
                "parsed_cgpa"
            )

            if degrees:

                result.evidence.append(
                    "Degree information detected."
                )

                result.matched.extend(
                    sorted(degrees)
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

                try:

                    result.evidence.append(
                        f"CGPA: {float(cgpa):.2f}"
                    )

                except (
                    TypeError,
                    ValueError,
                ):

                    result.evidence.append(
                        f"CGPA: {cgpa}"
                    )

            return result

        except Exception:

            logger.exception(
                "Education matching failed."
            )

            raise