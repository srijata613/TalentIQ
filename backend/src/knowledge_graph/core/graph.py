from typing import Dict, List, Optional

from .node import GraphNode
from .edge import GraphEdge


class KnowledgeGraph:
    """
    In-memory directed knowledge graph.

    Stores graph nodes, graph edges,
    and adjacency indexes for fast traversal.
    """

    def __init__(self):

        self.nodes: Dict[str, GraphNode] = {}

        self.edges: List[GraphEdge] = []

        self.outgoing: Dict[str, List[GraphEdge]] = {}

        self.incoming: Dict[str, List[GraphEdge]] = {}

    def add_node(
        self,
        node: GraphNode
    ) -> None:

        if node.id in self.nodes:
            return

        self.nodes[node.id] = node

        self.outgoing.setdefault(
            node.id,
            []
        )

        self.incoming.setdefault(
            node.id,
            []
        )

    def get_node(
        self,
        node_id: str
    ) -> Optional[GraphNode]:

        return self.nodes.get(
            node_id
        )

    def has_node(
        self,
        node_id: str
    ) -> bool:

        return node_id in self.nodes

    def add_edge(
        self,
        edge: GraphEdge
    ) -> None:

        if (
            edge.source not in self.nodes
            or
            edge.target not in self.nodes
        ):
            raise ValueError(
                "Both nodes must exist before creating an edge."
            )

        self.edges.append(edge)

        self.outgoing[
            edge.source
        ].append(edge)

        self.incoming[
            edge.target
        ].append(edge)

    def neighbors(
        self,
        node_id: str,
        relationship: Optional[str] = None
    ) -> List[GraphNode]:

        neighbors = []

        for edge in self.outgoing.get(
            node_id,
            []
        ):

            if (
                relationship
                and
                edge.relationship != relationship
            ):
                continue

            node = self.nodes.get(
                edge.target
            )

            if node:
                neighbors.append(node)

        return neighbors

    def incoming_neighbors(
        self,
        node_id: str,
        relationship: Optional[str] = None
    ) -> List[GraphNode]:

        neighbors = []

        for edge in self.incoming.get(
            node_id,
            []
        ):

            if (
                relationship
                and
                edge.relationship != relationship
            ):
                continue

            node = self.nodes.get(
                edge.source
            )

            if node:
                neighbors.append(node)

        return neighbors

    @property
    def node_count(
        self
    ) -> int:

        return len(
            self.nodes
        )

    @property
    def edge_count(
        self
    ) -> int:

        return len(
            self.edges
        )

    def to_dict(
        self
    ) -> Dict:

        return {

            "nodes": [

                node.to_dict()

                for node in self.nodes.values()

            ],

            "edges": [

                edge.to_dict()

                for edge in self.edges

            ]
        }