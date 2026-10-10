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


# extraction o those skills
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