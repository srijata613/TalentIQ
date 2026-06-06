import re
from nltk.tokenize import sent_tokenize

from .config import (
    SKILL_TAXONOMY,
    DOMAIN_KEYWORDS,
)

# Taxonomy Helpers

SOFT_SKILLS = SKILL_TAXONOMY["soft_skills"]

TOOLS = SKILL_TAXONOMY["tools"]

TECHNOLOGIES = (
    SKILL_TAXONOMY["programming"]
    + SKILL_TAXONOMY["frontend"]
    + SKILL_TAXONOMY["backend"]
    + SKILL_TAXONOMY["database"]
    + SKILL_TAXONOMY["cloud"]
    + SKILL_TAXONOMY["devops"]
    + SKILL_TAXONOMY["ml_ai"]
)

TECHNICAL_SKILLS = (
    SKILL_TAXONOMY["programming"]
    + SKILL_TAXONOMY["frontend"]
    + SKILL_TAXONOMY["backend"]
    + SKILL_TAXONOMY["database"]
    + SKILL_TAXONOMY["cloud"]
    + SKILL_TAXONOMY["devops"]
    + SKILL_TAXONOMY["ml_ai"]
    + SKILL_TAXONOMY["tools"]
)

INDUSTRIES = [
    "healthcare",
    "finance",
    "banking",
    "insurance",
    "education",
    "retail",
    "ecommerce",
    "aerospace",
    "manufacturing",
]

SENIORITY_LEVELS = [
    "intern",
    "junior",
    "associate",
    "mid level",
    "senior",
    "lead",
    "staff",
    "principal",
    "manager",
    "director",
]

CERTIFICATION_HEADERS = [
    "certifications",
    "certification",
    "certificate",
    "certificates",
    "licenses",
    "licenses & certifications",
    "professional certificates",
    "courses & certifications",
]

# Flatten Taxonomy

def flatten_skill_dict(skill_dict):
    skills = []

    for category in skill_dict.values():
        skills.extend(category)

    return list(set(skills))


ALL_SKILLS = flatten_skill_dict(
    SKILL_TAXONOMY
)


# Generic Skill Extraction

def extract_skills_dictionary(
    text,
    skill_list=None
):
    """
    Dictionary-based skill extraction.
    """

    if skill_list is None:
        skill_list = ALL_SKILLS

    text = text.lower()

    extracted = []

    for skill in skill_list:

        pattern = (
            r"\b"
            + re.escape(skill.lower())
            + r"\b"
        )

        if re.search(pattern, text):
            extracted.append(skill)

    return list(set(extracted))


# Sentence Extraction

def extract_sentences(text):
    """
    Extract meaningful sentences.
    """

    sentences = sent_tokenize(text)

    return [
        s.strip()
        for s in sentences
        if len(s.strip()) > 20
    ]


# Experience Extraction

def extract_experience_requirement(
    text
):
    patterns = [
        r"(\d+\+?\s*years?\s*experience)",
        r"(\d+\+?\s*yrs?\s*experience)",
        r"(\d+\+?\s*years?)",
        r"(\d+\+?\s*yrs?)",
    ]

    text_lower = text.lower()

    for pattern in patterns:

        match = re.search(
            pattern,
            text_lower
        )

        if match:
            return match.group(1)

    return None


# Education Extraction

def extract_education_requirement(
    text
):
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

        if re.search(
            pattern,
            text_lower
        ):
            matches.append(pattern)

    return matches


# Certification Extraction

def extract_certifications(text):

    lines = text.splitlines()

    certifications = []

    collecting = False

    for line in lines:

        line_lower = line.lower().strip()

        if (
            not collecting
            and any(
                header in line_lower
                for header in CERTIFICATION_HEADERS
            )
        ):
            collecting = True
            continue

        if collecting:

            headers = [
                "responsibilities",
                "requirements",
                "required qualifications",
                "preferred qualifications",
                "education",
                "experience",
                "skills",
                "industry",
            ]

            if any(
                line_lower.startswith(h)
                for h in headers
            ):
                break

            if line.strip():

                certifications.append(
                    line.strip()
                )

    return certifications


# Preferred Skills

def extract_preferred_skills(text):

    preferred_text = extract_section(
        text,
        [
            "preferred qualifications",
            "preferred skills",
            "nice to have",
            "good to have",
            "desired qualifications",
            "bonus points",
        ]
    )

    return extract_skills_dictionary(
        preferred_text
    )


