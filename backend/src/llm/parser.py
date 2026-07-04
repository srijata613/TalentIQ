from .gemini_provider import GeminiProvider

provider = GeminiProvider()


def _clean_list(values):

    if not values:
        return []

    cleaned = []

    for value in values:

        if not isinstance(value, str):
            continue

        value = value.strip()

        if value:
            cleaned.append(value)

    return sorted(set(cleaned))


def _clean_resume(candidate):

    list_fields = [

        "parsed_skills",
        "parsed_inferred_skills",
        "parsed_degrees",
        "parsed_graduation_years",
        "parsed_designations",
        "parsed_projects",
        "parsed_certifications",
        "parsed_achievements",
        "parsed_universities",
        "parsed_companies",
        "parsed_leadership_signals",
        "parsed_project_technologies",
        "parsed_project_impacts",
        "parsed_publications",
        "parsed_open_source",

    ]

    for field in list_fields:

        candidate[field] = _clean_list(
            candidate.get(field)
        )

    candidate["parsed_experience_years"] = float(
        candidate.get(
            "parsed_experience_years",
            0,
        )
        or 0
    )

    return candidate


def parse_resume_with_llm(
    resume_text: str,
):

    result = provider.extract_resume(
        resume_text
    )

    if result is None:

        raise RuntimeError(
            "Gemini returned no response."
        )

    candidate = result.model_dump()

    candidate = _clean_resume(
        candidate
    )

    candidate["resume_text"] = resume_text

    return candidate


def parse_job_with_llm(
    jd_text: str,
):

    result = provider.extract_job(
        jd_text
    )

    if result is None:

        raise RuntimeError(
            "Gemini returned no response."
        )

    job = result.model_dump()

    job["required_skills"] = _clean_list(
        job.get("required_skills")
    )

    job["preferred_skills"] = _clean_list(
        job.get("preferred_skills")
    )

    job["education"] = _clean_list(
        job.get("education")
    )

    job["certifications"] = _clean_list(
        job.get("certifications")
    )

    job["responsibilities"] = _clean_list(
        job.get("responsibilities")
    )

    job["technologies"] = _clean_list(
        job.get("technologies")
    )

    job["tools"] = _clean_list(
        job.get("tools")
    )

    job["experience_years"] = float(
        job.get(
            "experience_years",
            0,
        )
        or 0
    )

    job["content"] = jd_text

    return job