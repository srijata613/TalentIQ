from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class TaxonomyEntity:
    """
    Canonical taxonomy entity used across the AI Recruitment Platform.

    This model represents a normalized taxonomy record retrieved
    from the repository layer.

    Examples:
        - Skill
        - Technology
        - Company
        - University
        - Certification
        - Domain
        - Industry
        - Job Role
    """

    id: str | None = None

    canonical_name: str = ""

    entity_type: str = ""

    aliases: list[str] = field(default_factory=list)

    category: str | None = None

    parent: str | None = None

    description: str | None = None

    metadata: dict[str, Any] = field(default_factory=dict)