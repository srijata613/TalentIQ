from collections import defaultdict


def build_candidate_graph(
    candidate
):

    skills = candidate.get(
        "skills",
        []
    )

    projects = candidate.get(
        "projects",
        []
    )

    certifications = candidate.get(
        "certifications",
        []
    )

    companies = candidate.get(
        "companies",
        []
    )

    designations = candidate.get(
        "designations",
        []
    )

    graph = {

        "nodes": [],
        "edges": [],
        "career_timeline": [],
        "skill_evolution": {},
    }

    # Skill Nodes
    for skill in skills:

        graph["nodes"].append({

            "id": skill,
            "type": "skill",
        })

    # Project Nodes
    for project in projects:

        graph["nodes"].append({

            "id": project,
            "type": "project",
        })

        for skill in skills:

            if (
                skill.lower()
                in project.lower()
            ):

                graph["edges"].append({

                    "source": skill,
                    "target": project,
                    "relationship":
                        "skill_to_project",
                })

    # Certification Nodes
    for cert in certifications:

        graph["nodes"].append({

            "id": cert,
            "type":
                "certification",
        })

        for skill in skills:

            if (
                skill.lower()
                in cert.lower()
            ):

                graph["edges"].append({
                    "source": skill,
                    "target": cert,
                    "relationship":
                        "skill_to_certification",
                })

    # Company Nodes
    for company in companies:

        graph["nodes"].append({
            "id": company,
            "type": "company",
        })

        for skill in skills:

            graph["edges"].append({
                "source": skill,
                "target": company,
                "relationship":
                    "skill_to_company",
            })

    # Career Timeline
    for idx, designation in enumerate(
        designations
    ):

        graph[
            "career_timeline"
        ].append({
            "step":
                idx + 1,
            "role":
                designation,
        })

    # Skill Evolution
    evolution = defaultdict(list)

    for idx, designation in enumerate(
        designations
    ):

        for skill in skills:

            evolution[
                skill
            ].append({
                "career_stage":
                    designation,
                "order":
                    idx + 1,
            })

    graph[
        "skill_evolution"
    ] = dict(evolution)

    return graph