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

    for word, count in frequencies.items():

        if count > 20:

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

        return "unknown"


def analyze_section_coverage(
    resume_text: str
):
    """
    Detect major resume sections.
    """

    text = resume_text.lower()

    return {

        "summary":
            "summary" in text,

        "education":
            "education" in text,

        "experience":
            "experience" in text,

        "skills":
            "skills" in text,

        "projects":
            "projects" in text,

        "certifications":
            (
                "certification" in text
                or
                "certifications" in text
            ),

        "achievements":
            (
                "achievement" in text
                or
                "achievements" in text
            ),

        "publications":
            (
                "publication" in text
                or
                "publications" in text
            ),
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
    completeness,
    stuffing_words
):
    """
    Simple quality score.
    """

    score = completeness

    stuffing_penalty = (
        len(stuffing_words) * 0.05
    )

    score -= stuffing_penalty

    score = max(score, 0.0)

    return round(score, 2)


def analyze_resume_quality(
    resume_text: str,
    existing_hashes=None
):
    """
    Main quality analysis entrypoint.
    """

    duplicate_info = (
        detect_duplicate_resume(
            resume_text,
            existing_hashes
        )
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

    section_coverage = (
        analyze_section_coverage(
            resume_text
        )
    )

    completeness = (
        calculate_resume_completeness(
            section_coverage
        )
    )

    quality_score = (
        calculate_resume_quality_score(
            completeness,
            stuffing_words
        )
    )

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
    }