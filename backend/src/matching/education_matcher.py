from .models import MatchResult


class EducationMatcher:

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> MatchResult:

        return MatchResult()