from typing import List, Dict
from .evaluator import evaluate_candidate


# ranking function
def rank_candidates(jd_text: str, resumes: List[str]) -> List[Dict]:

    results = []

    for idx, resume_text in enumerate(resumes):
        result = evaluate_candidate(jd_text, resume_text)
        result["candidate_id"] = f"candidate_{idx + 1}"
        results.append(result)

    ranked_results = sorted(
        results,
        key=lambda x: x["final_score"],
        reverse=True
    )

    return ranked_results