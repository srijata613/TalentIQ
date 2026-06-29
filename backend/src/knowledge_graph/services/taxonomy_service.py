from __future__ import annotations

from typing import Dict, List

from src.config import SKILL_TAXONOMY


class TaxonomyService:
    
    def __init__(self):

        self.skill_taxonomy = SKILL_TAXONOMY

        self._all_skills = self._flatten_skills()

    def _flatten_skills(self) -> List[str]:

        skills = []

        for category in self.skill_taxonomy.values():
            skills.extend(category)

        return sorted(set(skills))

    def get_all_skills(self) -> List[str]:

        return self._all_skills

    def get_category(
        self,
        category: str
    ) -> List[str]:

        return self.skill_taxonomy.get(
            category,
            []
        )

    def get_categories(self) -> List[str]:

        return list(
            self.skill_taxonomy.keys()
        )

    def has_skill(
        self,
        skill: str
    ) -> bool:

        return (
            skill.lower()
            in
            {
                s.lower()
                for s in self._all_skills
            }
        )

    def get_skill_category(
        self,
        skill: str
    ) -> str | None:

        skill = skill.lower()

        for category, values in self.skill_taxonomy.items():

            for value in values:

                if value.lower() == skill:

                    return category

        return None