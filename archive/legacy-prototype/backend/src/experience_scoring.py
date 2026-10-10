import numpy as np

from .config import (
    PRIORITY_TERMS,
    PRIORITY_MULTIPLIER,
    EXPERIENCE_PRIORITY_MULTIPLIER,
    EXPERIENCE_NORMALIZATION_FLOOR
)

from .embeddings import embed_texts, cosine_similarity_matrix
from .parsing import extract_sentences


# responsibility importance
def compute_responsibility_importance(jd_sentences):
    weights = []

    for sentence in jd_sentences:
        weight = 1.0
        sentence_lower = sentence.lower()

        if any(term in sentence_lower for term in PRIORITY_TERMS):
            weight *= PRIORITY_MULTIPLIER

        if (
            "years of experience" in sentence_lower
            or "years experience" in sentence_lower
        ):
            weight *= EXPERIENCE_PRIORITY_MULTIPLIER

        weights.append(weight)

    return weights


# experience alignment
def compute_experience_alignment(jd_text, resume_text):

    jd_sentences = extract_sentences(jd_text)
    resume_sentences = extract_sentences(resume_text)

    if not jd_sentences or not resume_sentences:
        return 0.0, []

    jd_embeds = embed_texts(jd_sentences)
    resume_embeds = embed_texts(resume_sentences)

    sim_matrix = cosine_similarity_matrix(jd_embeds, resume_embeds)

    best_scores = sim_matrix.max(axis=1)

    weights = compute_responsibility_importance(jd_sentences)

    weighted_sum = sum(score * weight for score, weight in zip(best_scores, weights))
    total_weight = sum(weights)

    experience_score = (
        weighted_sum / total_weight
        if total_weight > 0
        else 0.0
    )

    return experience_score, best_scores


# normalization
def normalize_experience_score(score):

    if score < EXPERIENCE_NORMALIZATION_FLOOR:
        return 0.0

    return (score - EXPERIENCE_NORMALIZATION_FLOOR) / (
        1 - EXPERIENCE_NORMALIZATION_FLOOR
    )