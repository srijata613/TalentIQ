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
    compute_skill_match_weighted,
)

from .experience_scoring import (
    compute_experience_alignment,
    normalize_experience_score,
)

from .education_bonus import (
    compute_education_score,
    compute_bonus_score,
)

from .growth_intelligence import (
    learning_velocity,
    adaptability_score,
    leadership_trajectory,
    growth_potential,
)

from .intelligence import (
    detect_behavioral_signals,
)

from .candidate_intelligence import (
    build_candidate_intelligence,
)

from .resume_understanding import (
    build_resume_understanding,
)

from .risk_assessment import (
    calculate_risk_score,
)

from .fit_scoring import (
    generate_fit_scores,
)

from .recommendations import (
    generate_recommendations,
)

from .recruiter_insights import (
    build_recruiter_insights,
)

from .recruiter_summary import (
    build_recruiter_summary,
)

from .ranking_explainer import (
    RankingExplainer,
)

explainer = RankingExplainer()

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


def leadership_score(
    resume_text: str
) -> float:

    text = resume_text.lower()

    matches = sum(
        term in text
        for term in LEADERSHIP_TERMS
    )

    return min(matches / 3, 1.0)


def communication_score(
    resume_text: str
) -> float:

    text = resume_text.lower()

    matches = sum(
        term in text
        for term in COMMUNICATION_TERMS
    )

    return min(matches / 3, 1.0)


def certification_score(
    resume_text: str
) -> float:

    text = resume_text.lower()

    matches = sum(
        term in text
        for term in CERTIFICATION_TERMS
    )

    return min(matches / 2, 1.0)


def industry_score(
    jd_text: str,
    resume_text: str
) -> float:

    jd = jd_text.lower()
    resume = resume_text.lower()

    for industry in INDUSTRY_TERMS:

        if (
            industry in jd
            and industry in resume
        ):
            return 1.0

    return 0.0


def domain_score(
    jd_skills,
    resume_skills,
):

    if not jd_skills:
        return 0.0

    jd = {
        s.lower()
        for s in jd_skills
    }

    resume = {
        s.lower()
        for s in resume_skills
    }

    overlap = len(
        jd.intersection(resume)
    )

    return overlap / len(jd)


def build_strengths_weaknesses(

    matched_skills,

    missing_skills,

    experience_score,

    education_score,

):

    strengths = []
    weaknesses = []

    if len(matched_skills) >= 5:
        strengths.append(
            "Strong skill alignment"
        )

    if experience_score >= 0.70:
        strengths.append(
            "Relevant experience"
        )

    if education_score >= 0.50:
        strengths.append(
            "Meets education requirements"
        )

    if missing_skills:

        weaknesses.append(

            f"Missing {len(missing_skills)} required skills"

        )

    if experience_score < 0.50:

        weaknesses.append(
            "Limited experience alignment"
        )

    return strengths, weaknesses


def generate_grade(
    score
):

    if score >= 0.90:
        return "A"

    if score >= 0.75:
        return "B"

    if score >= 0.60:
        return "C"

    if score >= 0.45:
        return "D"

    return "F"


def generate_recommendation(
    score
):

    if score >= 0.85:
        return "Strong Match"

    if score >= 0.70:
        return "Good Match"

    if score >= 0.50:
        return "Potential Match"

    return "Weak Match"


