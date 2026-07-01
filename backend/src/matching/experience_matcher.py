from .models import MatchResult


class ExperienceMatcher:

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> MatchResult:

        return MatchResult()