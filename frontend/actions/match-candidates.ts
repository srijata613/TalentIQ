"use server";

import { createSupabaseServerClient }
from "@/lib/supabase-server";

export async function matchCandidates(
  jobId: string
) {

  const supabase =
    createSupabaseServerClient();

  const { data: job } =
    await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

  const { data: version } =
    await supabase
      .from("job_versions")
      .select("*")
      .eq("job_id", jobId)
      .order(
        "version_number",
        { ascending: false }
      )
      .limit(1)
      .single();

  const { data: candidates } =
    await supabase
      .from("candidates")
      .select("*")
      .eq(
        "organization_id",
        job.organization_id
      );

  if (
    !version ||
    !candidates
  ) {
    return;
  }

  for (
    const candidate
    of candidates
  ) {

    if (
      !candidate.resume_text
    ) {
      continue;
    }

    const response =
      await fetch(
        "http://127.0.0.1:8000/match",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            job_text:
              version.content,
            resume_text:
              candidate.resume_text,
          }),
        }
      );

    const result =
      await response.json();

    await supabase
      .from(
        "candidate_matches"
      )
      .upsert({
        job_id: jobId,
        candidate_id:
          candidate.id,

        ...result,
      });
  }
}