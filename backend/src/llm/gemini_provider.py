import os

from dotenv import load_dotenv

from google import genai
from google.genai import types

from .schemas import (
    ResumeExtraction,
    JobExtraction,
)
from .prompts import (
    RESUME_EXTRACTION_PROMPT,
    JOB_EXTRACTION_PROMPT,
)


load_dotenv()


class GeminiProvider:

    def __init__(self):

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY not found."
            )

        self.client = genai.Client(
            api_key=api_key
        )

        self.model = "gemini-2.5-flash"

    def extract_resume(
        self,
        resume_text: str,
    ) -> ResumeExtraction:

        response = self.client.models.generate_content(

            model=self.model,

            contents=[
                RESUME_EXTRACTION_PROMPT,
                resume_text,
            ],

            config=types.GenerateContentConfig(

                temperature=0,

                response_mime_type="application/json",

                response_schema=ResumeExtraction,
            ),
        )

        return response.parsed
    
    def extract_job(
        self,
        jd_text: str,
    ) -> JobExtraction:

        response = self.client.models.generate_content(

            model=self.model,

            contents=[
                JOB_EXTRACTION_PROMPT,
                jd_text,
            ],

            config=types.GenerateContentConfig(

                temperature=0,

                response_schema=JobExtraction,

                response_mime_type="application/json",
            ),
        )

        return response.parsed