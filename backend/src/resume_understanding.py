import re

from typing import Dict, List

from src.intelligence import (
    detect_behavioral_signals,
    detect_implicit_skills,
    estimate_adaptability,
    estimate_growth_potential
)

from src.parsing import (
    extract_skills_dictionary,
    ALL_SKILLS
)

PROMOTION_TERMS = [
    "promoted",
    "promotion",
    "senior",
    "lead",
    "principal",
    "manager"
]

LEADERSHIP_TERMS = [
    "led",
    "managed",
    "mentored",
    "owned",
    "ownership",
    "team lead"
]

IMPACT_TERMS = [
    "%",
    "reduced",
    "improved",
    "increased",
    "optimized",
    "saved",
    "generated"
]

def extract_career_progression(
    resume_text
):

    findings = []

    text = resume_text.lower()

    for term in PROMOTION_TERMS:

        if term in text:

            findings.append(
                term
            )

    return findings

def extract_leadership_evidence(
    resume_text
):

    findings = []

    text = resume_text.lower()

    for term in LEADERSHIP_TERMS:

        if term in text:

            findings.append(
                term
            )

    return findings

def extract_project_impacts(
    resume_text
):

    findings = []

    sentences = re.split(
        r"[.!?]",
        resume_text
    )

    for sentence in sentences:

        lower = sentence.lower()

        if any(
            term in lower
            for term in IMPACT_TERMS
        ):

            findings.append(
                sentence.strip()
            )

    return findings[:10]

def generate_executive_summary(
    career_stage,
    strengths,
    risks
):

    summary = (
        f"{career_stage} candidate."
    )

    if strengths:

        summary += (
            f" Key strengths include "
            f"{', '.join(strengths[:3])}."
        )

    if risks:

        summary += (
            f" Potential concerns include "
            f"{', '.join(risks[:3])}."
        )

    return summary

def extract_career_stage(
    experience_years: float
) -> str:

    if experience_years < 2:
        return "Entry Level"

    if experience_years < 5:
        return "Mid Level"

    if experience_years < 10:
        return "Senior Level"

    return "Principal Level"


def build_career_summary(
    skills: List[str],
    implicit_skills: List[str],
    experience_years: float
) -> str:

    primary_skills = skills[:5]

    summary = (
        f"Candidate has approximately "
        f"{experience_years} years of experience "
        f"with strengths in "
        f"{', '.join(primary_skills)}."
    )

    if implicit_skills:

        summary += (
            f" Demonstrates broader expertise in "
            f"{', '.join(implicit_skills)}."
        )

    return summary


def identify_strengths(
    skills: List[str],
    behavioral_signals: Dict,
    adaptability: float,
    growth: float
) -> List[str]:

    strengths = []

    if len(skills) >= 8:
        strengths.append(
            "Strong technical breadth"
        )

    if (
        behavioral_signals.get(
            "leadership",
            0
        ) > 0
    ):
        strengths.append(
            "Leadership indicators"
        )

    if adaptability >= 0.6:
        strengths.append(
            "High adaptability"
        )

    if growth >= 0.6:
        strengths.append(
            "Strong growth potential"
        )

    return strengths


def identify_risks(
    skills: List[str],
    behavioral_signals: Dict,
    adaptability: float
) -> List[str]:

    risks = []

    if len(skills) < 3:
        risks.append(
            "Limited technical depth"
        )

    if (
        behavioral_signals.get(
            "communication",
            0
        ) == 0
    ):
        risks.append(
            "Limited communication evidence"
        )

    if adaptability < 0.3:
        risks.append(
            "Low adaptability indicators"
        )

    return risks


def build_resume_understanding(
    resume_text: str,
    experience_years: float = 0
):

    explicit_skills = (
        extract_skills_dictionary(
            resume_text,
            ALL_SKILLS
        )
    )

    implicit_skills = (
        detect_implicit_skills(
            explicit_skills
        )
    )

    behavioral = (
        detect_behavioral_signals(
            resume_text
        )
    )

    adaptability = (
        estimate_adaptability(
            resume_text
        )
    )

    growth = (
        estimate_growth_potential(
            resume_text
        )
    )
    
    career_progression = (
        extract_career_progression(
            resume_text
        )
    )

    leadership_evidence = (
        extract_leadership_evidence(
            resume_text
        )
    )

    project_impacts = (
        extract_project_impacts(
            resume_text
        )
    )

    return {

        "career_stage":
            extract_career_stage(
                experience_years
            ),

        "explicit_skills":
            explicit_skills,

        "implicit_skills":
            implicit_skills,

        "behavioral_signals":
            behavioral,

        "adaptability":
            adaptability,

        "growth_potential":
            growth,

        "career_summary":
            build_career_summary(
                explicit_skills,
                implicit_skills,
                experience_years
            ),

        "strengths":
            identify_strengths(
                explicit_skills,
                behavioral,
                adaptability,
                growth
            ),

        "risks":
            identify_risks(
                explicit_skills,
                behavioral,
                adaptability
            ),
            
        "career_progression":
            career_progression,
            
        "leadership_evidence":
            leadership_evidence,
            
        "project_impacts":
            project_impacts,
            
        "executive_summary":
            generate_executive_summary(
                extract_career_stage(
                    experience_years
                ),
                identify_strengths(
                    explicit_skills,
                    behavioral,
                    adaptability,
                    growth
                ),
                identify_risks(
                    explicit_skills,
                    behavioral,
                    adaptability
                )
            )      
    }