from __future__ import annotations

from typing import Dict, List, Optional

import numpy as np

from src.embeddings import (
    embed_texts,
    cosine_similarity_matrix,
)

class CandidateRetriever:

    def __init__(self):

        pass
    
    def filter_candidates(

        self,

        candidates: List[Dict],

        required_skills: List[str] | None = None,

        min_experience: float = 0,

        fit_type: str | None = None,

        min_score: float = 0,

        max_risk: float = 100

    ) -> List[Dict]:

        filtered = []

        for candidate in candidates:

            if candidate.get(
                "final_score",
                0
            ) < min_score:
                continue

            if candidate.get(
                "risk_score",
                0
            ) > max_risk:
                continue

            if candidate.get(
                "parsed_experience_years",
                0
            ) < min_experience:
                continue

            if fit_type:

                if candidate.get(
                    fit_type,
                    0
                ) < 60:
                    continue

            if required_skills:

                candidate_skills = {

                    s.lower()

                    for s in candidate.get(
                        "parsed_skills",
                        []
                    )

                }

                if not all(

                    skill.lower() in candidate_skills

                    for skill in required_skills

                ):
                    continue

            filtered.append(candidate)

        return filtered
    
    def semantic_rerank(

        self,

        query: str,

        candidates: List[Dict]

    ):

        if not candidates:

            return []

        texts = []

        for candidate in candidates:

            text = " ".join(

                candidate.get(
                    "parsed_skills",
                    []
                )

            )

            text += " "

            text += candidate.get(
                "parsed_summary",
                ""
            )

            texts.append(text)

        candidate_embeddings = embed_texts(
            texts
        )

        query_embedding = embed_texts(
            [query]
        )

        similarities = cosine_similarity_matrix(

            query_embedding,

            candidate_embeddings

        )[0]

        for similarity, candidate in zip(

            similarities,

            candidates

        ):

            candidate["semantic_score"] = float(
                similarity
            )

        return candidates
    
    def calculate_retrieval_score(

        self,

        candidate: Dict

    ):

        semantic = candidate.get(
            "semantic_score",
            0
        )

        final_score = candidate.get(
            "final_score",
            0
        )

        retrieval_score = (

            0.45 * semantic +

            0.55 * final_score

        )

        candidate["retrieval_score"] = round(

            retrieval_score,

            4

        )

        return candidate
    
    def apply_business_rules(

        self,

        candidate: Dict

    ):

        boost = 0

        if candidate.get(
            "startup_fit",
            0
        ) >= 80:

            boost += 0.03

        if candidate.get(
            "leadership_fit",
            0
        ) >= 80:

            boost += 0.03

        if candidate.get(
            "risk_score",
            0
        ) <= 20:

            boost += 0.02

        candidate["retrieval_score"] += boost

        candidate["retrieval_score"] = round(

            min(

                candidate["retrieval_score"],

                1.0

            ),

            4

        )

        return candidate
    
    def explain_boosts(

        self,

        candidate: Dict

    ):

        reasons = []

        if candidate.get(
            "semantic_score",
            0
        ) > 0.80:

            reasons.append(
                "High semantic similarity"
            )

        if candidate.get(
            "startup_fit",
            0
        ) >= 80:

            reasons.append(
                "Excellent startup fit"
            )

        if candidate.get(
            "leadership_fit",
            0
        ) >= 80:

            reasons.append(
                "Leadership profile"
            )

        if candidate.get(
            "risk_score",
            0
        ) < 20:

            reasons.append(
                "Low hiring risk"
            )

        candidate["retrieval_explanation"] = reasons

        return candidate
    
    def retrieve(

        self,

        query: str,

        candidates: List[Dict],

        required_skills: List[str] | None = None,

        min_experience: float = 0,

        fit_type: Optional[str] = None,

        min_score: float = 0,

        max_risk: float = 100

    ):

        candidates = self.filter_candidates(

            candidates,

            required_skills,

            min_experience,

            fit_type,

            min_score,

            max_risk

        )

        candidates = self.semantic_rerank(

            query,

            candidates

        )

        ranked = []

        for candidate in candidates:

            candidate = self.calculate_retrieval_score(
                candidate
            )

            candidate = self.apply_business_rules(
                candidate
            )

            candidate = self.explain_boosts(
                candidate
            )

            ranked.append(candidate)

        ranked.sort(

            key=lambda x: x["retrieval_score"],

            reverse=True

        )

        return ranked