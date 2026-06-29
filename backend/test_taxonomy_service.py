from src.knowledge_graph.services.taxonomy_service import (
    TaxonomyService,
)

taxonomy = TaxonomyService()

print()

print("Categories")

print("----------------")

for category in taxonomy.get_categories():

    print(category)

print()

print("Total Skills")

print("----------------")

print(
    len(
        taxonomy.get_all_skills()
    )
)

print()

print(
    taxonomy.has_skill("python")
)

print(
    taxonomy.has_skill("golang")
)

print()

print(
    taxonomy.get_skill_category("fastapi")
)

print(
    taxonomy.get_skill_category("postgresql")
)