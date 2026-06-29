from enum import Enum


class NodeType(str, Enum):

    CANDIDATE = "Candidate"

    SKILL = "Skill"

    PROJECT = "Project"

    COMPANY = "Company"

    ROLE = "Role"

    CERTIFICATION = "Certification"

    EDUCATION = "Education"

    UNIVERSITY = "University"

    TECHNOLOGY = "Technology"

    ACHIEVEMENT = "Achievement"

    DOMAIN = "Domain"

    INDUSTRY = "Industry"

    LANGUAGE = "Language"

    PUBLICATION = "Publication"

    AWARD = "Award"


class RelationshipType(str, Enum):

    HAS_SKILL = "HAS_SKILL"

    BUILT = "BUILT"

    WORKED_AT = "WORKED_AT"

    HAS_ROLE = "HAS_ROLE"

    EARNED = "EARNED"

    STUDIED_AT = "STUDIED_AT"

    RELATED_TO = "RELATED_TO"

    USES_TECHNOLOGY = "USES_TECHNOLOGY"

    BELONGS_TO_DOMAIN = "BELONGS_TO_DOMAIN"

    BELONGS_TO_INDUSTRY = "BELONGS_TO_INDUSTRY"

    RECEIVED_AWARD = "RECEIVED_AWARD"

    AUTHORED = "AUTHORED"