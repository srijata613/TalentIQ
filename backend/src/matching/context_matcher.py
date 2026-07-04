from __future__ import annotations

from .models import MatchResult

from src.fit_scoring import (
    generate_fit_scores,
)


class ContextMatcher:

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> MatchResult:

        result = MatchResult()

        scores = generate_fit_scores(
            candidate
        )

        values = list(scores.values())

        result.score = round(
            sum(values) / len(values),
            2,
        )

        for key, value in scores.items():

            result.evidence.append(
                f"{key}: {value}"
            )

            if value >= 70:

                result.matched.append(key)

            else:

                result.missing.append(key)

        return result