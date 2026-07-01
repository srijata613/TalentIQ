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
                candidate,
                job,
            )
        )

        result.education_match = (
            self.education_matcher.match(
                candidate,
                job,
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

        scores = [

            result.skill_match.score,

            result.experience_match.score,

            result.education_match.score,

            result.certification_match.score,

            result.project_match.score,

            result.context_match.score,
        ]

        result.overall_score = round(
            sum(scores) / len(scores),
            2,
        )

        result.evidence.extend(
            result.skill_match.evidence
        )

        result.evidence.extend(
            result.experience_match.evidence
        )

        result.evidence.extend(
            result.education_match.evidence
        )

        result.evidence.extend(
            result.certification_match.evidence
        )

        result.evidence.extend(
            result.project_match.evidence
        )

        result.evidence.extend(
            result.context_match.evidence
        )

        return result