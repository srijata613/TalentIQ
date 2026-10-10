from .config import DEGREE_KEYWORDS, FIELD_KEYWORDS


# education scoring
def compute_education_score(jd_text, resume_text):

    jd_lower = jd_text.lower()
    resume_lower = resume_text.lower()

    degree_required = any(k in jd_lower for k in DEGREE_KEYWORDS)
    degree_present = any(k in resume_lower for k in DEGREE_KEYWORDS)

    field_required = any(f in jd_lower for f in FIELD_KEYWORDS)
    field_present = any(f in resume_lower for f in FIELD_KEYWORDS)

    score = 0.0

    if degree_required and degree_present:
        score += 0.5

    if field_required and field_present:
        score += 0.5

    return score


# bonus scoring
def compute_bonus_score(jd_skills, resume_skills, matched_skills):

    extra_skills = [
        skill for skill in resume_skills
        if skill not in jd_skills
    ]

    if len(extra_skills) >= 2:
        return 0.5
    elif len(extra_skills) == 1:
        return 0.25
    else:
        return 0.0