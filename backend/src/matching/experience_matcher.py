from __future__ import annotations

from .models import MatchResult

from src.experience_scoring import (
    compute_experience_alignment,
    normalize_experience_score,
)


class ExperienceMatcher:

    @staticmethod
    def _normalize(text: str) -> str:

        return (
            text.lower()
            .strip()
            .replace("-", " ")
        )

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> MatchResult:

        result = MatchResult()

        resume_text = candidate.get(
            "resume_text",
            ""
        )

        jd_text = job.get(
            "content",
            ""
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

        # Semantic Similarity
        alignment_score, sentence_scores = (
            compute_experience_alignment(
                jd_text,
                resume_text,
            )
        )

        semantic_score = (
            normalize_experience_score(
                alignment_score
            ) * 100
        )

        # Years of Experience
        candidate_years = (
            candidate.get(
                "parsed_experience_years",
                0,
            ) or 0
        )

        required_years = (
            job.get(
                "experience_years",
                0,
            ) or 0
        )

        if required_years <= 0:

            years_score = 100.0

        else:

            years_score = min(
                (
                    candidate_years
                    / required_years
                )
                * 100,
                100,
            )

        # Responsibilities
        responsibilities = [
            self._normalize(r)
            for r in job.get(
                "responsibilities",
                [],
            )
        ]

        resume_lower = self._normalize(
            resume_text
        )

        matched_responsibilities = 0

        for responsibility in responsibilities:

            keywords = responsibility.split()

            if any(
                keyword in resume_lower
                for keyword in keywords
            ):
                matched_responsibilities += 1

        if responsibilities:

            responsibility_score = (
                matched_responsibilities
                / len(responsibilities)
            ) * 100

        else:

            responsibility_score = 100

        # Leadership
        leadership_signals = candidate.get(
            "parsed_leadership_signals",
            [],
        )
        
        leadership_score = min(
            len(leadership_signals) / 5,
            1.0,
        ) * 100

        # Quantified Impact
        impacts = candidate.get(
            "parsed_project_impacts",
            [],
        )

        impact_score = min(
            len(impacts) * 25,
            100,
        )

        # Final Score
        result.score = round(

            semantic_score * 0.40

            + years_score * 0.25

            + responsibility_score * 0.20

            + leadership_score * 0.10

            + impact_score * 0.05,

            2,
        )

        # Evidence
        high_matches = sum(
            score >= 0.70
            for score in sentence_scores
        )

        result.evidence.append(

            f"{high_matches} responsibilities strongly matched."

        )

        result.evidence.append(

            f"Semantic similarity: {alignment_score:.2%}"

        )

        result.evidence.append(

            f"Experience: {candidate_years} / {required_years} years"

        )

        result.evidence.append(

            f"Responsibilities matched: {matched_responsibilities}/{len(responsibilities)}"

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