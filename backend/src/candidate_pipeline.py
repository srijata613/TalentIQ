from __future__ import annotations

from copy import deepcopy
from typing import Dict

from src.llm.parser import parse_job_with_llm
from src.parsing import (
    ALL_SKILLS,
    extract_skills_dictionary,
)
from src.graph_service import GraphService
from src.risk_assessment import calculate_risk_score
from src.recommendations import generate_recommendations
from src.candidate_intelligence import (
    build_candidate_intelligence,
)

from src.candidate_profile_generator import (
    CandidateProfileGenerator,
)

from src.matching.matcher import (
    Matcher,
)

class CandidatePipeline:

    def __init__(self):

        self.graph_service = GraphService()
        
        self.matcher = Matcher()
        
        self.profile_generator = (
            CandidateProfileGenerator()
        )

    def process(
        self,
        candidate: Dict,
        jd_text: str = "",
    ) -> Dict:

        candidate = deepcopy(candidate)

        self._build_graph(candidate)

        self._calculate_risk(candidate)
        
        self._match_candidate(
            candidate,
            jd_text,
        )

        self._generate_recommendations(
            candidate
        )
        
        self._candidate_intelligence(
            candidate,
            jd_text,
        )
                
        self._generate_ai_profile(
            candidate
        )

        return candidate

    def _build_graph(
        self,
        candidate: Dict,
    ):

        candidate["candidate_graph"] = (
            self.graph_service
            .build_candidate_graph(candidate)
        )

    def _calculate_risk(
        self,
        candidate: Dict,
    ):

        candidate["risk_assessment"] = (
            calculate_risk_score(candidate)
        )

    def _generate_recommendations(
        self,
        candidate: Dict,
    ):

        candidate[
            "recommendations"
        ] = generate_recommendations(
            missing_skills=[],
            candidate_skills=candidate.get(
                "parsed_skills",
                [],
            ),
        )

    def _candidate_intelligence(
        self,
        candidate: Dict,
        jd_text: str,
    ):

        intelligence = (
            build_candidate_intelligence(
                candidate,
                []
            )
        )

        candidate.update(
            intelligence
        )
        
    def _match_candidate(
        self,
        candidate: Dict,
        jd_text: str,
    ):

        try:
            job = parse_job_with_llm(jd_text)
            
        except Exception:
            job = {
                
                "content": jd_text,
                "required_skills": extract_skills_dictionary(
                    jd_text,
                    ALL_SKILLS,
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

        candidate["candidate_match"] = (
            self.matcher.match(
                candidate,
                job,
            )
        )
        
    def _generate_ai_profile(
        self,
        candidate: Dict,
    ):

        candidate["ai_profile"] = (
            self.profile_generator.generate(
                candidate
            )
        )