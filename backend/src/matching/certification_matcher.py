from __future__ import annotations

import logging
from typing import Any, Dict, Iterable, Set

from .models import MatchResult

logger = logging.getLogger(__name__)


class CertificationMatcher:
    """
    Matches candidate certifications against
    job certification requirements.
    """

    @staticmethod
    def _normalize(value: str) -> str:
        return (
            str(value)
            .strip()
            .lower()
        )

    @classmethod
    def _normalize_set(
        cls,
        values: Iterable[Any],
    ) -> Set[str]:

        return {
            cls._normalize(value)
            for value in values
            if isinstance(value, str)
            and value.strip()
        }

    def match(
        self,
        candidate: Dict[str, Any],
        job: Dict[str, Any],
    ) -> MatchResult:

        if not isinstance(candidate, dict):
            raise TypeError(
                "Candidate must be a dictionary."
            )

        if not isinstance(job, dict):
            raise TypeError(
                "Job must be a dictionary."
            )

        result = MatchResult()

        try:

            candidate_certs = self._normalize_set(
                candidate.get(
                    "parsed_certifications",
                    [],
                )
            )

            required_certs = self._normalize_set(
                job.get(
                    "certifications",
                    [],
                )
            )

            if not required_certs:

                result.score = 100.0

                result.evidence.append(
                    "Job does not require certifications."
                )

                return result

            result.matched = sorted(
                candidate_certs
                & required_certs
            )

            result.missing = sorted(
                required_certs
                - candidate_certs
            )

            result.score = round(
                (
                    len(result.matched)
                    / len(required_certs)
                )
                * 100,
                2,
            )

            result.evidence.extend(
                [
                    f"Certification matched: {cert}"
                    for cert in result.matched
                ]
            )

            result.evidence.extend(
                [
                    f"Missing certification: {cert}"
                    for cert in result.missing
                ]
            )

            return result

        except Exception:

            logger.exception(
                "Certification matching failed."
            )

            raise