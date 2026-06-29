from dataclasses import dataclass, field
from typing import Any, Dict


@dataclass(slots=True)
class GraphEdge:
    """
    Relationship between two graph nodes.
    """

    source: str

    target: str

    relationship: str

    properties: Dict[str, Any] = field(
        default_factory=dict
    )

    def update(
        self,
        **kwargs: Any
    ) -> None:

        self.properties.update(kwargs)

    def to_dict(self) -> Dict[str, Any]:

        return {

            "source": self.source,

            "target": self.target,

            "relationship": self.relationship,

            "properties": self.properties
        }