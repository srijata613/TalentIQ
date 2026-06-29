from __future__ import annotations

from typing import Dict, List

from supabase import Client


class EntityNormalizer:

    def __init__(self, supabase: Client):

        self.supabase = supabase

        self.alias_map: Dict[str, str] = {}

        self.loaded = False

    def load(self) -> None:
        """
        Load all aliases from Supabase into memory.
        """

        if self.loaded:
            return

        response = (
            self.supabase
            .table("taxonomy_aliases")
            .select(
                "alias, taxonomy_entities(canonical_name)"
            )
            .execute()
        )

        for row in response.data:

            alias = row["alias"].strip().lower()

            canonical = (
                row["taxonomy_entities"]["canonical_name"]
            )

            self.alias_map[alias] = canonical

        self.loaded = True

    def normalize(
        self,
        value: str
    ) -> str:

        if not self.loaded:
            self.load()

        if not value:
            return value

        key = value.strip().lower()

        return self.alias_map.get(
            key,
            value.strip()
        )

    def normalize_many(
        self,
        values: List[str]
    ) -> List[str]:

        normalized = []

        seen = set()

        for value in values:

            canonical = self.normalize(value)

            if canonical not in seen:

                normalized.append(canonical)

                seen.add(canonical)

        return normalized