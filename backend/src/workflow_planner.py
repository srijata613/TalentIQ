from typing import List

from src.workflow_graph import WORKFLOW


class WorkflowPlanner:

    def expand(
        self,
        requested_steps: List[str]
    ) -> List[str]:

        visited = set()
        ordered = []

        def visit(step: str):

            if step in visited:
                return

            visited.add(step)

            node = WORKFLOW.get(step)

            if node is None:
                return

            for dependency in node.dependencies:
                visit(dependency)

            ordered.append(step)

        for step in requested_steps:
            visit(step)

        return ordered