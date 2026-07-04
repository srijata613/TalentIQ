from .models import (
    CandidateMatch,
)

from .skill_matcher import (
    SkillMatcher,
)

from .experience_matcher import (
    ExperienceMatcher,
)

from .education_matcher import (
    EducationMatcher,
)

from .certification_matcher import (
    CertificationMatcher,
)

from .project_matcher import (
    ProjectMatcher,
)

from .context_matcher import (
    ContextMatcher,
)

from src.config import (
    MATCHING_WEIGHTS,
)


class Matcher:

    def __init__(self):

        self.skill_matcher = SkillMatcher()

        self.experience_matcher = (
            ExperienceMatcher()
        )

        self.education_matcher = (
            EducationMatcher()
        )

        self.certification_matcher = (
            CertificationMatcher()
        )

        self.project_matcher = (
            ProjectMatcher()
        )

        self.context_matcher = (
            ContextMatcher()
        )

    def match(
        self,
        candidate: dict,
        job: dict,
    ) -> CandidateMatch:

        result = CandidateMatch()

        result.skill_match = (
            self.skill_matcher.match(
                candidate.get(
                    "parsed_skills",
                    [],
                ),
                job.get(
                    "required_skills",
                    [],
                ),
            )
        )

        result.experience_match = (
            self.experience_matcher.match(
                candidate.get(
                    "resume_text",
                    "",
                ),
                job.get(
                    "content",
                    "",
                ),
            )
        )

        result.education_match = (
            self.education_matcher.match(
                candidate,
                job.get(
                    "content",
                    "",
                ),
            )
        )

        result.certification_match = (
            self.certification_matcher.match(
                candidate,
                job,
            )
        )

        result.project_match = (
            self.project_matcher.match(
                candidate,
                job,
            )
        )

        result.context_match = (
            self.context_matcher.match(
                candidate,
                job,
            )
        )

        weights = MATCHING_WEIGHTS

        result.overall_score = round(
            result.skill_match.score
            * weights["skill"]
            +
            result.experience_match.score
            * weights["experience"]
            +
            result.education_match.score
            * weights["education"]
            +
            result.certification_match.score
            * weights["certification"]
            +
            result.project_match.score
            * weights["project"]
            +
            result.context_match.score
            * weights["context"],
            2,
        )

        for match in [
            result.skill_match,
            result.experience_match,
            result.education_match,
            result.certification_match,
            result.project_match,
            result.context_match,
        ]:
            result.evidence.extend(match.evidence)

        matches = [
            result.skill_match,
            result.experience_match,
            result.education_match,
            result.certification_match,
            result.project_match,
            result.context_match,
        ]

        result.metadata.total_evidence = len(result.evidence)

        result.metadata.matched_categories = sum(
            1 for m in matches
            if m.score >= 70
        )

        result.metadata.strong_categories = sum(
            1 for m in matches
            if m.score >= 85
        )

        result.metadata.weak_categories = sum(
            1 for m in matches
            if m.score < 50
        )

        confidence = (
            result.overall_score * 0.7
            +
            min(
                result.metadata.total_evidence,
                20,
            ) * 1.5
        )

        result.metadata.overall_confidence = round(
            min(confidence, 100.0),
            2,
        )

        return result