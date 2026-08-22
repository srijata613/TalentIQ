from __future__ import annotations

import logging

from ..config import DOMAIN_KEYWORDS
from .core import (
    COMPANY_SUFFIXES,
    INDUSTRIES,
    MAX_KEYWORDS,
    MAX_LOCATION_WORDS,
    WORD_PATTERN,
    _contains,
    _extract_dictionary_matches,
    _extract_lines_with_dictionary,
    _normalize,
    _validate_text,
)

logger = logging.getLogger(__name__)

# Keywords
def extract_keywords(
    text: str,
) -> list[str]:
    """
    Extract the most frequently occurring meaningful keywords.
    """
    try:
        text_lower = _normalize(text)

        words = WORD_PATTERN.findall(text_lower)

        stopwords = {
            "with",
            "from",
            "that",
            "this",
            "will",
            "must",
            "have",
            "your",
            "their",
            "into",
            "using",
            "used",
            "ability",
            "strong",
            "candidate",
            "required",
            "preferred",
            "experience",
        }

        freq: dict[str, int] = {}

        for word in words:
            if word in stopwords:
                continue

            freq[word] = freq.get(word, 0) + 1

        sorted_words = sorted(
            freq.items(),
            key=lambda item: item[1],
            reverse=True,
        )

        return [
            word
            for word, _ in sorted_words[:MAX_KEYWORDS]
        ]

    except Exception:
        logger.exception("Error in extract_keywords")
        raise

# Industry
def extract_industry(
    text: str,
) -> str | None:
    """
    Detect the industry from the job description.
    """
    try:
        matches = _extract_dictionary_matches(
            text,
            INDUSTRIES,
        )

        return matches[0] if matches else None

    except Exception:
        logger.exception("Error in extract_industry")
        raise

# Domain
def extract_domain(
    text: str,
) -> str | None:
    """
    Detect the application domain using configured keywords.
    """
    try:
        text_lower = _normalize(text)

        scores: dict[str, int] = {}

        for domain, keywords in DOMAIN_KEYWORDS.items():

            score = sum(
                1
                for keyword in keywords
                if _contains(
                    text_lower,
                    keyword.lower(),
                )
            )

            scores[domain] = score

        if not scores:
            return None

        best_domain = max(
            scores,
            key=scores.get,
        )

        return (
            best_domain
            if scores[best_domain] > 0
            else None
        )

    except Exception:
        logger.exception("Error in extract_domain")
        raise

# Location
def extract_location(
    text: str,
) -> str | None:
    """
    Attempt to detect a location line.
    """
    try:
        _validate_text(text)

        lines = text.splitlines()

        for line in lines[:10]:

            if "," not in line:
                continue

            if len(line.split()) <= MAX_LOCATION_WORDS:
                return line.strip()

        return None

    except Exception:
        logger.exception("Error in extract_location")
        raise

# Companies
def extract_companies(
    text: str,
) -> list[str]:
    """
    Extract company names using common company suffixes.
    """
    try:
        return _extract_lines_with_dictionary(
            text,
            COMPANY_SUFFIXES,
        )

    except Exception:
        logger.exception("Error in extract_companies")
        raise

# Leadership Signals
def extract_leadership_signals(
    text: str,
) -> list[str]:
    """
    Detect leadership-oriented language.
    """
    try:
        leadership_terms = (
            "lead",
            "led",
            "leadership",
            "mentor",
            "managed",
            "owner",
        )

        return _extract_dictionary_matches(
            text,
            leadership_terms,
        )

    except Exception:
        logger.exception(
            "Error in extract_leadership_signals"
        )
        raise