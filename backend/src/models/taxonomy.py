from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class TaxonomyEntity:
    id: str | None = None

    canonical_name: str = ""

    entity_type: str = ""

    aliases: list[str] = field(default_factory=list)

    category: str | None = None

    parent: str | None = None

    description: str | None = None

    metadata: dict[str, Any] = field(default_factory=dict)