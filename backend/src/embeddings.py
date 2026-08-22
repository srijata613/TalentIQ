from __future__ import annotations

import logging
from functools import lru_cache
from typing import Sequence

import numpy as np
import torch
from sentence_transformers import SentenceTransformer

from .config import MODEL_NAME

logger = logging.getLogger(__name__)

DEFAULT_BATCH_SIZE = 16

DEVICE = (
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    """
    Lazily load and cache the embedding model.
    """

    logger.info(
        "Loading embedding model '%s' on %s.",
        MODEL_NAME,
        DEVICE,
    )

    try:
        return SentenceTransformer(
            MODEL_NAME,
            device=DEVICE,
        )

    except Exception:

        logger.exception(
            "Failed to load embedding model."
        )

        raise


def embed_texts(
    texts: Sequence[str],
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> np.ndarray:
    """
    Generate normalized sentence embeddings.
    """

    if not isinstance(
        texts,
        (list, tuple),
    ):
        raise TypeError(
            "texts must be a list or tuple of strings."
        )

    if batch_size <= 0:
        raise ValueError(
            "batch_size must be greater than zero."
        )

    cleaned = [
        str(text).strip()
        for text in texts
        if text is not None
    ]

    if not cleaned:

        return np.empty(
            (
                0,
                0,
            ),
            dtype=np.float32,
        )

    try:

        embeddings = (
            get_model().encode(
                cleaned,
                batch_size=batch_size,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
        )

        return embeddings.astype(
            np.float32,
            copy=False,
        )

    except Exception:

        logger.exception(
            "Embedding generation failed."
        )

        raise


def cosine_similarity_matrix(
    a: np.ndarray,
    b: np.ndarray,
) -> np.ndarray:
    """
    Compute cosine similarity between
    normalized embedding matrices.
    """

    if not isinstance(
        a,
        np.ndarray,
    ) or not isinstance(
        b,
        np.ndarray,
    ):
        raise TypeError(
            "Inputs must be numpy arrays."
        )

    if a.ndim != 2 or b.ndim != 2:
        raise ValueError(
            "Embedding arrays must be 2-dimensional."
        )

    if (
        a.shape[1]
        != b.shape[1]
    ):
        raise ValueError(
            "Embedding dimensions must match."
        )

    return np.matmul(
        a,
        b.T,
    )