from fastapi import APIRouter
from pydantic import BaseModel

from src.candidate_clustering import (
    cluster_candidates
)

router = APIRouter()


class ClusterRequest(
    BaseModel
):
    candidates: list


@router.post(
    "/cluster-candidates"
)
def cluster(
    request: ClusterRequest
):
    return cluster_candidates(
        request.candidates
    )