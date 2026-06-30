from __future__ import annotations

from typing import Dict, List

CONFIDENCE_WEIGHTS = {
    "skills": 20,
    "experience": 20,
    "projects": 15,
    "certifications": 10,
    "resume_quality": 15,
    "risk": 10,
    "knowledge_graph": 10,
}

class CandidateProfileGenerator:
    def generate(
        self,
        candidate: Dict,
    ) -> Dict:

        return {

            "executive_summary":
                self._summary(candidate),

            "recommendation":
                self._recommendation(candidate),

            "strengths":
                self._strengths(candidate),

            "concerns":
                self._concerns(candidate),

            "interview_focus":
                self._interview_focus(candidate),

            "career_fit":
                self._career_fit(candidate),

            "confidence":
                self._confidence(candidate),
                
            "evidence":
                self._evidence(candidate),
            
            "red_flags":
                self._red_flags(candidate),
            
            "interview_strategy":
                self._interview_strategy(candidate),
            
            "next_actions":
                self._next_actions(candidate),
            
            "career_fit":
                self._career_fit(candidate)
        }

    def _summary(
        self,
        candidate: Dict,
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
            candidate
            .get(
                "risk_assessment",
                {},
            )
            .get(
                "risk_level",
                "Unknown",
            )
        )

        if skills:
            skill_text = ", ".join(skills)
        else:
            skill_text = "various technologies"

        return (
            f"Candidate has approximately "
            f"{years} years of experience "
            f"with strengths in {skill_text}. "
            f"Overall hiring risk is {risk.lower()}."
        )

    def _recommendation(
        self,
        candidate: Dict,
    ) -> str:

        risk = (
            candidate
            .get(
                "risk_assessment",
                {},
            )
            .get(
                "risk_score",
                100,
            )
        )

        leadership = candidate.get(
            "leadership_experience",
            0,
        )

        if risk < 20 and leadership >= 0.3:
            return "Strong Hire"

        if risk < 40:
            return "Hire"

        if risk < 60:
            return "Borderline"

        return "Do Not Proceed"

    def _strengths(
        self,
        candidate: Dict,
    ) -> List[str]:

        strengths = []

        if candidate.get(
            "parsed_skills"
        ):
            strengths.append(
                "Strong Technical Stack"
            )

        if (
            candidate.get(
                "leadership_experience",
                0,
            )
            >= 0.3
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
            > 70
        ):
            strengths.append(
                "Well Structured Resume"
            )

        return strengths

    def _concerns(
        self,
        candidate: Dict,
    ) -> List[str]:

        concerns = []

        missing = (
            candidate
            .get(
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

            concerns.append(
                "Missing key skills: "
                + ", ".join(missing[:3])
            )

        if (
            candidate
            .get(
                "risk_assessment",
                {},
            )
            .get(
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
        candidate: Dict,
    ) -> List[str]:

        focus = []

        missing = (
            candidate
            .get(
                "recommendations",
                {}
            )
            .get(
                "skill_gap_summary",
                {}
            )
            .get(
                "missing_skills",
                []
            )
        )

        focus.extend(
            missing[:5]
        )

        if (
            candidate.get(
                "leadership_experience",
                0,
            )
            > 0.3
        ):
            focus.append(
                "Leadership Experience"
            )

        return focus

    def _career_fit(
        self,
        candidate: Dict,
    ) -> List[str]:

        return (
            candidate
            .get(
                "recommendations",
                {}
            )
            .get(
                "career_paths",
                []
            )
        )

    def _confidence(
        self,
        candidate: Dict,
    ) -> int:

        quality = (
            candidate
            .get(
                "resume_quality",
                {}
            )
            .get(
                "quality_score",
                0,
            )
        )

        risk = (
            candidate
            .get(
                "risk_assessment",
                {}
            )
            .get(
                "risk_score",
                100,
            )
        )

        confidence = (
            quality * 0.6
            + (100 - risk) * 0.4
        )

        return round(confidence)
    
    def _evidence(
        self,
        candidate: Dict,
    ) -> List[str]:

        evidence = []

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
            >= 0.3
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

        return evidence
    
    def _red_flags(
        self,
        candidate: Dict,
    ) -> List[str]:

        flags = []

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
        candidate: Dict,
    ) -> List[str]:

        strategy = []

        if (
            candidate.get(
                "parsed_skills"
            )
        ):
        
            strategy.append(
                "Assess technical depth of core skills."
            )

            if (
                candidate.get(
                    "leadership_experience",
                    0,
                )
                >= 0.3
            ):
                strategy.append(
                    "Discuss leadership experiences."
                )

        if (
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
                []
            )
        ):
            strategy.append(
                "Validate missing technical areas."
            )

        return strategy
    
    def _next_actions(
        self,
        candidate: Dict,
    ) -> List[str]:

        actions = []

        recommendation = self._recommendation(
            candidate
        )

        if recommendation == "Strong Hire":

            actions.append(
                "Proceed to technical interview."
            )

        elif recommendation == "Hire":

            actions.append(
                "Schedule recruiter screening."
            )

        elif recommendation == "Borderline":

            actions.append(
                "Conduct detailed technical assessment."
            )

        else:

            actions.append(
                "Review candidate before proceeding."
            )

        return actions