from typing import List, Dict

from .embeddings import (
    embed_texts,
    cosine_similarity_matrix
)


def search_similar_candidates(
    query_text: str,
    candidates: List[Dict],
    top_k: int = 10
):

    if not candidates:
        return []

    candidate_texts = []

    for candidate in candidates:

        text = " ".join(
            candidate.get(
                "parsed_skills",
                []
            )
        )

        candidate_texts.append(
            text
        )

    query_embedding = embed_texts(
        [query_text]
    )

    candidate_embeddings = (
        embed_texts(
            candidate_texts
        )
    )

    similarities = (
        cosine_similarity_matrix(
            query_embedding,
            candidate_embeddings
        )[0]
    )

    ranked = []

    for idx, score in enumerate(
        similarities
    ):

        candidate = dict(
            candidates[idx]
        )

        candidate[
            "semantic_score"
        ] = float(score)

        ranked.append(
            candidate
        )

    ranked.sort(
        key=lambda x:
        x["semantic_score"],
        reverse=True
    )

    return ranked[:top_k]