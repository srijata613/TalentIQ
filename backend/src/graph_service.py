from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional, Set

logger = logging.getLogger(__name__)


class GraphService:
    """
    Builds a normalized candidate knowledge graph.

    Output schema:

    {
        "nodes": [...],
        "edges": [...],
        "metadata": {...}
    }
    """

    GRAPH_VERSION = "1.0"

    def build_candidate_graph(
        self,
        candidate: Dict[str, Any],
    ) -> Dict[str, Any]:

        if not isinstance(candidate, dict):
            raise TypeError("Candidate must be a dictionary.")

        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []

        node_ids: Set[str] = set()
        edge_ids: Set[tuple] = set()

        candidate_id = (
            str(candidate.get("id"))
            if candidate.get("id")
            else "candidate"
        )

        candidate_name = (
            candidate.get("parsed_name")
            or "Unknown Candidate"
        )

        self._add_node(
            nodes,
            node_ids,
            candidate_id,
            "candidate",
            candidate_name,
        )

        self._add_entities(
            nodes,
            edges,
            node_ids,
            edge_ids,
            candidate_id,
            candidate.get("parsed_skills", []),
            "skill",
            "HAS_SKILL",
        )

        self._add_entities(
            nodes,
            edges,
            node_ids,
            edge_ids,
            candidate_id,
            candidate.get("parsed_companies", []),
            "company",
            "WORKED_AT",
        )

        self._add_entities(
            nodes,
            edges,
            node_ids,
            edge_ids,
            candidate_id,
            candidate.get("parsed_universities", []),
            "university",
            "STUDIED_AT",
        )

        self._add_entities(
            nodes,
            edges,
            node_ids,
            edge_ids,
            candidate_id,
            candidate.get("parsed_certifications", []),
            "certification",
            "HAS_CERTIFICATION",
        )

        return {
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "version": self.GRAPH_VERSION,
                "node_count": len(nodes),
                "edge_count": len(edges),
            },
        }

    @staticmethod
    def _normalize_label(value: Any) -> str:

        if isinstance(value, dict):
            value = value.get("name", "")

        value = str(value).strip()

        value = re.sub(r"\s+", " ", value)

        return value

    @staticmethod
    def _make_node_id(
        node_type: str,
        label: str,
    ) -> str:

        slug = re.sub(
            r"[^a-z0-9]+",
            "_",
            label.lower(),
        ).strip("_")

        return f"{node_type}:{slug}"

    def _add_node(
        self,
        nodes: List[Dict[str, Any]],
        node_ids: Set[str],
        node_id: str,
        node_type: str,
        label: str,
    ) -> None:

        if node_id in node_ids:
            return

        nodes.append(
            {
                "id": node_id,
                "type": node_type,
                "label": label,
            }
        )

        node_ids.add(node_id)

    def _add_edge(
        self,
        edges: List[Dict[str, Any]],
        edge_ids: Set[tuple],
        source: str,
        target: str,
        relationship: str,
    ) -> None:

        key = (
            source,
            target,
            relationship,
        )

        if key in edge_ids:
            return

        edges.append(
            {
                "source": source,
                "target": target,
                "relationship": relationship,
            }
        )

        edge_ids.add(key)

    def _add_entities(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        node_ids: Set[str],
        edge_ids: Set[tuple],
        candidate_id: str,
        values: Optional[List[Any]],
        node_type: str,
        relationship: str,
    ) -> None:

        if not values:
            return

        for value in values:

            label = self._normalize_label(value)

            if not label:
                continue

            node_id = self._make_node_id(
                node_type,
                label,
            )

            self._add_node(
                nodes,
                node_ids,
                node_id,
                node_type,
                label,
            )

            self._add_edge(
                edges,
                edge_ids,
                candidate_id,
                node_id,
                relationship,
            )