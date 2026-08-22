from __future__ import annotations

import logging
from typing import Any, Dict, List

from src.config import (
    BORDERLINE_THRESHOLD,
    CONFIDENCE_WEIGHTS,
    HIRE_THRESHOLD,
    STRONG_HIRE_THRESHOLD,
)

logger = logging.getLogger(__name__)

LEADERSHIP_THRESHOLD = 0.30
GOOD_RESUME_SCORE = 70


class CandidateProfileGenerator:
    """
    Generates the recruiter-facing AI profile for a processed candidate.
    """

    def generate(
        self,
        candidate: Dict[str, Any],
    ) -> Dict[str, Any]:

        if not isinstance(candidate, dict):
            raise TypeError("Candidate must be a dictionary.")

        try:

            return {
                "executive_summary": self._summary(candidate),
                "recommendation": self._recommendation(candidate),
                "strengths": self._strengths(candidate),
                "concerns": self._concerns(candidate),
                "interview_focus": self._interview_focus(candidate),
                "career_fit": self._career_fit(candidate),
                "confidence": self._confidence(candidate),
                "evidence": self._evidence(candidate),
                "red_flags": self._red_flags(candidate),
                "interview_strategy": self._interview_strategy(candidate),
                "next_actions": self._next_actions(candidate),
            }

        except Exception:
            logger.exception(
                "Failed generating AI candidate profile."
            )
            raise

    def _summary(
        self,
        candidate: Dict[str, Any],
    ) -> str:

        years = candidate.get(
            "parsed_experience_years",
            0,
        )

        skills = candidate.get(
            "parsed_skills",
            [],
        )[:3]

        risk = (
            candidate.get(
                "risk_assessment",
                {},
            ).get(
                "risk_level",
                "Unknown",
            )
        )

        skill_text = (
            ", ".join(skills)
            if skills
            else "various technologies"
        )

        return (
            f"Candidate has approximately "
            f"{years} years of experience "
            f"with strengths in {skill_text}. "
            f"Overall hiring risk is {risk.lower()}."
        )

    def _recommendation(
        self,
        candidate: Dict[str, Any],
    ) -> str:

        candidate_match = candidate.get(
            "candidate_match"
        )

        if candidate_match is None:
            return "Unknown"

        score = getattr(
            candidate_match,
            "overall_score",
            0,
        )

        if score >= STRONG_HIRE_THRESHOLD:
            return "Strong Hire"

        if score >= HIRE_THRESHOLD:
            return "Hire"

        if score >= BORDERLINE_THRESHOLD:
            return "Borderline"

        return "Do Not Proceed"

    def _strengths(
        self,
        candidate: Dict[str, Any],
    ) -> List[str]:

        strengths: List[str] = []

        candidate_match = candidate.get(
            "candidate_match"
        )

        if (
            candidate_match
            and getattr(
                candidate_match.skill_match,
                "score",
                0,
            ) >= 80
        ):
            strengths.append(
                "Excellent Skill Alignment"
            )

        if candidate.get("parsed_skills"):
            strengths.append(
                "Strong Technical Stack"
            )

        if (
            candidate.get(
                "leadership_experience",
                0,
            )
            >= LEADERSHIP_THRESHOLD
        ):
            strengths.append(
                "Leadership Indicators"
            )

        if (
            candidate.get(
                "risk_assessment",
                {},
            ).get(
                "risk_level"
            )
            == "Low"
        ):
            strengths.append(
                "Low Hiring Risk"
            )

        if (
            candidate.get(
                "resume_quality",
                {},
            ).get(
                "quality_score",
                0,
            )
            >= GOOD_RESUME_SCORE
        ):
            strengths.append(
                "Well Structured Resume"
            )

        return list(dict.fromkeys(strengths))

    def _concerns(
        self,
        candidate: Dict[str, Any],
    ) -> List[str]:

        concerns: List[str] = []

        candidate_match = candidate.get(
            "candidate_match"
        )

        if candidate_match:

            missing = getattr(
                candidate_match.skill_match,
                "missing",
                [],
            )

            if missing:

                concerns.append(
                    "Missing key skills: "
                    + ", ".join(
                        missing[:3]
                    )
                )

        if (
            candidate.get(
                "risk_assessment",
                {},
            ).get(
                "risk_level"
            )
            == "High"
        ):
            concerns.append(
                "High hiring risk"
            )

        return concerns

    def _interview_focus(
        self,
        candidate: Dict[str, Any],
    ) -> List[str]:

        focus: List[str] = []

        candidate_match = candidate.get(
            "candidate_match"
        )

        if candidate_match:

            focus.extend(
                getattr(
                    candidate_match.skill_match,
                    "missing",
                    [],
                )[:5]
            )

        if (
            candidate.get(
                "leadership_experience",
                0,
            )
            >= LEADERSHIP_THRESHOLD
        ):
            focus.append(
                "Leadership Experience"
            )

        return list(dict.fromkeys(focus))

    def _career_fit(
        self,
        candidate: Dict[str, Any],
    ) -> List[str]:

        return (
            candidate.get(
                "recommendations",
                {},
            ).get(
                "career_paths",
                [],
            )
        )

    def _confidence(
        self,
        candidate: Dict[str, Any],
    ) -> int:

        candidate_match = candidate.get(
            "candidate_match"
        )

        if not candidate_match:
            return 0

        quality = (
            candidate.get(
                "resume_quality",
                {},
            ).get(
                "quality_score",
                GOOD_RESUME_SCORE,
            )
        )

        risk = (
            candidate.get(
                "risk_assessment",
                {},
            ).get(
                "risk_score",
                0,
            )
        )

        weights = (
            CONFIDENCE_WEIGHTS
            if isinstance(
                CONFIDENCE_WEIGHTS,
                dict,
            )
            else {}
        )

        confidence = (
            getattr(
                candidate_match,
                "overall_score",
                0,
            )
            * weights.get(
                "match",
                0.60,
            )
            + quality
            * weights.get(
                "resume_quality",
                0.20,
            )
            + (100 - risk)
            * weights.get(
                "risk",
                0.20,
            )
        )

        return round(
            max(
                0,
                min(
                    confidence,
                    100,
                ),
            )
        )

    def _evidence(
        self,
        candidate: Dict[str, Any],
    ) -> List[str]:

        evidence: List[str] = []

        if candidate.get("parsed_skills"):
            evidence.append(
                "Technical skills identified"
            )

        if candidate.get(
            "parsed_certifications"
        ):
            evidence.append(
                "Professional certifications detected"
            )

        if (
            candidate.get(
                "leadership_experience",
                0,
            )
            >= LEADERSHIP_THRESHOLD
        ):
            evidence.append(
                "Leadership indicators present"
            )

        if (
            candidate.get(
                "risk_assessment",
                {},
            ).get(
                "risk_level"
            )
            == "Low"
        ):
            evidence.append(
                "Low hiring risk"
            )

        return list(dict.fromkeys(evidence))

    def _red_flags(
        self,
        candidate: Dict[str, Any],
    ) -> List[str]:

        flags: List[str] = []

        risk = candidate.get(
            "risk_assessment",
            {},
        )

        if (
            risk.get(
                "employment_gap_risk",
                0,
            )
            > 30
        ):
            flags.append(
                "Employment gaps detected"
            )

        if (
            risk.get(
                "resume_inconsistency_risk",
                0,
            )
            > 0
        ):
            flags.append(
                "Resume inconsistency detected"
            )

        if (
            risk.get(
                "skill_inflation_risk",
                0,
            )
            > 50
        ):
            flags.append(
                "Possible skill inflation"
            )

        return flags

    def _interview_strategy(
        self,
        candidate: Dict[str, Any],
    ) -> List[str]:

        strategy: List[str] = []

        if candidate.get(
            "parsed_skills"
        ):
            strategy.append(
                "Assess technical depth of core skills."
            )

        if (
            candidate.get(
                "leadership_experience",
                0,
            )
            >= LEADERSHIP_THRESHOLD
        ):
            strategy.append(
                "Discuss leadership experiences."
            )

        missing = (
            candidate.get(
                "recommendations",
                {},
            )
            .get(
                "skill_gap_summary",
                {},
            )
            .get(
                "missing_skills",
                [],
            )
        )

        if missing:
            strategy.append(
                "Validate missing technical areas."
            )

        return strategy

    def _next_actions(
        self,
        candidate: Dict[str, Any],
    ) -> List[str]:

        recommendation = self._recommendation(
            candidate
        )

        mapping = {
            "Strong Hire": [
                "Proceed to technical interview."
            ],
            "Hire": [
                "Schedule recruiter screening."
            ],
            "Borderline": [
                "Conduct detailed technical assessment."
            ],
            "Do Not Proceed": [
                "Review candidate before proceeding."
            ],
            "Unknown": [
                "Review candidate manually."
            ],
        }

        return mapping.get(
            recommendation,
            [
                "Review candidate manually."
            ],
        )