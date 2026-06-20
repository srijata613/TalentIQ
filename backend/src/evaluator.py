from .config import (
    SKILL_WEIGHT,
    EXPERIENCE_WEIGHT,
    EDUCATION_WEIGHT,
    BONUS_WEIGHT,
    LEADERSHIP_WEIGHT,
    COMMUNICATION_WEIGHT,
    DOMAIN_WEIGHT,
    CERTIFICATION_WEIGHT,
    INDUSTRY_WEIGHT,
)

from .parsing import (
    extract_skills_dictionary,
    ALL_SKILLS,
)

from .skill_scoring import (
    compute_skill_match_weighted
)

from .experience_scoring import (
    compute_experience_alignment,
    normalize_experience_score
)

from .education_bonus import (
    compute_education_score,
    compute_bonus_score
)


LEADERSHIP_TERMS = [
    "lead",
    "led",
    "leadership",
    "mentor",
    "mentored",
    "managed",
    "owner",
]

COMMUNICATION_TERMS = [
    "communication",
    "presentation",
    "stakeholder",
    "collaboration",
    "teamwork",
]

CERTIFICATION_TERMS = [
    "certification",
    "certificate",
    "coursera",
    "aws certification",
]

INDUSTRY_TERMS = [
    "healthcare",
    "finance",
    "banking",
    "insurance",
    "retail",
    "ecommerce",
]


def leadership_score(resume_text):

    text = resume_text.lower()

    matches = sum(
        term in text
        for term in LEADERSHIP_TERMS
    )

    return min(matches / 3, 1.0)


def communication_score(resume_text):

    text = resume_text.lower()

    matches = sum(
        term in text
        for term in COMMUNICATION_TERMS
    )

    return min(matches / 3, 1.0)


def certification_score(resume_text):

    text = resume_text.lower()

    matches = sum(
        term in text
        for term in CERTIFICATION_TERMS
    )

    return min(matches / 2, 1.0)


def industry_score(jd_text, resume_text):

    jd_lower = jd_text.lower()
    resume_lower = resume_text.lower()

    for industry in INDUSTRY_TERMS:

        if (
            industry in jd_lower
            and industry in resume_lower
        ):
            return 1.0

    return 0.0


def domain_score(jd_skills, resume_skills):

    jd_set = set(
        skill.lower()
        for skill in jd_skills
    )

    resume_set = set(
        skill.lower()
        for skill in resume_skills
    )

    overlap = len(
        jd_set.intersection(
            resume_set
        )
    )

    if not jd_set:
        return 0.0

    return overlap / len(jd_set)


def build_strengths_weaknesses(
    matched_skills,
    missing_skills,
    experience_score,
    education_score
):

    strengths = []
    weaknesses = []

    if len(matched_skills) >= 5:
        strengths.append(
            "Strong skill alignment"
        )

    if experience_score >= 0.7:
        strengths.append(
            "Relevant experience"
        )

    if education_score >= 0.5:
        strengths.append(
            "Meets education requirements"
        )

    if missing_skills:
        weaknesses.append(
            f"Missing {len(missing_skills)} required skills"
        )

    if experience_score < 0.5:
        weaknesses.append(
            "Limited experience alignment"
        )

    return strengths, weaknesses


def generate_recommendation(
    final_score
):

    if final_score >= 0.85:
        return "Strong Match"

    if final_score >= 0.70:
        return "Good Match"

    if final_score >= 0.50:
        return "Potential Match"

    return "Weak Match"


def generate_grade(
    final_score
):

    if final_score >= 0.90:
        return "A"

    if final_score >= 0.80:
        return "B"

    if final_score >= 0.65:
        return "C"

    if final_score >= 0.50:
        return "D"

    return "F"


def evaluate_candidate(
    jd_text: str,
    resume_text: str
):

    jd_skills = extract_skills_dictionary(
        jd_text,
        ALL_SKILLS
    )

    resume_skills = extract_skills_dictionary(
        resume_text,
        ALL_SKILLS
    )

    (
        skill_score,
        matched_skills,
        missing_skills
    ) = compute_skill_match_weighted(
        jd_text,
        jd_skills,
        resume_skills
    )

    exp_raw, _ = (
        compute_experience_alignment(
            jd_text,
            resume_text
        )
    )

    experience_score = (
        normalize_experience_score(
            exp_raw
        )
    )

    education_score = (
        compute_education_score(
            jd_text,
            resume_text
        )
    )

    bonus_score = (
        compute_bonus_score(
            jd_skills,
            resume_skills,
            matched_skills
        )
    )

    leadership = leadership_score(
        resume_text
    )

    communication = communication_score(
        resume_text
    )

    certification = certification_score(
        resume_text
    )

    industry = industry_score(
        jd_text,
        resume_text
    )

    domain = domain_score(
        jd_skills,
        resume_skills
    )

    final_score = (

        SKILL_WEIGHT *
        skill_score +

        EXPERIENCE_WEIGHT *
        experience_score +

        EDUCATION_WEIGHT *
        education_score +

        BONUS_WEIGHT *
        bonus_score +

        LEADERSHIP_WEIGHT *
        leadership +

        COMMUNICATION_WEIGHT *
        communication +

        DOMAIN_WEIGHT *
        domain +

        CERTIFICATION_WEIGHT *
        certification +

        INDUSTRY_WEIGHT *
        industry
    )

    strengths, weaknesses = (
        build_strengths_weaknesses(
            matched_skills,
            missing_skills,
            experience_score,
            education_score
        )
    )

    recommendation = (
        generate_recommendation(
            final_score
        )
    )

    grade = generate_grade(
        final_score
    )

    return {

        "final_score":
            float(final_score),

        "grade":
            grade,

        "recommendation":
            recommendation,

        "skill_score":
            float(skill_score),

        "experience_score":
            float(experience_score),

        "education_score":
            float(education_score),

        "bonus_score":
            float(bonus_score),

        "leadership_score":
            float(leadership),

        "communication_score":
            float(communication),

        "domain_score":
            float(domain),

        "certification_score":
            float(certification),

        "industry_score":
            float(industry),

        "matched_skills":
            matched_skills,

        "missing_skills":
            missing_skills,

        "strengths":
            strengths,

        "weaknesses":
            weaknesses,

        "explanation": {
            "why_selected":
                strengths,

            "why_rejected":
                weaknesses,
        }
    }