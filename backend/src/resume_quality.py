import hashlib
import re

from collections import Counter


def detect_duplicate_resume(
    resume_text: str,
    existing_hashes=None
):
    """
    Detect duplicate resumes using SHA256 hash.
    """

    if existing_hashes is None:
        existing_hashes = []

    resume_hash = hashlib.sha256(
        resume_text.encode("utf-8")
    ).hexdigest()

    is_duplicate = (
        resume_hash in existing_hashes
    )

    return {
        "is_duplicate": is_duplicate,
        "resume_hash": resume_hash,
    }


def detect_keyword_stuffing(
    resume_text: str
):
    """
    Detect excessively repeated words.
    """

    words = re.findall(
        r"\b[a-zA-Z]+\b",
        resume_text.lower()
    )

    frequencies = Counter(words)

    suspicious_words = []

    total_words = len(words)

    for word, count in frequencies.items():

        if count >= max(15, total_words * 0.05):

            suspicious_words.append({

                "word": word,

                "count": count,

            })

    return suspicious_words


def detect_language(
    resume_text: str
):
    """
    Basic language detection.
    Replace later with langdetect or fasttext.
    """

    try:

        resume_text.encode(
            "ascii"
        )

        return "english"

    except UnicodeEncodeError:

        return "non-english"


def analyze_section_coverage(
    candidate: dict
):

    return {

        "summary":
            bool(candidate.get("parsed_summary")),

        "education":
            bool(
                candidate.get("parsed_degrees")
                or candidate.get("parsed_universities")
            ),

        "experience":
            (
                candidate.get(
                    "parsed_experience_years",
                    0
                ) > 0
                or bool(candidate.get("parsed_companies"))
            ),

        "skills":
            bool(candidate.get("parsed_skills")),

        "projects":
            bool(candidate.get("parsed_projects")),

        "certifications":
            bool(candidate.get("parsed_certifications")),

        "achievements":
            bool(candidate.get("parsed_achievements")),

        "publications":
            bool(candidate.get("parsed_publications")),
    }


def calculate_resume_completeness(
    section_coverage
):
    """
    Percentage of important sections present.
    """

    total_sections = len(
        section_coverage
    )

    present_sections = sum(
        section_coverage.values()
    )

    if total_sections == 0:
        return 0.0

    return round(
        present_sections
        /
        total_sections,
        2
    )


def calculate_resume_quality_score(
    candidate,
    completeness,
    stuffing_words
):

    score = completeness * 70

    if candidate.get("parsed_email"):
        score += 3

    if candidate.get("parsed_phone"):
        score += 3

    if candidate.get("parsed_linkedin"):
        score += 2

    if candidate.get("parsed_github"):
        score += 3

    if candidate.get("parsed_projects"):
        score += 5

    if candidate.get("parsed_project_impacts"):
        score += 5

    if candidate.get("parsed_leadership_signals"):
        score += 3

    if candidate.get("parsed_certifications"):
        score += 2
        
    if candidate.get("parsed_publications"):
        score += 2
        
    if candidate.get("parsed_open_source"):
        score += 2

    score -= len(stuffing_words) * 5

    return round(
        max(0, min(score, 100)),
        2,
    )


def analyze_resume_quality(
    candidate,
    existing_hashes=None
):
    """
    Main quality analysis entrypoint.
    """

    resume_text = candidate.get(
        "resume_text",
        ""
    )
    
    lines = [
        line
        for line in resume_text.splitlines()
        if line.strip()
    ]

    line_count = len(lines)
    
    average_line_length = (
        sum(len(line) for line in resume_text.splitlines())
        / max(line_count, 1)
    )
    
    duplicate_info = detect_duplicate_resume(
        resume_text,
        existing_hashes
    )

    stuffing_words = (
        detect_keyword_stuffing(
            resume_text
        )
    )

    language = (
        detect_language(
            resume_text
        )
    )

    section_coverage = analyze_section_coverage(
        candidate
    )


    completeness = (
        calculate_resume_completeness(
            section_coverage
        )
    )

    quality_score = calculate_resume_quality_score(
        candidate,
        completeness,
        stuffing_words,
    )
    
    word_count = len(resume_text.split())

    return {

        "duplicate_detection":
            duplicate_info,

        "language":
            language,

        "section_coverage":
            section_coverage,

        "completeness":
            completeness,

        "quality_score":
            quality_score,

        "keyword_stuffing":
            stuffing_words,
            
        "formatting": {
            "line_count": line_count,
            "average_line_length": round(average_line_length, 2)
        },
        
        "section_count": sum(
            section_coverage.values()
        ),
        
        "word_count": word_count,
    }