def evaluate_candidate(

    jd_text: str,

    resume_text: str,

):
    # Skill Extraction
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
        missing_skills,
    ) = compute_skill_match_weighted(
        jd_text,
        jd_skills,
        resume_skills,
    )

    # Experience
    experience_raw, _ = compute_experience_alignment(
        jd_text,
        resume_text,
    )

    experience_score = normalize_experience_score(
        experience_raw
    )

    # Education
    education_score = compute_education_score(
        jd_text,
        resume_text,
    )

    # Bonus
    bonus_score = compute_bonus_score(
        jd_skills,
        resume_skills,
        matched_skills,
    )

    # Additional Scoring
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
        resume_text,
    )

    domain = domain_score(
        jd_skills,
        resume_skills,
    )

    # Behavioral Intelligence
    behavioral = detect_behavioral_signals(
        resume_text
    )

    # Candidate Intelligence
    candidate_intelligence = (
        build_candidate_intelligence(
            jd_text,
            resume_text,
        )
    )

    # Candidate Profile
    # (Later this will come directly
    # from parsed DB values)

    candidate_profile = {

        "parsed_skills":
            resume_skills,

        "parsed_project_technologies":
            candidate_intelligence.get(
                "explicit_skills",
                [],
            ),

        "parsed_projects": [],

        "parsed_companies": [],

        "parsed_certifications": [],

        "parsed_open_source": [],

        "parsed_github": [],

        "parsed_linkedin": [],

        "parsed_summary":
            resume_text,

        "parsed_experience_years":
            0,

        "parsed_graduation_years":
            [],

        "parsed_employment_duration":
            [],

        "parsed_employment_gaps":
            [],

        "parsed_leadership_signals": [

            signal

            for signal, value

            in behavioral.items()

            if value > 0

        ],
    }

    # Growth Intelligence
    learning = learning_velocity(

        candidate_profile[
            "parsed_certifications"
        ],

        candidate_profile[
            "parsed_projects"
        ]

    )

    adaptability = adaptability_score(
        behavioral
    )

    leadership_growth = (
        leadership_trajectory(

            candidate_profile[
                "parsed_leadership_signals"
            ]

        )
    )

    growth_score = growth_potential(

        learning,

        adaptability,

        leadership_growth,

    )

    # Final Score
    final_score = (

        SKILL_WEIGHT * skill_score +

        EXPERIENCE_WEIGHT * experience_score +

        EDUCATION_WEIGHT * education_score +

        BONUS_WEIGHT * bonus_score +

        LEADERSHIP_WEIGHT * leadership +

        COMMUNICATION_WEIGHT * communication +

        DOMAIN_WEIGHT * domain +

        CERTIFICATION_WEIGHT * certification +

        INDUSTRY_WEIGHT * industry

    )

    final_score = max(
        0.0,
        min(
            final_score,
            1.0,
        )
    )

    # Strengths / Weaknesses
    strengths, weaknesses = (

        build_strengths_weaknesses(

            matched_skills,

            missing_skills,

            experience_score,

            education_score,

        )

    )

    # Recommendation
    recommendation = generate_recommendation(
        final_score
    )

    grade = generate_grade(
        final_score
    )

    # Resume Understanding
    resume_understanding = (

        build_resume_understanding(

            resume_text,

            experience_years=0,

        )

    )

    # Risk Assessment
    risk_assessment = (

        calculate_risk_score(

            candidate_profile

        )

    )

    # Fit Scores
    fit_scores = generate_fit_scores(

        candidate_profile

    )

    # Recommendations
    recommendations = (

        generate_recommendations(

            missing_skills,

            resume_skills,

        )

    )

    # Recruiter Summary
    recruiter_summary = (

        build_recruiter_summary(

            resume_understanding,

            {

                "final_score":
                    final_score,

                "missing_skills":
                    missing_skills,

            },

            risk_assessment,

        )

    )

    # Recruiter Insights
    recruiter_insights = (

        build_recruiter_insights(

            candidate_profile,

            {

                "final_score":
                    final_score,

                "strengths":
                    strengths,

                "weaknesses":
                    weaknesses,

                "missing_skills":
                    missing_skills,

            }

        )

    )
    
    # Final Response
    result = {

        "final_score":
            round(float(final_score), 4),

        "grade":
            grade,

        "recommendation":
            recommendation,

        "skill_score":
            round(float(skill_score), 4),

        "experience_score":
            round(float(experience_score), 4),

        "education_score":
            round(float(education_score), 4),

        "bonus_score":
            round(float(bonus_score), 4),

        "leadership_score":
            round(float(leadership), 4),

        "communication_score":
            round(float(communication), 4),

        "domain_score":
            round(float(domain), 4),

        "certification_score":
            round(float(certification), 4),

        "industry_score":
            round(float(industry), 4),

        "growth_score":
            round(float(growth_score), 4),

        "risk_score":
            round(
                float(
                    risk_assessment["risk_score"]
                ),
                2
            ),

        "risk_level":
            risk_assessment["risk_level"],

        "matched_skills":
            matched_skills,

        "missing_skills":
            missing_skills,

        "strengths":
            strengths,

        "weaknesses":
            weaknesses,

        "behavioral_signals":
            behavioral,

        "risk_assessment":
            risk_assessment,

        "startup_fit":
            fit_scores["startup_fit"],

        "enterprise_fit":
            fit_scores["enterprise_fit"],

        "remote_fit":
            fit_scores["remote_fit"],

        "leadership_fit":
            fit_scores["leadership_fit"],

        "recommendations":
            recommendations,

        "candidate_intelligence":
            candidate_intelligence,

        "resume_understanding":
            resume_understanding,

        "recruiter_summary":
            recruiter_summary,

        "recruiter_insights":
            recruiter_insights,

        "explanation": {

            "why_selected":
                strengths,

            "why_rejected":
                weaknesses,

        }

    }

    # Explainable Ranking Engine
    result["ranking_explanation"] = (

        explainer.explain(
            result
        )

    )

    return result