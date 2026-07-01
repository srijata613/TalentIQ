from dataclasses import dataclass, field
from typing import List


@dataclass
class MatchResult:
    score: float = 0.0

    matched: List[str] = field(default_factory=list)

    missing: List[str] = field(default_factory=list)

    evidence: List[str] = field(default_factory=list)


@dataclass
class CandidateMatch:

    overall_score: float = 0.0

    skill_match: MatchResult = field(
        default_factory=MatchResult
    )

    experience_match: MatchResult = field(
        default_factory=MatchResult
    )

    education_match: MatchResult = field(
        default_factory=MatchResult
    )

    certification_match: MatchResult = field(
        default_factory=MatchResult
    )

    project_match: MatchResult = field(
        default_factory=MatchResult
    )

    context_match: MatchResult = field(
        default_factory=MatchResult
    )

    evidence: List[str] = field(
        default_factory=list
    )