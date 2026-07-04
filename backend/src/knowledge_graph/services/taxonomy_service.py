from __future__ import annotations

from typing import Dict, List

from src.repositories.taxonomy_repository import (
    TaxonomyRepository,
)

class TaxonomyService:
    
    def __init__(self):

        self.repository = (
            TaxonomyRepository()
        )

        self.skill_taxonomy = (
            self.repository.get_skill_taxonomy()
        )
        
        self._all_skills = (
            self.repository.get_all_skills()
        )

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

        return self.repository.get_categories()

    def has_skill(
        self,
        skill: str
    ) -> bool:

        return self.repository.has_skill(
            skill
        )

    def get_skill_category(
        self,
        skill: str
    ) -> str | None:

        return self.repository.get_skill_category(
            skill
        )

        return None