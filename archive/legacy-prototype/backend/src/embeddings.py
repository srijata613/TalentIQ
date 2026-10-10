import torch
import numpy as np
from sentence_transformers import SentenceTransformer
from .config import MODEL_NAME

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

model = SentenceTransformer(MODEL_NAME, device=DEVICE)

def embed_texts(texts, batch_size=16):
    if not texts:
        return np.array([])
    return model.encode(
        texts,
        batch_size=batch_size,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False
    )

def cosine_similarity_matrix(A, B):
    return np.dot(A, B.T) 