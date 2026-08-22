from __future__ import annotations

import logging
from typing import Any, Dict, Iterable, List, Optional

from src.config import MATCHING_WEIGHTS

from .certification_matcher import CertificationMatcher
from .context_matcher import ContextMatcher
from .education_matcher import EducationMatcher
from .experience_matcher import ExperienceMatcher
from .models import CandidateMatch
from .project_matcher import ProjectMatcher
from .skill_matcher import SkillMatcher

logger = logging.getLogger(__name__)


class Matcher:
    """
    Production-grade candidate matcher.

    Executes every scoring module and aggregates the final score,
    evidence, metadata and recruiter confidence.
    """

    def __init__(
        self,
        skill_matcher: Optional[SkillMatcher] = None,
        experience_matcher: Optional[ExperienceMatcher] = None,
        education_matcher: Optional[EducationMatcher] = None,
        certification_matcher: Optional[CertificationMatcher] = None,
        project_matcher: Optional[ProjectMatcher] = None,
        context_matcher: Optional[ContextMatcher] = None,
    ) -> None:

        self.skill_matcher = skill_matcher or SkillMatcher()
        self.experience_matcher = (
            experience_matcher or ExperienceMatcher()
        )
        self.education_matcher = (
            education_matcher or EducationMatcher()
        )
        self.certification_matcher = (
            certification_matcher or CertificationMatcher()
        )
        self.project_matcher = (
            project_matcher or ProjectMatcher()
        )
        self.context_matcher = (
            context_matcher or ContextMatcher()
        )

    def match(
        self,
        candidate: Dict[str, Any],
        job: Dict[str, Any],
    ) -> CandidateMatch:

        result = CandidateMatch()

        result.skill_match = self._safe_match(
            self.skill_matcher.match,
            candidate,
            job.get("required_skills", []),
        )

        result.experience_match = self._safe_match(
            self.experience_matcher.match,
            candidate,
            job,
        )

        result.education_match = self._safe_match(
            self.education_matcher.match,
            candidate,
            job.get("content", ""),
        )

        result.certification_match = self._safe_match(
            self.certification_matcher.match,
            candidate,
            job,
        )

        result.project_match = self._safe_match(
            self.project_matcher.match,
            candidate,
            job,
        )

        result.context_match = self._safe_match(
            self.context_matcher.match,
            candidate,
            job,
        )

        matches = [
            result.skill_match,
            result.experience_match,
            result.education_match,
            result.certification_match,
            result.project_match,
            result.context_match,
        ]

        result.overall_score = self._calculate_score(matches)

        result.evidence = self._collect_evidence(matches)

        self._populate_metadata(result, matches)

        return result

    def _safe_match(
        self,
        matcher,
        *args,
    ):

        try:
            return matcher(*args)

        except Exception:
            logger.exception(
                "Matcher '%s' failed.",
                matcher.__qualname__,
            )

            return type("Fallback", (), {
                "score": 0.0,
                "evidence": [],
            })()

    @staticmethod
    def _calculate_score(
        matches: List[Any],
    ) -> float:

        weights = (
            MATCHING_WEIGHTS
            if isinstance(MATCHING_WEIGHTS, dict)
            else {}
        )

        keys = (
            "skill",
            "experience",
            "education",
            "certification",
            "project",
            "context",
        )

        score = sum(
            getattr(match, "score", 0)
            * weights.get(key, 0)
            for key, match in zip(keys, matches)
        )

        return round(score, 2)

    @staticmethod
    def _collect_evidence(
        matches: Iterable[Any],
    ) -> List[str]:

        evidence: List[str] = []

        for match in matches:
            evidence.extend(
                getattr(match, "evidence", [])
            )

        return list(dict.fromkeys(evidence))

    @staticmethod
    def _populate_metadata(
        result: CandidateMatch,
        matches: List[Any],
    ) -> None:

        scores = [
            getattr(m, "score", 0)
            for m in matches
        ]

        result.metadata.total_evidence = len(
            result.evidence
        )

        result.metadata.matched_categories = sum(
            score >= 70
            for score in scores
        )

        result.metadata.strong_categories = sum(
            score >= 85
            for score in scores
        )

        result.metadata.weak_categories = sum(
            score < 50
            for score in scores
        )

        confidence = (
            result.overall_score * 0.7
            + min(
                result.metadata.total_evidence,
                20,
            )
            * 1.5
        )

        result.metadata.overall_confidence = round(
            min(confidence, 100.0),
            2,
        )