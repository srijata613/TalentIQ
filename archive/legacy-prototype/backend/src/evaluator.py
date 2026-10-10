from .config import (
    SKILL_WEIGHT,
    EXPERIENCE_WEIGHT,
    EDUCATION_WEIGHT,
    BONUS_WEIGHT
)

from .parsing import extract_skills_dictionary, ALL_SKILLS
from .skill_scoring import compute_skill_match_weighted
from .experience_scoring import (
    compute_experience_alignment,
    normalize_experience_score
)
from .education_bonus import (
    compute_education_score,
    compute_bonus_score
)


# main evaluation function
def evaluate_candidate(jd_text: str, resume_text: str) -> dict:

    # ----- SKILLS -----
    jd_skills = extract_skills_dictionary(jd_text, ALL_SKILLS)
    resume_skills = extract_skills_dictionary(resume_text, ALL_SKILLS)

    skill_score, matched_skills, missing_skills = compute_skill_match_weighted(
        jd_text,
        jd_skills,
        resume_skills
    )

    # experoence
    exp_raw, _ = compute_experience_alignment(jd_text, resume_text)
    experience_score = normalize_experience_score(exp_raw)

    # education
    education_score = compute_education_score(jd_text, resume_text)

    # bonus
    bonus_score = compute_bonus_score(
        jd_skills,
        resume_skills,
        matched_skills
    )

    # final score
    final_score = (
        SKILL_WEIGHT * skill_score +
        EXPERIENCE_WEIGHT * experience_score +
        EDUCATION_WEIGHT * education_score +
        BONUS_WEIGHT * bonus_score
    )

    return {
        "final_score": float(final_score),
        "skill_score": float(skill_score),
        "experience_score": float(experience_score),
        "education_score": float(education_score),
        "bonus_score": float(bonus_score),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }