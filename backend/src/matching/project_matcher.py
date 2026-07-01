from .models import MatchResult


class ProjectMatcher:

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> MatchResult:

        return MatchResult()