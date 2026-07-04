from __future__ import annotations

from src.config import (
    DOMAIN_KEYWORDS,
    SKILL_TAXONOMY,
)


class TaxonomyRepository:

    def get_skill_taxonomy(self) -> dict:

        return SKILL_TAXONOMY

    def get_domain_keywords(self) -> dict:

        return DOMAIN_KEYWORDS

    def get_categories(self) -> list[str]:

        return list(
            SKILL_TAXONOMY.keys()
        )

    def get_all_skills(self) -> list[str]:

        skills = []

        for category in SKILL_TAXONOMY.values():

            skills.extend(category)

        return sorted(
            set(skills)
        )

    def has_skill(
        self,
        skill: str,
    ) -> bool:

        return (
            skill.lower()
            in
            {
                s.lower()
                for s in self.get_all_skills()
            }
        )

    def get_skill_category(
        self,
        skill: str,
    ) -> str | None:

        skill = skill.lower()

        for category, values in SKILL_TAXONOMY.items():

            for value in values:

                if value.lower() == skill:

                    return category

        return None