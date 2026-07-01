from .models import MatchResult


class ContextMatcher:

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> MatchResult:

        return MatchResult()