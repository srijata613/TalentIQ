import re
from nltk.tokenize import sent_tokenize
from .config import TECH_SKILLS

# flat skills
def flatten_skill_dict(skill_dict):
    skills = []
    for category in skill_dict.values():
        skills.extend(category)
    return list(set(skills))


ALL_SKILLS = flatten_skill_dict(TECH_SKILLS)


# extraction of those skills
def extract_skills_dictionary(text, skill_list=None):
    """
    Extracts skills from text using dictionary-based matching.
    """
    if skill_list is None:
        skill_list = ALL_SKILLS

    text = text.lower()
    extracted = []

    for skill in skill_list:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text):
            extracted.append(skill)

    return list(set(extracted))


# sentence extraction
def extract_sentences(text):
    """
    Extract meaningful sentences (used for experience alignment).
    Filters out very short fragments.
    """
    sentences = sent_tokenize(text)
    return [s.strip() for s in sentences if len(s.strip()) > 20]


def extract_experience_requirement(text):
    patterns = [
        r'(\d+\+?\s*years?\s*experience)',
        r'(\d+\+?\s*yrs?\s*experience)',
        r'(\d+\+?\s*years?)',
        r'(\d+\+?\s*yrs?)',
    ]

    text_lower = text.lower()

    for pattern in patterns:
        match = re.search(pattern, text_lower)

        if match:
            return match.group(1)

    return None


def extract_education_requirement(text):
    education_patterns = [
        r"bachelor'?s degree",
        r"master'?s degree",
        r"phd",
        r"b\.tech",
        r"m\.tech",
        r"computer science",
    ]

    text_lower = text.lower()

    matches = []

    for pattern in education_patterns:
        if re.search(pattern, text_lower):
            matches.append(pattern)

    return matches


def extract_certifications(text):
    certification_patterns = [
        r'aws certification',
        r'azure certification',
        r'gcp certification',
        r'kubernetes certification',
        r'pmp',
        r'scrum master',
    ]

    text_lower = text.lower()

    matches = []

    for pattern in certification_patterns:
        if re.search(pattern, text_lower):
            matches.append(pattern)

    return matches