from dataclasses import dataclass, field
from typing import Any, Dict


@dataclass(slots=True)
class GraphNode:
    """
    Generic node in the candidate knowledge graph.
    """

    id: str
    label: str
    node_type: str

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

            "id": self.id,

            "label": self.label,

            "node_type": self.node_type,

            "properties": self.properties
        }