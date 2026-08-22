from __future__ import annotations

import logging
from typing import Any

from .config import (
    BORDERLINE_THRESHOLD,
    EXPLAINER_THRESHOLDS,
    FEATURE_ATTRIBUTION,
    HIGH_CONFIDENCE,
    HIRE_THRESHOLD,
    MEDIUM_CONFIDENCE,
    STRONG_HIRE_THRESHOLD,
    VERY_HIGH_CONFIDENCE,
)

from .models.models import (
    CandidateMatch,
    MatchResult,
)

logger = logging.getLogger(__name__)


class RankingExplainer:

    CATEGORY_MAPPING = (
        ("Skills", "skill_match", "skills"),
        ("Experience", "experience_match", "experience"),
        ("Education", "education_match", "education"),
        ("Certifications", "certification_match", "certifications"),
        ("Projects", "project_match", "projects"),
        ("Context", "context_match", "context"),
    )

    def explain(
        self,
        candidate_match: CandidateMatch,
    ) -> dict[str, Any]:

        if not isinstance(
            candidate_match,
            CandidateMatch,
        ):
            raise TypeError(
                "candidate_match must be CandidateMatch."
            )

        try:

            return {

                "executive_summary":
                    self._executive_summary(
                        candidate_match
                    ),

                "hiring_recommendation":
                    self._hiring_recommendation(
                        candidate_match
                    ),

                "confidence":
                    self._confidence(
                        candidate_match
                    ),

                "feature_attribution":
                    self._feature_attribution(
                        candidate_match
                    ),

                "score_breakdown":
                    self._score_breakdown(
                        candidate_match
                    ),

                "strengths":
                    self._strength_analysis(
                        candidate_match
                    ),

                "gaps":
                    self._gap_analysis(
                        candidate_match
                    ),

                "interview_focus":
                    self._interview_focus(
                        candidate_match
                    ),

                "evidence":
                    self._aggregate_evidence(
                        candidate_match
                    ),
            }

        except Exception:

            logger.exception(
                "Ranking explanation failed."
            )

            raise

    def _categories(
        self,
        match: CandidateMatch,
    ):

        for title, attr, key in self.CATEGORY_MAPPING:

            yield (
                title,
                getattr(match, attr),
                key,
            )

    def _executive_summary(
        self,
        match: CandidateMatch,
    ) -> str:

        decision = self._recommendation_label(
            match.overall_score
        )

        return (
            f"{decision}. "
            f"Overall score: {match.overall_score:.2f}. "
            f"{match.metadata.strong_categories} strong evaluation categories, "
            f"{match.metadata.weak_categories} weak evaluation categories."
        )

    def _hiring_recommendation(
        self,
        match: CandidateMatch,
    ) -> dict[str, str]:

        score = match.overall_score

        if score >= STRONG_HIRE_THRESHOLD:

            return {
                "decision": "Strong Hire",
                "priority": "High",
                "reason": "Excellent overall alignment with job requirements.",
            }

        if score >= HIRE_THRESHOLD:

            return {
                "decision": "Hire",
                "priority": "Medium",
                "reason": "Good overall alignment with minor gaps.",
            }

        if score >= BORDERLINE_THRESHOLD:

            return {
                "decision": "Borderline",
                "priority": "Medium",
                "reason": "Potential candidate requiring further interview validation.",
            }

        return {
            "decision": "Do Not Hire",
            "priority": "Low",
            "reason": "Insufficient alignment with core job requirements.",
        }

    def _confidence(
        self,
        match: CandidateMatch,
    ) -> dict[str, Any]:

        confidence = match.metadata.overall_confidence

        if confidence >= VERY_HIGH_CONFIDENCE:
            level = "Very High"
        elif confidence >= HIGH_CONFIDENCE:
            level = "High"
        elif confidence >= MEDIUM_CONFIDENCE:
            level = "Medium"
        else:
            level = "Low"

        return {
            "score": confidence,
            "level": level,
            "reason": (
                f"{match.metadata.total_evidence} supporting evidence items "
                f"across {match.metadata.matched_categories} matched evaluation categories."
            ),
        }

    def _feature_attribution(
        self,
        match: CandidateMatch,
    ) -> list[dict[str, Any]]:

        output = []

        for title, result, key in self._categories(match):

            output.append(
                {
                    "feature": title,
                    "score": result.score,
                    "weight": FEATURE_ATTRIBUTION[key],
                    "impact": self._impact_label(
                        result.score
                    ),
                }
            )

        return output

    def _score_breakdown(
        self,
        match: CandidateMatch,
    ) -> dict[str, float]:

        output = {
            "overall": match.overall_score,
        }

        for title, result, _ in self._categories(match):

            output[
                title.lower()
            ] = result.score

        return output

    def _strength_analysis(
        self,
        match: CandidateMatch,
    ) -> list[dict[str, Any]]:

        return self._category_analysis(
            match,
            "matched",
        )

    def _gap_analysis(
        self,
        match: CandidateMatch,
    ) -> list[dict[str, Any]]:

        return self._category_analysis(
            match,
            "missing",
        )

    def _category_analysis(
        self,
        match: CandidateMatch,
        field: str,
    ) -> list[dict[str, Any]]:

        output = []

        for title, result, _ in self._categories(match):

            values = self._unique(
                getattr(result, field)
            )

            if values:

                output.append(
                    {
                        "category": title,
                        "items": values,
                    }
                )

        return output

    def _interview_focus(
        self,
        match: CandidateMatch,
    ) -> list[dict[str, Any]]:

        output = []

        for title, result, _ in self._categories(match):

            if (
                result.score
                >= EXPLAINER_THRESHOLDS["matched"]
            ):
                continue

            output.append(
                {
                    "category": title,
                    "topics": self._unique(
                        result.missing
                    ),
                    "reason": (
                        "Lower-than-expected alignment in this evaluation category."
                    ),
                }
            )

        return output

    def _aggregate_evidence(
        self,
        match: CandidateMatch,
    ) -> list[str]:

        return self._unique(
            match.evidence
        )

    @staticmethod
    def _impact_label(
        score: float,
    ) -> str:

        if score >= EXPLAINER_THRESHOLDS["strong"]:
            return "Strong Positive"

        if score >= EXPLAINER_THRESHOLDS["matched"]:
            return "Positive"

        if score >= EXPLAINER_THRESHOLDS["weak"]:
            return "Moderate"

        return "Needs Improvement"

    @staticmethod
    def _recommendation_label(
        score: float,
    ) -> str:

        if score >= STRONG_HIRE_THRESHOLD:
            return "Strong Hire"

        if score >= HIRE_THRESHOLD:
            return "Hire"

        if score >= BORDERLINE_THRESHOLD:
            return "Borderline"

        return "Do Not Hire"

    @staticmethod
    def _unique(
        values: list[str],
    ) -> list[str]:

        return list(
            dict.fromkeys(values)
        )