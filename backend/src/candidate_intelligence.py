from .intelligence import (
    detect_behavioral_signals,
    detect_implicit_skills,
)

from .resume_quality import (
    analyze_section_coverage,
    calculate_resume_completeness,
    calculate_resume_quality_score,
    detect_keyword_stuffing,
)

def estimate_skill_proficiency(
    candidate,
    resume_text,
    skills,
):
    text_lower = resume_text.lower()

    project_technologies = {
        technology.lower()
        for technology in candidate.get(
            "parsed_project_technologies",
            [],
        )
    }

    proficiency = {}

    for skill in skills:

        mentions = text_lower.count(
            skill.lower()
        )

        if skill.lower() in project_technologies:
            mentions += 2

        proficiency[skill] = min(
            round(mentions / 3, 2),
            1.0,
        )

    return proficiency


def estimate_skill_relevance(
    jd_skills,
    resume_skills,
):

    if not jd_skills:
        return 0.0

    jd = {
        skill.lower()
        for skill in jd_skills
    }

    resume = {
        skill.lower()
        for skill in resume_skills
    }

    overlap = len(
        jd & resume
    )

    score = (
        overlap /
        max(len(jd), 1)
    )

    return round(score, 2)


def estimate_domain_experience(
    candidate,
):

    domains = {

        "backend": {
            "fastapi",
            "django",
            "flask",
            "spring",
            "node",
            "express",
            "rest",
            "microservices",
        },

        "ai_ml": {
            "tensorflow",
            "pytorch",
            "scikit-learn",
            "llm",
            "langchain",
            "transformers",
        },

        "cloud": {
            "aws",
            "azure",
            "gcp",
            "docker",
            "kubernetes",
        },

        "frontend": {
            "react",
            "next.js",
            "vue",
            "angular",
        },
    }

    skills = {
        skill.lower()
        for skill in candidate.get(
            "parsed_skills",
            [],
        )
    }

    scores = {}

    for domain, required in domains.items():

        scores[domain] = round(
            len(
                skills & required
            )
            /
            len(required),
            2,
        )

    return scores


def estimate_leadership_experience(
    behavioral_signals,
    candidate,
):

    score = behavioral_signals.get(
        "leadership",
        0,
    )

    score += len(
        candidate.get(
            "parsed_leadership_signals",
            [],
        )
    )

    return min(
        round(score / 5, 2),
        1.0,
    )


def estimate_ownership_score(
    behavioral_signals,
    candidate,
):

    score = behavioral_signals.get(
        "ownership",
        0,
    )

    score += len(
        candidate.get(
            "parsed_leadership_signals",
            [],
        )
    )

    score += len(
        candidate.get(
            "parsed_open_source",
            [],
        )
    )

    return min(
        round(score / 5, 2),
        1.0,
    )


def estimate_initiative_score(
    behavioral_signals,
):
    score = (
        behavioral_signals.get(
            "initiative",
            0
        )
    )

    return min(
        round(score / 3, 2),
        1.0
    )


def estimate_collaboration_score(
    behavioral_signals
):
    score = (
        behavioral_signals.get(
            "collaboration",
            0
        )
    )

    return min(
        round(score / 3, 2),
        1.0
    )


def build_candidate_intelligence(
    candidate: dict,
    jd_skills: list | None = None
):
    
    resume_text = candidate.get(
        "resume_text",
        ""
    )

    explicit_skills = candidate.get(
        "parsed_skills",
        []
    )

    jd_skills = jd_skills or []

    behavioral = candidate.get(
        "behavioral_signals",
        {}
    )
    
    if not behavioral:
        behavioral = detect_behavioral_signals(
            candidate.get(
                "resume_text",
                ""
            )
        )

    inferred_skills = detect_implicit_skills(
            explicit_skills 
    )
    
    
    coverage = (
        analyze_section_coverage(
            candidate
        )
    )
    
    stuffing = (
        detect_keyword_stuffing(
            resume_text
        )
    )
    
    completeness = (
        calculate_resume_completeness(
            coverage
        )
    )
    
    quality_score = (
        calculate_resume_quality_score(
            candidate,
            completeness,
            stuffing
        )
    )

    result = {

        "explicit_skills":
            explicit_skills,

        "inferred_skills":
            inferred_skills,

        "behavioral_signals":
            behavioral,

        "skill_proficiency":
            estimate_skill_proficiency(
                candidate,
                resume_text,
                explicit_skills
            ),

        "skill_relevance":
            estimate_skill_relevance(
                jd_skills,
                explicit_skills
            ),

        "domain_experience":
            estimate_domain_experience(
                candidate
            ),

        "leadership_experience":
            estimate_leadership_experience(
                behavioral,
                candidate
            ),

        "ownership_score":
            estimate_ownership_score(
                behavioral,
                candidate,
            ),

        "initiative_score":
            estimate_initiative_score(
                behavioral
            ),

        "collaboration_score":
            estimate_collaboration_score(
                behavioral
            ),
            
        "resume_quality": {
            "section_coverage": coverage,
            "keyword_stuffing": stuffing,
            "completeness": completeness,
            "quality_score": quality_score,
        }
    }
        
    return result