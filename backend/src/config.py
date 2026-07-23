from dotenv import load_dotenv
import os

load_dotenv()

#model name
MODEL_NAME = "BAAI/bge-m3"

#thresholds
SKILL_THRESHOLD_SHORT = 0.80
SKILL_THRESHOLD_NORMAL = 0.70

EXPERIENCE_NORMALIZATION_FLOOR = 0.40

# wights
SKILL_WEIGHT = 0.35
EXPERIENCE_WEIGHT = 0.20
EDUCATION_WEIGHT = 0.05
BONUS_WEIGHT = 0.05

# priority multipliers
PRIORITY_MULTIPLIER = 1.5
EXPERIENCE_PRIORITY_MULTIPLIER = 1.3

LEADERSHIP_WEIGHT = 0.10
COMMUNICATION_WEIGHT = 0.05
DOMAIN_WEIGHT = 0.10
CERTIFICATION_WEIGHT = 0.05

INDUSTRY_WEIGHT = 0.05

# Matching Engine Weights
MATCHING_WEIGHTS = {
    "skill": 0.35,
    "experience": 0.25,
    "education": 0.10,
    "certification": 0.10,
    "project": 0.10,
    "context": 0.10,
}

# Recruiter Recommendation Thresholds
STRONG_HIRE_THRESHOLD = 85
HIRE_THRESHOLD = 70
BORDERLINE_THRESHOLD = 50

# AI Profile Confidence Weights
CONFIDENCE_WEIGHTS = {
    "resume_quality": 0.30,
    "risk": 0.20,
    "matching": 0.50,
}

# Risk Levels
LOW_RISK_THRESHOLD = 20
MEDIUM_RISK_THRESHOLD = 40
HIGH_RISK_THRESHOLD = 60

RISK_WEIGHTS = {
    "skill": 0.25,
    "keyword": 0.15,
    "gap": 0.20,
    "hopping": 0.15,
    "inconsistency": 0.10,
    "ai": 0.15
}

DUPLICATE_THRESHOLD = 0.75
MAX_KEYWORD_REPEAT = 20

# Explainable AI Configuration
EXCELLENT_MATCH_THRESHOLD = 0.80
STRONG_MATCH_THRESHOLD = 0.70

VERY_HIGH_CONFIDENCE = 85
HIGH_CONFIDENCE = 70
MEDIUM_CONFIDENCE = 55

# Feature Attribution (%)
FEATURE_ATTRIBUTION = {

    "skills": 35,

    "experience": 20,

    "education": 5,

    "certifications": 10,

    "projects": 15,

    "context": 15,
}

EXPLAINER_THRESHOLDS = {
    "strong": 85,
    "matched": 70,
    "weak": 50,
}

PRIORITY_TERMS = [
    "required",
    "must",
    "mandatory",
    "essential",
    "minimum requirement"
]

LLM_PROVIDER = os.getenv(
    "LLM_PROVIDER",
    "gemini"
)

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-2.5-flash"
)

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

DOMAIN_KEYWORDS = {
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
SKILL_TAXONOMY = {

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