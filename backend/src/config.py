from __future__ import annotations

import os
from typing import Final

from dotenv import load_dotenv

load_dotenv()
CONFIG_VERSION: Final[str] = "1.0.0"
PIPELINE_VERSION: Final[str] = "1.0.0"

#model name
MODEL_NAME: Final[str] = "BAAI/bge-large-en-v1.5"
MIN_MATCH_SCORE: Final[float] = 0.0
MAX_MATCH_SCORE: Final[float] = 100.0
DEFAULT_MATCH_SCORE: Final[float] = 0.0

MATCH_RESULT_THRESHOLD: Final[float] = 70.0
MAX_LEADERSHIP_SIGNALS: Final[int] = 5

#thresholds
SKILL_THRESHOLD_SHORT: Final[float] = 0.80
SKILL_THRESHOLD_NORMAL: Final[float] = 0.70

EXPERIENCE_NORMALIZATION_FLOOR: Final[float] = 0.40

# wights
SKILL_WEIGHT: Final[float] = 0.35
EXPERIENCE_WEIGHT: Final[float] = 0.20
EDUCATION_WEIGHT: Final[float] = 0.05
BONUS_WEIGHT: Final[float] = 0.05

PRIORITY_MULTIPLIER: Final[float] = 1.5
EXPERIENCE_PRIORITY_MULTIPLIER: Final[float] = 1.3

LEADERSHIP_WEIGHT: Final[float] = 0.10
COMMUNICATION_WEIGHT: Final[float] = 0.05
DOMAIN_WEIGHT: Final[float] = 0.10
CERTIFICATION_WEIGHT: Final[float] = 0.05
INDUSTRY_WEIGHT: Final[float] = 0.05


# Matching Engine Weights
MATCHING_WEIGHTS: Final[dict[str, float]] = {
    "skill": 0.35,
    "experience": 0.25,
    "education": 0.10,
    "certification": 0.10,
    "project": 0.10,
    "context": 0.10,
}

# Recruiter Recommendation Thresholds
STRONG_HIRE_THRESHOLD: Final[int] = 85
HIRE_THRESHOLD: Final[int] = 70
BORDERLINE_THRESHOLD: Final[int] = 50

# AI Profile Confidence Weights
VERY_HIGH_CONFIDENCE: Final[int] = 85
HIGH_CONFIDENCE: Final[int] = 70
MEDIUM_CONFIDENCE: Final[int] = 55

CONFIDENCE_WEIGHTS: Final[dict[str, float]] = {
    "resume_quality": 0.30,
    "risk": 0.20,
    "matching": 0.50,
}

# Risk Levels
LOW_RISK_THRESHOLD: Final[int] = 20
MEDIUM_RISK_THRESHOLD: Final[int] = 40
HIGH_RISK_THRESHOLD: Final[int] = 60

RISK_WEIGHTS: Final[dict[str, float]] = {
    "skill": 0.25,
    "keyword": 0.15,
    "gap": 0.20,
    "hopping": 0.15,
    "inconsistency": 0.10,
    "ai": 0.15,
}

DUPLICATE_THRESHOLD: Final[float] = 0.75
MAX_KEYWORD_REPEAT: Final[int] = 20

# Explainable AI Configuration
EXCELLENT_MATCH_THRESHOLD: Final[float] = 0.80
STRONG_MATCH_THRESHOLD: Final[float] = 0.70

FEATURE_ATTRIBUTION: Final[dict[str, int]] = {
    "skills": 35,
    "experience": 20,
    "education": 5,
    "certifications": 10,
    "projects": 15,
    "context": 15,
}

EXPLAINER_THRESHOLDS: Final[dict[str, int]] = {
    "strong": 85,
    "matched": 70,
    "weak": 50,
}

PRIORITY_TERMS: Final[list[str]] = [
    "required",
    "must",
    "mandatory",
    "essential",
    "minimum requirement",
]

LLM_PROVIDER: Final[str] = os.getenv(
    "LLM_PROVIDER",
    "gemini",
)

GEMINI_API_KEY: Final[str | None] = os.getenv(
    "GEMINI_API_KEY"
)

GEMINI_MODEL: Final[str] = os.getenv(
    "GEMINI_MODEL",
    "gemini-2.5-flash",
)

def _validate_weight_sum(
    name: str,
    weights: dict[str, float],
) -> None:
    total = round(sum(weights.values()), 6)

    if abs(total - 1.0) > 1e-6:
        raise ValueError(
            f"{name} must sum to 1.0 (current={total})"
        )


_validate_weight_sum(
    "MATCHING_WEIGHTS",
    MATCHING_WEIGHTS,
)

_validate_weight_sum(
    "CONFIDENCE_WEIGHTS",
    CONFIDENCE_WEIGHTS,
)

_validate_weight_sum(
    "RISK_WEIGHTS",
    RISK_WEIGHTS,
)

if (
    LLM_PROVIDER.lower() == "gemini"
    and not GEMINI_API_KEY
):
    raise RuntimeError(
        "GEMINI_API_KEY is required when using Gemini."
    )

