from .models import MatchResult


class CertificationMatcher:

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> MatchResult:

        return MatchResult()