from typing import Dict, List

INTERVIEW_THRESHOLD = 0.80
CONSIDER_THRESHOLD = 0.65
HOLD_THRESHOLD = 0.50


def auto_reject_candidate(
    candidate: Dict
) -> bool:

    risk_score = candidate.get(
        "risk_score",
        0
    )

    final_score = candidate.get(
        "final_score",
        0
    )

    if risk_score >= 80:
        return True

    if final_score < HOLD_THRESHOLD:
        return True

    return False


def classify_candidate(
    candidate: Dict
) -> str:
    
    if auto_reject_candidate(candidate):
        return "reject"

    score = candidate.get(
        "final_score",
        0
    )

    risk = candidate.get(
        "risk_score",
        0
    )
    
    leadership_fit = candidate.get(
        "leadership_fit",
        0
    )
    
    enterprise_fit = candidate.get(
        "enterprise_fit",
        0
    )
    
    startup_fit = candidate.get(
        "startup_fit",
        0
    )
    
    if (
        leadership_fit >= 70
        and score >= 0.75
    ):
        return "leadership_round"
    
    if (
        enterprise_fit >= 60
        and score >= 0.70
    ):
        return "technical_round"
    
    if (
        startup_fit >= 60
        and score >= 0.65
    ):
        return "future_pipeline"

    if (
        score >= INTERVIEW_THRESHOLD
        and risk < 50
    ):
        return "interview_now"

    if (
        score >= CONSIDER_THRESHOLD
        and risk < 70
    ):
        return "consider"

    if score >= HOLD_THRESHOLD:
        return "hold"

    return "reject"


def tier_candidates(
    candidates: List[Dict]
):

    buckets = {
        "interview_now": [],
        "technical_round": [],
        "leadership_round": [],
        "future_pipeline": [],
        "consider": [],
        "hold": [],
        "reject": []
    }

    for candidate in candidates:

        bucket = classify_candidate(
            candidate
        )

        buckets[bucket].append(
            candidate
        )

    return buckets


def generate_interview_list(
    candidates: List[Dict],
    top_n: int = 20
):

    eligible = [
        
        candidate
        
        for candidate in candidates
        
        if classify_candidate(
            candidate
        ) != "reject"
    ]
    
    ranked = sorted(
        eligible,
        key=lambda x: (
            x.get("final_score",0),
            -x.get("risk_score",0)
        ),
            reverse=True
    )

    return ranked[:top_n]


def generate_shortlist(
    candidates: List[Dict]
):

    tiers = tier_candidates(
        candidates
    )

    return {

        "summary": {

            "total_candidates":
                len(candidates),

            "interview_now":
                len(
                    tiers[
                        "interview_now"
                    ]
                ),
                
            "leadership_round":
                len(
                    tiers[
                        "leadership_round"
                    ]
                ),
                
            "technical_round":
                len(
                    tiers[
                        "technical_round"
                    ]
                ),
                
            "future_pipeline":
                len(
                    tiers[
                        "future_pipeline"
                    ]
                ),

            "consider":
                len(
                    tiers[
                        "consider"
                    ]
                ),

            "hold":
                len(
                    tiers[
                        "hold"
                    ]
                ),

            "reject":
                len(
                    tiers[
                        "reject"
                    ]
                )
        },

        "tiers":
            tiers,

        "recommended_interviews":
            generate_interview_list(
                candidates
            )
    }