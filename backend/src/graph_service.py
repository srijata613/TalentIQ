from __future__ import annotations

from typing import Dict, List


class GraphService:
    
    def build_candidate_graph(
        self,
        candidate: Dict
    ) -> Dict:

        nodes = []
        edges = []

        candidate_id = (
            candidate.get(
                "id"
            )
            or "candidate"
        )

        candidate_name = (
            candidate.get(
                "parsed_name"
            )
            or "Unknown Candidate"
        )

        nodes.append({

            "id": candidate_id,

            "type": "candidate",

            "label": candidate_name

        })

        self._add_entities(

            nodes,
            edges,

            candidate_id,

            candidate.get(
                "parsed_skills",
                []
            ),

            "skill",

            "HAS_SKILL"

        )

        self._add_entities(

            nodes,
            edges,

            candidate_id,

            candidate.get(
                "parsed_companies",
                []
            ),

            "company",

            "WORKED_AT"

        )

        self._add_entities(

            nodes,
            edges,

            candidate_id,

            candidate.get(
                "parsed_universities",
                []
            ),

            "university",

            "STUDIED_AT"

        )

        self._add_entities(

            nodes,
            edges,

            candidate_id,

            candidate.get(
                "parsed_certifications",
                []
            ),

            "certification",

            "HAS_CERTIFICATION"

        )

        return {

            "nodes": nodes,

            "edges": edges

        }

    def _add_entities(

        self,

        nodes: List[Dict],

        edges: List[Dict],

        candidate_id: str,

        values: List,

        node_type: str,

        relationship: str

    ):

        if not values:
            return

        seen = {

            node["id"]

            for node in nodes

        }

        for value in values:

            if not value:
                continue

            if isinstance(
                value,
                dict
            ):
                label = (
                    value.get(
                        "name"
                    )
                    or str(value)
                )
            else:
                label = str(value)

            node_id = (
                f"{node_type}:"
                f"{label.lower()}"
            )

            if node_id not in seen:

                nodes.append({

                    "id": node_id,

                    "type": node_type,

                    "label": label

                })

                seen.add(
                    node_id
                )

            edges.append({

                "source": candidate_id,

                "target": node_id,

                "relationship": relationship

            })