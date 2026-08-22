from __future__ import annotations

import logging
from typing import Any, Dict, List

from .models import MatchResult
from src.experience_scoring import (
    compute_experience_alignment,
    normalize_experience_score,
)

logger = logging.getLogger(__name__)

EXPERIENCE_WEIGHTS = {
    "semantic": 0.40,
    "years": 0.25,
    "responsibility": 0.20,
    "leadership": 0.10,
    "impact": 0.05,
}

HIGH_SIMILARITY_THRESHOLD = 0.70
MAX_LEADERSHIP_SIGNALS = 5
IMPACT_POINTS = 25


class ExperienceMatcher:
    """
    Performs experience matching using semantic similarity,
    years of experience, leadership, responsibilities,
    and quantified project impact.
    """

    @staticmethod
    def _normalize(text: str) -> str:
        return (
            str(text)
            .lower()
            .strip()
            .replace("-", " ")
        )

    @staticmethod
    def _clamp(score: float) -> float:
        return max(0.0, min(score, 100.0))

    @staticmethod
    def _years_score(
        candidate_years: float,
        required_years: float,
    ) -> float:

        if required_years <= 0:
            return 100.0

        return min(
            (candidate_years / required_years) * 100,
            100.0,
        )

    def _responsibility_score(
        self,
        resume_text: str,
        responsibilities: List[str],
    ) -> tuple[float, int]:

        if not responsibilities:
            return 100.0, 0

        resume = self._normalize(resume_text)

        matched = 0

        for responsibility in responsibilities:

            normalized = self._normalize(
                responsibility
            )

            if normalized in resume:
                matched += 1

        score = (
            matched / len(responsibilities)
        ) * 100

        return score, matched

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

            resume_text = candidate.get(
                "resume_text",
                "",
            )

            jd_text = job.get(
                "content",
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


            alignment_score, sentence_scores = (
                compute_experience_alignment(
                    jd_text,
                    resume_text,
                )
            )

            semantic_score = (
                normalize_experience_score(
                    alignment_score
                )
                * 100
            )

            candidate_years = (
                candidate.get(
                    "parsed_experience_years",
                    0,
                )
                or 0
            )

            required_years = (
                job.get(
                    "experience_years",
                    0,
                )
                or 0
            )

            years_score = self._years_score(
                candidate_years,
                required_years,
            )

            responsibility_score, matched_resp = (
                self._responsibility_score(
                    resume_text,
                    job.get(
                        "responsibilities",
                        [],
                    ),
                )
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

            impacts = candidate.get(
                "parsed_project_impacts",
                [],
            )

            impact_score = min(
                len(impacts) * IMPACT_POINTS,
                100,
            )


            final_score = (
                semantic_score
                * EXPERIENCE_WEIGHTS["semantic"]
                + years_score
                * EXPERIENCE_WEIGHTS["years"]
                + responsibility_score
                * EXPERIENCE_WEIGHTS[
                    "responsibility"
                ]
                + leadership_score
                * EXPERIENCE_WEIGHTS[
                    "leadership"
                ]
                + impact_score
                * EXPERIENCE_WEIGHTS["impact"]
            )

            result.score = round(
                self._clamp(final_score),
                2,
            )

            
            high_matches = sum(
                score >= HIGH_SIMILARITY_THRESHOLD
                for score in sentence_scores
            )

            result.evidence.extend(
                [
                    f"{high_matches} responsibilities strongly matched.",
                    f"Semantic similarity: {alignment_score:.2%}",
                    f"Experience: {candidate_years} / {required_years} years",
                    f"Responsibilities matched: {matched_resp}/{len(job.get('responsibilities', []))}",
                ]
            )

            if leadership_score > 0:
                result.evidence.append(
                    "Leadership experience detected."
                )

            if impacts:
                result.evidence.append(
                    f"{len(impacts)} quantified achievements detected."
                )

            return result

        except Exception:

            logger.exception(
                "Experience matching failed."
            )

            raise