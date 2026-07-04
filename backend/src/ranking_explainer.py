from __future__ import annotations

from collections import OrderedDict
from typing import Dict, List

from .config import (
    BORDERLINE_THRESHOLD,
    EXPLAINER_THRESHOLDS,
    HIRE_THRESHOLD,
    STRONG_HIRE_THRESHOLD,
    HIGH_CONFIDENCE,
    MEDIUM_CONFIDENCE,
    VERY_HIGH_CONFIDENCE,
    FEATURE_ATTRIBUTION,
)

from .models.models import (
    CandidateMatch,
    MatchResult,
)


class RankingExplainer:
    
    def explain(
        self,
        candidate_match: CandidateMatch,
    ) -> Dict:

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

    # Executive Summary
    def _executive_summary(
        self,
        match: CandidateMatch,
    ) -> str:

        decision = self._recommendation_label(
            match.overall_score
        )

        strengths = match.metadata.strong_categories

        weak = match.metadata.weak_categories

        return (
            f"{decision}. "
            f"Overall score: {match.overall_score:.2f}. "
            f"{strengths} strong evaluation categories, "
            f"{weak} weak evaluation categories."
        )

    # Hiring Recommendation
    def _hiring_recommendation(
        self,
        match: CandidateMatch,
    ) -> Dict:

        score = match.overall_score

        if score >= STRONG_HIRE_THRESHOLD:

            return {
                "decision": "Strong Hire",
                "priority": "High",
                "reason":
                    "Excellent overall alignment with job requirements.",
            }

        if score >= HIRE_THRESHOLD:

            return {
                "decision": "Hire",
                "priority": "Medium",
                "reason":
                    "Good overall alignment with minor gaps.",
            }

        if score >= BORDERLINE_THRESHOLD:

            return {
                "decision": "Borderline",
                "priority": "Medium",
                "reason":
                    "Potential candidate requiring further interview validation.",
            }

        return {
            "decision": "Do Not Hire",
            "priority": "Low",
            "reason":
                "Insufficient alignment with core job requirements.",
        }

    # Confidence
    def _confidence(
        self,
        match: CandidateMatch,
    ) -> Dict:

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

            "score":
                confidence,

            "level":
                level,

            "reason":
                (
                    f"{match.metadata.total_evidence} "
                    "supporting evidence items across "
                    f"{match.metadata.matched_categories} "
                    "matched evaluation categories."
                ),
        }

    # Feature Attribution
    def _feature_attribution(
        self,
        match: CandidateMatch,
    ) -> List[Dict]:

        features = [

            (
                "Skills",
                match.skill_match.score,
                FEATURE_ATTRIBUTION["skills"],
            ),

            (
                "Experience",
                match.experience_match.score,
                FEATURE_ATTRIBUTION["experience"],
            ),

            (
                "Education",
                match.education_match.score,
                FEATURE_ATTRIBUTION["education"],
            ),

            (
                "Certifications",
                match.certification_match.score,
                FEATURE_ATTRIBUTION["certifications"],
            ),

            (
                "Projects",
                match.project_match.score,
                FEATURE_ATTRIBUTION["projects"],
            ),

            (
                "Context",
                match.context_match.score,
                FEATURE_ATTRIBUTION["context"],
            ),
        ]

        attribution = []

        for name, score, weight in features:

            attribution.append({

                "feature": name,

                "score": score,

                "weight": weight,

                "impact":
                    self._impact_label(score),
            })

        return attribution

    # Score Breakdown
    def _score_breakdown(
        self,
        match: CandidateMatch,
    ) -> Dict:

        return {

            "overall":
                match.overall_score,

            "skills":
                match.skill_match.score,

            "experience":
                match.experience_match.score,

            "education":
                match.education_match.score,

            "certifications":
                match.certification_match.score,

            "projects":
                match.project_match.score,

            "context":
                match.context_match.score,
        }

    # Strength Analysis
    def _strength_analysis(
        self,
        match: CandidateMatch,
    ) -> List[Dict]:

        strengths = []

        self._append_category(
            strengths,
            "Skills",
            match.skill_match,
            "matched",
        )

        self._append_category(
            strengths,
            "Experience",
            match.experience_match,
            "matched",
        )

        self._append_category(
            strengths,
            "Education",
            match.education_match,
            "matched",
        )

        self._append_category(
            strengths,
            "Certifications",
            match.certification_match,
            "matched",
        )

        self._append_category(
            strengths,
            "Projects",
            match.project_match,
            "matched",
        )

        self._append_category(
            strengths,
            "Context",
            match.context_match,
            "matched",
        )

        return strengths

    # Gap Analysis
    def _gap_analysis(
        self,
        match: CandidateMatch,
    ) -> List[Dict]:

        gaps = []

        self._append_category(
            gaps,
            "Skills",
            match.skill_match,
            "missing",
        )

        self._append_category(
            gaps,
            "Experience",
            match.experience_match,
            "missing",
        )

        self._append_category(
            gaps,
            "Education",
            match.education_match,
            "missing",
        )

        self._append_category(
            gaps,
            "Certifications",
            match.certification_match,
            "missing",
        )

        self._append_category(
            gaps,
            "Projects",
            match.project_match,
            "missing",
        )

        self._append_category(
            gaps,
            "Context",
            match.context_match,
            "missing",
        )

        return gaps

    # Interview Focus
    def _interview_focus(
        self,
        match: CandidateMatch,
    ) -> List[Dict]:

        focus = []

        mapping = [

            (
                "Skills",
                match.skill_match,
            ),

            (
                "Experience",
                match.experience_match,
            ),

            (
                "Education",
                match.education_match,
            ),

            (
                "Certifications",
                match.certification_match,
            ),

            (
                "Projects",
                match.project_match,
            ),

            (
                "Context",
                match.context_match,
            ),
        ]

        for category, result in mapping:

            if (
                result.score
                <
                EXPLAINER_THRESHOLDS["matched"]
            ):

                focus.append({

                    "category":
                        category,

                    "topics":
                        self._unique(
                            result.missing
                        ),

                    "reason":
                        "Lower-than-expected alignment in this evaluation category.",
                })

        return focus

    # Evidence
    def _aggregate_evidence(
        self,
        match: CandidateMatch,
    ) -> List[str]:

        return self._unique(
            match.evidence
        )

    # Helpers
    def _append_category(
        self,
        output: List[Dict],
        category: str,
        result: MatchResult,
        field: str,
    ) -> None:

        values = getattr(
            result,
            field,
        )

        values = self._unique(
            values
        )

        if not values:
            return

        output.append({

            "category":
                category,

            "items":
                values,
        })

    def _impact_label(
        self,
        score: float,
    ) -> str:

        if score >= EXPLAINER_THRESHOLDS["strong"]:

            return "Strong Positive"

        if score >= EXPLAINER_THRESHOLDS["matched"]:

            return "Positive"

        if score >= EXPLAINER_THRESHOLDS["weak"]:

            return "Moderate"

        return "Needs Improvement"

    def _recommendation_label(
        self,
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
        values: List[str],
    ) -> List[str]:

        return list(
            OrderedDict.fromkeys(
                values
            )
        )