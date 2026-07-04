from __future__ import annotations

from .models import MatchResult

from src.experience_scoring import (
    compute_experience_alignment,
    normalize_experience_score,
)


class ExperienceMatcher:

    def match(
        self,
        resume_text: str,
        jd_text: str,
    ) -> MatchResult:

        result = MatchResult()

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

        normalized_score = (
            normalize_experience_score(
                alignment_score
            )
        )

        result.score = round(
            normalized_score * 100,
            2,
        )

        high_matches = sum(
            score >= 0.70
            for score in sentence_scores
        )

        result.evidence.append(
            f"{high_matches} responsibilities strongly matched."
        )

        result.evidence.append(
            f"Experience alignment: {round(alignment_score * 100,2)}%"
        )

        return result