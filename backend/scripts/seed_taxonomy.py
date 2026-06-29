import json
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
    )

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent

SKILLS_FILE = (
    PROJECT_ROOT
    / "seed_data"
    / "skills.json"
)

def load_json(path: Path):

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def entity_exists(
    canonical_name: str,
    entity_type: str
):

    response = (
        supabase
        .table("taxonomy_entities")
        .select("id")
        .eq(
            "canonical_name",
            canonical_name
        )
        .eq(
            "entity_type",
            entity_type
        )
        .limit(1)
        .execute()
    )

    return response.data


def insert_entity(entity):

    response = (
        supabase
        .table("taxonomy_entities")
        .insert({

            "canonical_name":
                entity["canonical_name"],

            "entity_type":
                entity["entity_type"],

            "category":
                entity.get("category"),

            "description":
                entity.get("description"),

            "metadata":
                entity.get(
                    "metadata",
                    {}
                )

        })
        .execute()
    )

    return response.data[0]["id"]


def insert_aliases(
    taxonomy_id: str,
    aliases
):

    for alias in aliases:

        exists = (
            supabase
            .table("taxonomy_aliases")
            .select("id")
            .eq(
                "alias",
                alias.lower()
            )
            .limit(1)
            .execute()
        )

        if exists.data:
            continue

        (
            supabase
            .table("taxonomy_aliases")
            .insert({

                "taxonomy_id":
                    taxonomy_id,

                "alias":
                    alias.lower()

            })
            .execute()
        )

def seed_entities(
    entities
):

    inserted = 0
    skipped = 0

    for entity in entities:

        exists = entity_exists(

            entity["canonical_name"],

            entity["entity_type"]

        )

        if exists:

            skipped += 1
            continue

        taxonomy_id = insert_entity(
            entity
        )

        insert_aliases(

            taxonomy_id,

            entity.get(
                "aliases",
                []
            )

        )

        inserted += 1

        print(
            f" {entity['canonical_name']}"
        )

    print("\n--------------------------")

    print(
        f"Inserted : {inserted}"
    )

    print(
        f"Skipped  : {skipped}"
    )

def main():

    print()

    print("Seeding taxonomy...")

    skills = load_json(
        SKILLS_FILE
    )

    seed_entities(
        skills
    )

    print()

    print("Done.")


if __name__ == "__main__":

    main()