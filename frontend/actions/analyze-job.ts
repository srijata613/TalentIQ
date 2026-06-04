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

  const result = await response.json();
  console.log("ANALYSIS RESULT:", result);

  const supabase = createSupabaseServerClient();

  await supabase
  .from("job_analysis")
  .upsert(
    {
      job_id: jobId,

      required_skills: result.skills,

      experience_requirements: result.experience
        ? [result.experience]
        : [],

      education_requirements: result.education ?? [],

      certifications: result.certifications ?? [],
    },
    {
      onConflict: "job_id",
    }
  );

  return result;
}