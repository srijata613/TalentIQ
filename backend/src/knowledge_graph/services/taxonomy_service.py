from __future__ import annotations

import logging
from typing import Final

from src.repositories.taxonomy_repository import (
    TaxonomyRepository,
)

logger = logging.getLogger(__name__)


class TaxonomyService:
    """
    Read-only service for accessing the
    application's skill taxonomy.
    """

    def __init__(self) -> None:
        try:
            self._repository: Final = TaxonomyRepository()

            self._skill_taxonomy: Final = (
                self._repository.get_skill_taxonomy()
            )

            self._all_skills: Final = tuple(
                self._repository.get_all_skills()
            )

        except Exception:
            logger.exception(
                "Failed to initialize TaxonomyService."
            )
            raise

    def get_all_skills(self) -> list[str]:
        """
        Return all known skills.
        """

        return list(self._all_skills)

    def get_category(
        self,
        category: str,
    ) -> list[str]:
        """
        Return all skills belonging to a category.
        """

        if not isinstance(category, str):
            raise TypeError(
                "category must be a string."
            )

        normalized = category.strip().lower()

        return list(
            self._skill_taxonomy.get(
                normalized,
                [],
            )
        )

    def get_categories(self) -> list[str]:
        """
        Return all available taxonomy categories.
        """

        return list(
            self._repository.get_categories()
        )

    def has_skill(
        self,
        skill: str,
    ) -> bool:
        """
        Check whether a skill exists.
        """

        if not isinstance(skill, str):
            raise TypeError(
                "skill must be a string."
            )

        skill = skill.strip()

        if not skill:
            return False

        return self._repository.has_skill(
            skill
        )

    def get_skill_category(
        self,
        skill: str,
    ) -> str | None:
        """
        Return the category of a skill.
        """

        if not isinstance(skill, str):
            raise TypeError(
                "skill must be a string."
            )

        skill = skill.strip()

        if not skill:
            return None

        return self._repository.get_skill_category(
            skill
        )