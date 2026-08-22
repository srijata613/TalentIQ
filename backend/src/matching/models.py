from __future__ import annotations

from dataclasses import dataclass, field
from typing import List


@dataclass(slots=True)
class MatchResult:
    """
    Result produced by an individual matcher.
    """

    score: float = 0.0
    matched: List[str] = field(default_factory=list)
    missing: List[str] = field(default_factory=list)
    evidence: List[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.score = max(0.0, min(float(self.score), 100.0))
        self.matched = list(dict.fromkeys(self.matched))
        self.missing = list(dict.fromkeys(self.missing))
        self.evidence = list(dict.fromkeys(self.evidence))

    def add_match(self, value: str) -> None:
        if value and value not in self.matched:
            self.matched.append(value)

    def add_missing(self, value: str) -> None:
        if value and value not in self.missing:
            self.missing.append(value)

    def add_evidence(self, value: str) -> None:
        if value and value not in self.evidence:
            self.evidence.append(value)


@dataclass(slots=True)
class MatchMetadata:
    """
    Aggregated metadata generated during candidate matching.
    """

    total_evidence: int = 0
    matched_categories: int = 0
    weak_categories: int = 0
    strong_categories: int = 0
    overall_confidence: float = 0.0

    def __post_init__(self) -> None:
        self.overall_confidence = max(
            0.0,
            min(float(self.overall_confidence), 100.0),
        )


@dataclass(slots=True)
class CandidateMatch:
    """
    Final aggregated candidate match.
    """

    overall_score: float = 0.0

    skill_match: MatchResult = field(default_factory=MatchResult)
    experience_match: MatchResult = field(default_factory=MatchResult)
    education_match: MatchResult = field(default_factory=MatchResult)
    certification_match: MatchResult = field(default_factory=MatchResult)
    project_match: MatchResult = field(default_factory=MatchResult)
    context_match: MatchResult = field(default_factory=MatchResult)

    evidence: List[str] = field(default_factory=list)

    metadata: MatchMetadata = field(
        default_factory=MatchMetadata
    )

    def __post_init__(self) -> None:
        self.overall_score = max(
            0.0,
            min(float(self.overall_score), 100.0),
        )
        self.evidence = list(dict.fromkeys(self.evidence))

    def add_evidence(self, value: str) -> None:
        if value and value not in self.evidence:
            self.evidence.append(value)