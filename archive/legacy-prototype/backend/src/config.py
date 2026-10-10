#model name
MODEL_NAME = "BAAI/bge-large-en-v1.5"

#thresholds
SKILL_THRESHOLD_SHORT = 0.80
SKILL_THRESHOLD_NORMAL = 0.70

EXPERIENCE_NORMALIZATION_FLOOR = 0.40

# wights
SKILL_WEIGHT = 0.5
EXPERIENCE_WEIGHT = 0.3
EDUCATION_WEIGHT = 0.1
BONUS_WEIGHT = 0.1

# priority multipliers
PRIORITY_MULTIPLIER = 1.5
EXPERIENCE_PRIORITY_MULTIPLIER = 1.3

PRIORITY_TERMS = [
    "required",
    "must",
    "mandatory",
    "essential",
    "minimum requirement"
]

# keywords
DEGREE_KEYWORDS = [
    "bachelor", "b.tech", "bsc",
    "master", "m.tech", "msc", "phd"
]

FIELD_KEYWORDS = [
    "computer science",
    "engineering",
    "data science",
    "information technology"
]

# skills
TECH_SKILLS = {
    "programming": ["python", "java", "c++", "javascript", "sql"],
    "ml_ai": ["machine learning", "deep learning", "pytorch", "tensorflow", "nlp", "computer vision"],
    "backend": ["fastapi", "django", "flask", "node.js", "rest api", "microservices"],
    "cloud_devops": ["aws", "gcp", "azure", "docker", "kubernetes"],
    "data": ["pandas", "numpy", "scikit-learn", "data analysis", "data engineering"]
}