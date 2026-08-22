from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from src.candidate_intelligence import build_candidate_intelligence
from src.candidate_profile_generator import CandidateProfileGenerator
from src.graph_service import GraphService
from src.llm.parser import parse_job_with_llm
from src.matching.matcher import Matcher
from src.parsing import (
    get_all_skills,
    extract_skills_dictionary,
)
from src.recommendations import generate_recommendations
from src.risk_assessment import calculate_risk_score

logger = logging.getLogger(__name__)


class CandidatePipeline:
    """
    Executes the complete TalentIQ candidate processing pipeline.
    """

    def __init__(
        self,
        graph_service: Optional[GraphService] = None,
        matcher: Optional[Matcher] = None,
        profile_generator: Optional[CandidateProfileGenerator] = None,
    ) -> None:

        self.graph_service = graph_service or GraphService()
        self.matcher = matcher or Matcher()
        self.profile_generator = (
            profile_generator or CandidateProfileGenerator()
        )

    def process(
        self,
        candidate: Dict[str, Any],
        jd_text: str = "",
    ) -> Dict[str, Any]:
        """
        Execute the complete candidate pipeline.
        """

        if not isinstance(candidate, dict):
            raise TypeError("Candidate must be a dictionary.")

        job = self._parse_job(jd_text)

        self._safe_stage(
            "graph",
            self._build_graph,
            candidate,
        )

        self._safe_stage(
            "risk",
            self._calculate_risk,
            candidate,
        )

        self._safe_stage(
            "matching",
            self._match_candidate,
            candidate,
            job,
        )

        self._safe_stage(
            "recommendations",
            self._generate_recommendations,
            candidate,
        )

        self._safe_stage(
            "candidate_intelligence",
            self._candidate_intelligence,
            candidate,
            job,
        )

        self._safe_stage(
            "ai_profile",
            self._generate_ai_profile,
            candidate,
        )

        return candidate

    def _safe_stage(
        self,
        stage_name: str,
        fn,
        *args,
    ) -> None:

        try:
            fn(*args)

        except Exception:
            logger.exception(
                "Pipeline stage '%s' failed.",
                stage_name,
            )

    def _parse_job(
        self,
        jd_text: str,
    ) -> Dict[str, Any]:

        if not jd_text.strip():
            return self._fallback_job("")

        try:
            return parse_job_with_llm(jd_text)

        except Exception:
            logger.exception(
                "LLM job parsing failed."
            )
            return self._fallback_job(jd_text)

    @staticmethod
    def _fallback_job(
        jd_text: str,
    ) -> Dict[str, Any]:

        return {
            "content": jd_text,
            "required_skills": extract_skills_dictionary(
                jd_text,
                get_all_skills(),
            ),
            "preferred_skills": [],
            "experience_years": 0,
            "education": [],
            "certifications": [],
            "responsibilities": [],
            "technologies": [],
            "tools": [],
            "industry": None,
            "domain": None,
            "seniority": None,
        }

    def _build_graph(
        self,
        candidate: Dict[str, Any],
    ) -> None:

        candidate["candidate_graph"] = (
            self.graph_service.build_candidate_graph(candidate)
        )

    def _calculate_risk(
        self,
        candidate: Dict[str, Any],
    ) -> None:

        candidate["risk_assessment"] = (
            calculate_risk_score(candidate)
        )

    def _match_candidate(
        self,
        candidate: Dict[str, Any],
        job: Dict[str, Any],
    ) -> None:

        candidate["candidate_match"] = (
            self.matcher.match(
                candidate,
                job,
            )
        )

    def _generate_recommendations(
        self,
        candidate: Dict[str, Any],
    ) -> None:

        candidate_match = candidate.get(
            "candidate_match"
        )

        missing_skills = []

        if (
            candidate_match is not None
            and hasattr(candidate_match, "skill_match")
        ):
            missing_skills = (
                candidate_match.skill_match.missing
            )

        candidate["recommendations"] = (
            generate_recommendations(
                missing_skills=missing_skills,
                candidate_skills=candidate.get(
                    "parsed_skills",
                    [],
                ),
            )
        )

    def _candidate_intelligence(
        self,
        candidate: Dict[str, Any],
        job: Dict[str, Any],
    ) -> None:

        candidate.update(
            build_candidate_intelligence(
                candidate,
                job.get(
                    "required_skills",
                    [],
                ),
            )
        )

    def _generate_ai_profile(
        self,
        candidate: Dict[str, Any],
    ) -> None:

        candidate["ai_profile"] = (
            self.profile_generator.generate(
                candidate
            )
        )