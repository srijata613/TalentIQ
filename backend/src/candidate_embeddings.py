from sentence_transformers import SentenceTransformer

from .config import MODEL_NAME

model = SentenceTransformer(
    MODEL_NAME
)


def build_candidate_text(candidate):

    sections = []

    sections.extend(
        candidate.get("parsed_skills", [])
    )

    sections.extend(
        candidate.get("parsed_designations", [])
    )

    sections.extend(
        candidate.get("parsed_projects", [])
    )

    sections.extend(
        candidate.get("parsed_certifications", [])
    )

    sections.append(
        candidate.get("parsed_summary", "")
    )

    return " ".join(
        [str(x) for x in sections]
    )


def generate_candidate_embedding(
    candidate
):

    text = build_candidate_text(
        candidate
    )

    embedding = model.encode(
        text,
        normalize_embeddings=True
    )

    return embedding.tolist()