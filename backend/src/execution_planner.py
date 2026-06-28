from typing import Dict, List


def build_execution_plan(
    parsed: Dict
) -> List[str]:

    plan = []

    query = parsed.get(
        "original_query",
        ""
    ).lower()

    intent = parsed.get(
        "intent",
        ""
    )

   #Base

    if intent == "candidate_search":

        plan.extend([
            "semantic_search",
            "ranking"
        ])

    elif intent == "pipeline_summary":

        plan.extend([
            "shortlisting",
            "summary"
        ])

    elif intent == "candidate_comparison":

        plan.append(
            "comparison"
        )

    elif intent == "interview":

        plan.append(
            "interview"
        )

    elif intent == "candidate_explanation":

        plan.append(
            "explanation"
        )

    #Secondary task

    if any(

        word in query

        for word in [

            "risk",
            "safe",
            "fraud",
            "trust"

        ]

    ):

        plan.append(
            "risk_assessment"
        )

    if any(

        word in query

        for word in [

            "recommend",
            "course",
            "improve",
            "missing"

        ]

    ):

        plan.append(
            "recommendations"
        )

    if any(

        word in query

        for word in [

            "interview",
            "question"

        ]

    ):

        plan.append(
            "interview"
        )

    if any(

        word in query

        for word in [

            "compare",
            "comparison",
            "versus",
            "vs"

        ]

    ):

        plan.append(
            "comparison"
        )

    if any(

        word in query

        for word in [

            "why",
            "explain",
            "reason"

        ]

    ):

        plan.append(
            "explanation"
        )
        
    if any(

        word in query

        for word in [

            "summary",
            "summarize",
            "executive summary",
            "hiring recommendation",
            "hiring verdict"

        ]

    ):

        plan.append(
            "summary"
        )
        
    if any(
        
        word in query
        
        for word in [
            
            "compare",
            "comparison",
            "versus",
            "vs"
        ]
    ):
        
        plan.append(
            "comparison"
        )

    return list(
        dict.fromkeys(plan)
    )