# Soft Skills

def extract_soft_skills(text):

    text_lower = text.lower()

    return [
        skill
        for skill in SOFT_SKILLS
        if skill in text_lower
    ]


# Tools

def extract_tools(text):

    text_lower = text.lower()

    return [
        tool
        for tool in TOOLS
        if tool in text_lower
    ]


# Technologies

def extract_technologies(text):

    return extract_skills_dictionary(
        text,
        TECHNOLOGIES
    )


# Keywords

def extract_keywords(text):

    words = re.findall(
        r"\b[a-zA-Z]{4,}\b",
        text.lower()
    )

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

    freq = {}

    for word in words:

        if word in stopwords:
            continue

        freq[word] = (
            freq.get(word, 0) + 1
        )

    sorted_words = sorted(
        freq.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        word
        for word, _
        in sorted_words[:20]
    ]


# Seniority

def extract_seniority(text):

    lines = text.splitlines()

    title_area = " ".join(lines[:5]).lower()

    levels = [
        "principal",
        "director",
        "manager",
        "lead",
        "senior",
        "mid",
        "associate",
        "junior",
        "intern",
    ]

    for level in levels:

        pattern = r"\b" + re.escape(level) + r"\b"

        if re.search(pattern, title_area):
            return level

    return None


# Industry

def extract_industry(text):

    text_lower = text.lower()

    for industry in INDUSTRIES:

        if industry in text_lower:
            return industry

    return None


# Domain

def extract_domain(text):

    text_lower = text.lower()

    scores = {}

    for domain, keywords in DOMAIN_KEYWORDS.items():

        score = 0

        for keyword in keywords:

            if keyword in text_lower:
                score += 1

        scores[domain] = score

    best_domain = max(
        scores,
        key=scores.get
    )

    if scores[best_domain] > 0:
        return best_domain

    return None


# Responsibilities

def extract_responsibilities(text):

    responsibilities_text = extract_section(
        text,
        [
            "responsibilities",
            "what you'll do",
            "what you will do",
            "job responsibilities",
        ]
    )

    responsibilities = []

    for line in responsibilities_text.splitlines():

        line = line.strip()

        if (
            line.startswith("-")
            or line.startswith("•")
        ):
            responsibilities.append(
                line.lstrip("-• ").strip()
            )

    return responsibilities


# Must Have

def classify_must_have(text):

    required_text = extract_section(
        text,
        [
            "required qualifications",
            "requirements",
            "must have",
        ]
    )

    return extract_skills_dictionary(
        required_text
    )


# Nice To Have

def classify_nice_to_have(text):

    nice_text = extract_section(
        text,
        [
            "preferred qualifications",
            "preferred skills",
            "nice to have",
            "good to have",
            "desired qualifications",
            "bonus points",
        ]
    )

    return extract_skills_dictionary(
        nice_text
    )


# Readability

def readability_score(text):

    words = len(text.split())

    sentences = max(
        len(sent_tokenize(text)),
        1
    )

    avg_words = words / sentences

    score = max(
        0,
        min(
            100,
            100 - avg_words
        )
    )

    return round(score, 2)

def extract_section(
    text,
    section_keywords
):

    lines = text.splitlines()

    collecting = False

    collected = []

    for line in lines:

        line_lower = line.lower().strip()

        # start collecting only if we are not already inside the section
        if (
            not collecting
            and any(
                keyword in line_lower
                for keyword in section_keywords
            )
        ):
            collecting = True
            continue

        if collecting:

            # stop at next major header
            headers = [
                "job responsibilities",
                "required qualifications",
                "requirements",
                "must have",
                "preferred qualifications",
                "preferred",
                "industry",
                "soft skills",
                "responsibilities",
                "required certifications",
            ]
            
            if any(
                line_lower.startswith(header)
                for header in headers
            ):
                break

            collected.append(line)

    return "\n".join(collected)

#detect duplicate requirements

def detect_duplicate_requirements(skills):

    seen = set()

    duplicates = []

    for skill in skills:

        if skill in seen:
            duplicates.append(skill)

        seen.add(skill)

    return list(set(duplicates))

#missing preferred qualifications

def detect_missing_requirements(
    experience,
    education,
    skills
):

    missing = []

    if not experience:
        missing.append(
            "experience requirement"
        )

    if not education:
        missing.append(
            "education requirement"
        )

    if not skills:
        missing.append(
            "skill requirement"
        )

    return missing