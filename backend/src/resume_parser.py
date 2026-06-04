import re

from .parsing import (
    extract_skills_dictionary,
    ALL_SKILLS
)

EMAIL_REGEX = r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
PHONE_REGEX = r'(\+?\d[\d\s\-]{8,}\d)'


def parse_resume(text: str):

    email_match = re.search(
        EMAIL_REGEX,
        text
    )

    phone_match = re.search(
        PHONE_REGEX,
        text
    )

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    name = lines[0] if lines else None

    skills = extract_skills_dictionary(
        text,
        ALL_SKILLS
    )

    return {
        "name": name,
        "email": email_match.group(0)
        if email_match else None,

        "phone": phone_match.group(0)
        if phone_match else None,

        "skills": skills
    }