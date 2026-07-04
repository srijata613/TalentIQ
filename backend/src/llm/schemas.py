from pydantic import BaseModel, Field


class ResumeExtraction(BaseModel):

    parsed_name: str | None = None
    parsed_email: str | None = None
    parsed_phone: str | None = None
    parsed_linkedin: str | None = None
    parsed_github: str | None = None
    parsed_portfolio: str | None = None

    parsed_summary: str | None = None
    parsed_location: str | None = None

    parsed_cgpa: float | None = None

    parsed_experience_years: float = Field(
        default=0.0,
        description="Total professional experience in years."
    )

    parsed_skills: list[str] = Field(default_factory=list)

    # NEW
    parsed_inferred_skills: list[str] = Field(default_factory=list)

    parsed_degrees: list[str] = Field(default_factory=list)
    parsed_graduation_years: list[str] = Field(default_factory=list)
    parsed_designations: list[str] = Field(default_factory=list)

    parsed_projects: list[str] = Field(default_factory=list)

    parsed_project_technologies: list[str] = Field(default_factory=list)
    parsed_project_impacts: list[str] = Field(default_factory=list)

    parsed_certifications: list[str] = Field(default_factory=list)

    parsed_achievements: list[str] = Field(default_factory=list)

    parsed_universities: list[str] = Field(default_factory=list)

    parsed_companies: list[str] = Field(default_factory=list)

    parsed_leadership_signals: list[str] = Field(default_factory=list)

    parsed_publications: list[str] = Field(default_factory=list)

    parsed_open_source: list[str] = Field(default_factory=list)

    resume_text: str = ""


class JobExtraction(BaseModel):

    title: str | None = None

    required_skills: list[str] = Field(default_factory=list)

    preferred_skills: list[str] = Field(default_factory=list)

    experience_years: float = 0.0

    education: list[str] = Field(default_factory=list)

    certifications: list[str] = Field(default_factory=list)

    responsibilities: list[str] = Field(default_factory=list)

    technologies: list[str] = Field(default_factory=list)

    tools: list[str] = Field(default_factory=list)

    domain: str | None = None

    industry: str | None = None

    seniority: str | None = None

    content: str = ""