"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function analyzeJob(
  jobId: string,
  content: string
) {
  const response = await fetch(
    "http://127.0.0.1:8000/jobs/analyze",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Analysis failed: ${response.status}`
    );
  }

  const result = await response.json();

  console.log(
    "ANALYSIS RESULT:",
    result
  );

  const supabase =
    createSupabaseServerClient();

  const { error } = await supabase
    .from("job_analysis")
    .upsert(
      {
        job_id: jobId,

        required_skills:
          result.required_skills ?? [],

        preferred_skills:
          result.preferred_skills ?? [],

        responsibilities:
          result.responsibilities ?? [],

        experience_requirements:
          result.experience
            ? [result.experience]
            : [],

        education_requirements:
          result.education ?? [],

        certifications:
          result.certifications ?? [],

        seniority:
          result.seniority,

        industry:
          result.industry,

        domain:
          result.domain,

        technologies:
          result.technologies ?? [],

        tools:
          result.tools ?? [],

        soft_skills:
          result.soft_skills ?? [],

        keywords:
          result.keywords ?? [],

        must_have:
          result.must_have ?? [],

        nice_to_have:
          result.nice_to_have ?? [],

        readability_score:
          result.readability_score,
      },
      {
        onConflict: "job_id",
      }
    );

  if (error) {
    console.error(
      "UPSERT ERROR:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return result;
}