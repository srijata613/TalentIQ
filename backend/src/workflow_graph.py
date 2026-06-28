from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class WorkflowNode:

    name: str

    dependencies: List[str] = field(default_factory=list)


WORKFLOW = {

    "semantic_search":
        WorkflowNode(
            name="semantic_search"
        ),

    "filtering":
        WorkflowNode(
            name="filtering",
            dependencies=[
                "semantic_search"
            ]
        ),

    "ranking":
        WorkflowNode(
            name="ranking",
            dependencies=[
                "filtering"
            ]
        ),

    "risk_assessment":
        WorkflowNode(
            name="risk_assessment",
            dependencies=[
                "ranking"
            ]
        ),

    "shortlisting":
        WorkflowNode(
            name="shortlisting",
            dependencies=[
                "ranking"
            ]
        ),

    "interview":
        WorkflowNode(
            name="interview",
            dependencies=[
                "shortlisting"
            ]
        ),

    "explanation":
        WorkflowNode(
            name="explanation",
            dependencies=[
                "ranking"
            ]
        ),

    "recommendations":
        WorkflowNode(
            name="recommendations",
            dependencies=[
                "ranking"
            ]
        ),

    "summary":
        WorkflowNode(
            name="summary",
            dependencies=[
                "ranking",
                "risk_assessment"
            ]
        ),
        
    "comparison":
        WorkflowNode(
            name="comparison",
            dependencies=[
                "ranking"
            ]
        )
}