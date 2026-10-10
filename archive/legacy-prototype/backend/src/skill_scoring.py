import numpy as np
from nltk.tokenize import sent_tokenize

from .config import (
    PRIORITY_TERMS,
    PRIORITY_MULTIPLIER,
    SKILL_THRESHOLD_SHORT,
    SKILL_THRESHOLD_NORMAL
)

from .embeddings import embed_texts, cosine_similarity_matrix


# importance of skills
def compute_skill_importance(jd_text, jd_skills):
    jd_text_lower = jd_text.lower()
    sentences = sent_tokenize(jd_text_lower)

    importance = {}

    for skill in jd_skills:
        skill_lower = skill.lower()
        base_count = jd_text_lower.count(skill_lower)

        if base_count == 0:
            continue

        multiplier = 1.0

        for sentence in sentences:
            if skill_lower in sentence:
                if any(term in sentence for term in PRIORITY_TERMS):
                    multiplier = PRIORITY_MULTIPLIER
                    break

        importance[skill_lower] = base_count * multiplier

    return importance


# skill matching
def compute_skill_match_weighted(jd_text, jd_skills, resume_skills):

    if not jd_skills:
        return 0.0, [], []

    if not resume_skills:
        return 0.0, [], jd_skills

    jd_lower = [s.lower() for s in jd_skills]
    resume_lower = [s.lower() for s in resume_skills]

    importance_raw = compute_skill_importance(jd_text, jd_skills)
    importance = dict(importance_raw)

    # Ensure all JD skills have at least weight 1.0
    for skill in jd_lower:
        if skill not in importance:
            importance[skill] = 1.0

    total_importance = sum(importance.values())

    jd_embeds = embed_texts(jd_skills)
    resume_embeds = embed_texts(resume_skills)

    sim_matrix = cosine_similarity_matrix(jd_embeds, resume_embeds)

    matched = []
    missing = []
    matched_importance = 0.0

    for i, skill_lower in enumerate(jd_lower):
        original_skill = jd_skills[i]
        weight = importance[skill_lower]

        # Exact match
        if skill_lower in resume_lower:
            matched.append(original_skill)
            matched_importance += weight
            continue

        # Semantic match
        threshold = (
            SKILL_THRESHOLD_SHORT
            if len(skill_lower) <= 4
            else SKILL_THRESHOLD_NORMAL
        )

        max_sim = sim_matrix[i].max() if sim_matrix.shape[1] > 0 else 0.0

        if max_sim >= threshold:
            matched.append(original_skill)
            matched_importance += weight
        else:
            missing.append(original_skill)

    skill_score = (
        matched_importance / total_importance
        if total_importance > 0
        else 0.0
    )

    return skill_score, matched, missing