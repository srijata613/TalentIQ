from typing import Dict, List


class RankingExplainer:

    def __init__(self):
        pass

    # Overall explanation
    def explain(self, candidate: Dict) -> Dict:

        return {

            "ranking_summary":
                self.ranking_summary(candidate),

            "score_breakdown":
                self.score_breakdown(candidate),

            "major_strengths":
                self.major_strengths(candidate),

            "major_weaknesses":
                self.major_weaknesses(candidate),

            "boost_factors":
                self.boost_factors(candidate),

            "penalty_factors":
                self.penalty_factors(candidate),

            "interview_focus":
                self.interview_focus(candidate),

            "hiring_confidence":
                self.hiring_confidence(candidate)
        }

    # Executive summary
    def ranking_summary(
        self,
        candidate: Dict
    ) -> str:

        score = candidate.get(
            "final_score",
            0
        )

        matched = len(
            candidate.get(
                "matched_skills",
                []
            )
        )

        missing = len(
            candidate.get(
                "missing_skills",
                []
            )
        )

        return (
            f"Candidate achieved a match score of "
            f"{round(score*100)}%. "
            f"{matched} required skills matched "
            f"with {missing} missing."
        )

    # Individual score breakdown
    def score_breakdown(
        self,
        candidate: Dict
    ):

        return {

            "skill_score":
                candidate.get(
                    "skill_score",
                    0
                ),

            "experience_score":
                candidate.get(
                    "experience_score",
                    0
                ),

            "education_score":
                candidate.get(
                    "education_score",
                    0
                ),

            "leadership_score":
                candidate.get(
                    "leadership_score",
                    0
                ),

            "communication_score":
                candidate.get(
                    "communication_score",
                    0
                ),

            "domain_score":
                candidate.get(
                    "domain_score",
                    0
                ),

            "certification_score":
                candidate.get(
                    "certification_score",
                    0
                ),

            "growth_score":
                candidate.get(
                    "growth_score",
                    0
                ),

            "risk_score":
                candidate.get(
                    "risk_score",
                    0
                )
        }

    # Positive factors
    def boost_factors(
        self,
        candidate: Dict
    ):

        boosts = []

        if candidate.get(
            "skill_score",
            0
        ) > 0.8:
            boosts.append(
                "Excellent skill alignment"
            )

        if candidate.get(
            "experience_score",
            0
        ) > 0.75:
            boosts.append(
                "Strong experience match"
            )

        if candidate.get(
            "leadership_fit",
            0
        ) > 70:
            boosts.append(
                "Leadership potential"
            )

        if candidate.get(
            "startup_fit",
            0
        ) > 70:
            boosts.append(
                "Excellent startup fit"
            )

        if candidate.get(
            "enterprise_fit",
            0
        ) > 70:
            boosts.append(
                "Excellent enterprise fit"
            )

        if candidate.get(
            "risk_score",
            100
        ) < 20:
            boosts.append(
                "Low hiring risk"
            )

        return boosts

    # Negative factors

    def penalty_factors(
        self,
        candidate: Dict
    ):

        penalties = []

        if candidate.get(
            "missing_skills",
            []
        ):

            penalties.append(

                f"{len(candidate['missing_skills'])} required skills missing"

            )

        if candidate.get(
            "risk_score",
            0
        ) > 40:

            penalties.append(
                "Moderate hiring risk"
            )

        if candidate.get(
            "communication_score",
            1
        ) < 0.4:

            penalties.append(
                "Communication evidence limited"
            )

        return penalties

    # Strengths
    def major_strengths(
        self,
        candidate: Dict
    ):

        strengths = []

        strengths.extend(
            candidate.get(
                "strengths",
                []
            )
        )

        strengths.extend(
            self.boost_factors(
                candidate
            )
        )

        return list(
            dict.fromkeys(
                strengths
            )
        )

    # Weaknesses
    def major_weaknesses(
        self,
        candidate: Dict
    ):

        weaknesses = []

        weaknesses.extend(
            candidate.get(
                "weaknesses",
                []
            )
        )

        weaknesses.extend(
            self.penalty_factors(
                candidate
            )
        )

        return list(
            dict.fromkeys(
                weaknesses
            )
        )

    # Interview Focus
    def interview_focus(
        self,
        candidate: Dict
    ):

        focus = []

        if candidate.get(
            "missing_skills",
            []
        ):
            focus.append(
                "Validate missing skills"
            )

        if candidate.get(
            "communication_score",
            1
        ) < 0.4:
            focus.append(
                "Assess communication ability"
            )

        if candidate.get(
            "risk_score",
            0
        ) > 40:
            focus.append(
                "Review career consistency"
            )

        if candidate.get(
            "leadership_fit",
            0
        ) > 70:
            focus.append(
                "Leadership assessment"
            )

        return focus

    # Hiring confidence
    def hiring_confidence(
        self,
        candidate: Dict
    ):

        score = candidate.get(
            "final_score",
            0
        )

        risk = candidate.get(
            "risk_score",
            0
        )

        confidence = (
            score * 100
            -
            risk * 0.5
        )

        confidence = max(
            0,
            min(
                confidence,
                100
            )
        )

        if confidence >= 85:
            label = "Very High"

        elif confidence >= 70:
            label = "High"

        elif confidence >= 55:
            label = "Medium"

        else:
            label = "Low"

        return {

            "score":
                round(
                    confidence,
                    2
                ),

            "label":
                label
        }