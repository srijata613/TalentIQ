from __future__ import annotations

from .models import MatchResult


class CertificationMatcher:

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> MatchResult:

        result = MatchResult()

        candidate_certs = {
            cert.strip().lower()
            for cert in candidate.get(
                "parsed_certifications",
                []
            )
            if cert
        }

        required_certs = {
            cert.strip().lower()
            for cert in job.get(
                "required_certifications",
                []
            )
            if cert
        }

        if not required_certs:

            result.score = 100.0

            result.evidence.append(
                "Job does not require certifications."
            )

            return result

        result.matched = sorted(
            list(candidate_certs & required_certs)
        )

        result.missing = sorted(
            list(required_certs - candidate_certs)
        )

        result.score = round(
            (
                len(result.matched)
                / len(required_certs)
            )
            * 100,
            2,
        )

        for cert in result.matched:

            result.evidence.append(
                f"Certification matched: {cert}"
            )

        for cert in result.missing:

            result.evidence.append(
                f"Missing certification: {cert}"
            )

        return result