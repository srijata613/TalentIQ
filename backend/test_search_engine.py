from src.search_engine import (
    matches_certification,
    search_candidates,
)


def test_certification_filter_matches_partial_case_insensitive():
    candidate = {
        "parsed_certifications": [
            "AWS Solutions Architect Associate",
        ],
    }

    assert matches_certification(candidate, "AWS")
    assert matches_certification(candidate, "solutions architect")
    assert matches_certification(candidate, "ASSOCIATE")
    assert not matches_certification(candidate, "Azure")


def test_blank_certification_does_not_filter():
    candidate = {"parsed_certifications": []}

    assert matches_certification(candidate, "")
    assert matches_certification(candidate, "   ")


def test_search_candidates_applies_partial_certification_filter():
    candidates = [
        {
            "id": "candidate-1",
            "parsed_skills": ["Python"],
            "parsed_experience_years": 5,
            "parsed_certifications": [
                "AWS ML Specialty",
            ],
            "implicit_skills": ["machine learning"],
            "final_score": 85,
        },
        {
            "id": "candidate-2",
            "parsed_skills": ["Python"],
            "parsed_experience_years": 5,
            "parsed_certifications": [
                "Azure Fundamentals",
            ],
            "implicit_skills": ["machine learning"],
            "final_score": 90,
        },
    ]

    results = search_candidates(
        candidates=candidates,
        skills=["Python"],
        domain=None,
        min_experience=3,
        certification="aws",
        min_score=80,
    )

    assert [candidate["id"] for candidate in results] == [
        "candidate-1",
    ]