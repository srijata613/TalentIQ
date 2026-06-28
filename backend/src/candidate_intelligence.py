from .intelligence import (
    detect_behavioral_signals,
    detect_implicit_skills,
)

from .parsing import (
    extract_skills_dictionary,
    ALL_SKILLS,
)

from .resume_quality import (
    analyze_section_coverage,
    calculate_resume_completeness,
    calculate_resume_quality_score,
    detect_keyword_stuffing,
)

from .knowledge_graph import (
    build_candidate_graph
)

def estimate_skill_proficiency(
    resume_text,
    skills
):
    text_lower = resume_text.lower()

    proficiency = {}

    for skill in skills:

        mentions = text_lower.count(
            skill.lower()
        )

        proficiency[skill] = min(
            round(mentions / 3, 2),
            1.0
        )

    return proficiency


def estimate_skill_relevance(
    jd_skills,
    resume_skills
):
    if not jd_skills:
        return 0.0

    overlap = len(
        set(
            skill.lower()
            for skill in jd_skills
        ).intersection(
            set(
                skill.lower()
                for skill in resume_skills
            )
        )
    )

    return round(
        overlap / len(jd_skills),
        2
    )


def estimate_domain_experience(
    jd_skills,
    resume_skills
):
    return estimate_skill_relevance(
        jd_skills,
        resume_skills
    )


def estimate_leadership_experience(
    behavioral_signals
):
    score = (
        behavioral_signals.get(
            "leadership",
            0
        )
    )

    return min(
        round(score / 3, 2),
        1.0
    )


def estimate_ownership_score(
    behavioral_signals
):
    score = (
        behavioral_signals.get(
            "ownership",
            0
        )
    )

    return min(
        round(score / 3, 2),
        1.0
    )


def estimate_initiative_score(
    behavioral_signals
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
    jd_text,
    resume_text
):

    explicit_skills = (
        extract_skills_dictionary(
            resume_text,
            ALL_SKILLS
        )
    )

    jd_skills = (
        extract_skills_dictionary(
            jd_text,
            ALL_SKILLS
        )
    )

    behavioral = (
        detect_behavioral_signals(
            resume_text
        )
    )

    inferred_skills = (
        detect_implicit_skills(
            explicit_skills
        )
    )
    
    coverage = (
        analyze_section_coverage(
            resume_text
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
            completeness,
            stuffing
        )
    )
    
    graph = build_candidate_graph(
        {
            "skills":
                explicit_skills,
            "projects":
                [],
            "certifications":
                [],
            "companies":
                [],
            "designations":
                []
        }
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
                jd_skills,
                explicit_skills
            ),

        "leadership_experience":
            estimate_leadership_experience(
                behavioral
            ),

        "ownership_score":
            estimate_ownership_score(
                behavioral
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
        },
        
        "knowledge_graph": graph
    }
    
    print(result)
    
    return result