# keywords
DEGREE_KEYWORDS: Final[list[str]] = [
    "bachelor", "b.tech", "bsc",
    "master", "m.tech", "msc", "phd"
]

FIELD_KEYWORDS: Final[list[str]] = [
    "computer science",
    "engineering",
    "data science",
    "information technology"
]

DOMAIN_KEYWORDS: Final[dict[str, list[str]]] = {
    "machine learning": [
        "machine learning",
        "deep learning",
        "pytorch",
        "tensorflow",
        "scikit-learn",
    ],

    "nlp": [
        "nlp",
        "natural language processing",
        "transformers",
        "hugging face",
        "llm",
        "rag",
        "langchain",
    ],

    "computer vision": [
        "computer vision",
        "opencv",
        "image processing",
    ],

    "data engineering": [
        "data engineering",
        "etl",
        "airflow",
        "spark",
        "hadoop",
    ],

    "backend engineering": [
        "fastapi",
        "django",
        "flask",
        "node.js",
        "microservices",
    ],

    "cloud engineering": [
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
    ],

    "frontend engineering": [
        "react",
        "next.js",
        "vue",
        "angular",
    ],

    "cybersecurity": [
        "cybersecurity",
        "penetration testing",
        "ethical hacking",
        "owasp",
    ]
}
# skills
SKILL_TAXONOMY: Final[dict[str, list[str]]] = {

    "programming": [
        "python",
        "java",
        "c",
        "c++",
        "c#",
        "javascript",
        "typescript",
        "go",
        "rust",
        "kotlin",
        "swift",
        "php",
        "ruby",
        "scala",
        "r",
        "matlab",
        "sql",
        "perl",
        "bash",
    ],

    "frontend": [
        "html",
        "css",
        "sass",
        "bootstrap",
        "tailwind",
        "javascript",
        "typescript",
        "react",
        "next.js",
        "vue",
        "nuxt",
        "angular",
        "redux",
        "jquery",
    ],

    "backend": [
        "fastapi",
        "django",
        "flask",
        "node.js",
        "express",
        "spring boot",
        "laravel",
        "asp.net",
        "graphql",
        "rest api",
        "microservices",
    ],

    "mobile": [
        "android",
        "ios",
        "flutter",
        "react native",
        "kotlin",
        "swift",
        "xamarin",
    ],

    "database": [
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "sqlite",
        "redis",
        "oracle",
        "cassandra",
        "dynamodb",
        "firebase",
        "supabase",
    ],

    "cloud": [
        "aws",
        "azure",
        "gcp",
        "amazon web services",
        "google cloud",
        "ec2",
        "s3",
        "lambda",
        "eks",
        "ecs",
        "cloudformation",
    ],

    "devops": [
        "docker",
        "kubernetes",
        "terraform",
        "jenkins",
        "ansible",
        "github actions",
        "gitlab ci",
        "ci/cd",
        "helm",
        "nginx",
    ],

    "data": [
        "pandas",
        "numpy",
        "data analysis",
        "data engineering",
        "data visualization",
        "tableau",
        "power bi",
        "etl",
        "spark",
        "hadoop",
        "airflow",
    ],

    "ml_ai": [
        "machine learning",
        "deep learning",
        "nlp",
        "computer vision",
        "transformers",
        "hugging face",
        "langchain",
        "llm",
        "rag",
        "fine tuning",
        "lora",
        "pytorch",
        "tensorflow",
        "keras",
        "scikit-learn",
        "xgboost",
        "lightgbm",
        "opencv",
    ],

    "security": [
        "cybersecurity",
        "penetration testing",
        "ethical hacking",
        "owasp",
        "siem",
        "soc",
        "iam",
        "oauth",
        "jwt",
    ],

    "tools": [
        "git",
        "github",
        "gitlab",
        "jira",
        "confluence",
        "postman",
        "swagger",
        "figma",
        "streamlit",
        "mlflow",
        "databricks",
        "snowflake",
    ],

    "soft_skills": [
        "communication",
        "written communication",
        "verbal communication",
        "leadership",
        "teamwork",
        "collaboration",
        "problem solving",
        "critical thinking",
        "analytical thinking",
        "adaptability",
        "stakeholder management",
        "time management",
        "ownership",
        "initiative",
        "mentoring",
        "negotiation",
        "presentation",
    ]
}

SKILL_ALIASES: Final[dict[str, list[str]]] = {
    "javascript": ["js", "ecmascript"],
    "typescript": ["ts"],
    "react": ["reactjs", "react.js"],
    "next.js": ["next", "nextjs"],
    "node.js": ["node", "nodejs"],
    "express": ["expressjs", "express.js"],
    "postgresql": ["postgres", "psql"],
    "mongodb": ["mongo"],
    "machine learning": ["ml"],
    "deep learning": ["dl"],
    "artificial intelligence": ["ai"],
    "natural language processing": ["nlp"],
    "computer vision": ["cv"],
    "amazon web services": ["aws"],
    "google cloud platform": ["gcp"],
    "microsoft azure": ["azure"],
}