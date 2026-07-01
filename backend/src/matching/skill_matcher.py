from .models import MatchResult
from src.repositories.taxonomy_repository import TaxonomyRepository


class SkillMatcher:

    def __init__(self):

        self.taxonomy = TaxonomyRepository()

    def match(
        self,
        candidate_skills: list[str],
        required_skills: list[str],
    ) -> MatchResult:

        result = MatchResult()

        candidate_normalized = {
            self.taxonomy.normalize(skill)
            for skill in candidate_skills
            if skill
        }

        required_normalized = {
            self.taxonomy.normalize(skill)
            for skill in required_skills
            if skill
        }

        matched = (
            candidate_normalized
            &
            required_normalized
        )

        missing = (
            required_normalized
            -
            matched
        )

        result.matched = sorted(matched)

        result.missing = sorted(missing)

        if required_normalized:

            result.score = round(
                len(matched)
                /
                len(required_normalized)
                * 100,
                2,
            )

        result.evidence.append(

            f"{len(matched)} of "
            f"{len(required_normalized)} "
            f"required skills matched."

        )

        return result