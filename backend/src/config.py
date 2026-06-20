#model name
MODEL_NAME = "BAAI/bge-large-en-v1.5"

#thresholds
SKILL_THRESHOLD_SHORT = 0.80
SKILL_THRESHOLD_NORMAL = 0.70

EXPERIENCE_NORMALIZATION_FLOOR = 0.40

# wights
SKILL_WEIGHT = 0.35
EXPERIENCE_WEIGHT = 0.20
EDUCATION_WEIGHT = 0.10
BONUS_WEIGHT = 0.05

# priority multipliers
PRIORITY_MULTIPLIER = 1.5
EXPERIENCE_PRIORITY_MULTIPLIER = 1.3

LEADERSHIP_WEIGHT = 0.05
COMMUNICATION_WEIGHT = 0.05
DOMAIN_WEIGHT = 0.05
CERTIFICATION_WEIGHT = 0.05

INDUSTRY_WEIGHT = 0.05

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