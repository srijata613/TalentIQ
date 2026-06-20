"use server";

import { createSupabaseServerClient }
  from "@/lib/supabase-server";

export async function matchCandidates(
  jobId: string
) {
  const supabase =
    createSupabaseServerClient();

  const { data: versions } =
    await supabase
      .from("job_versions")
      .select("*")
      .eq("job_id", jobId)
      .order(
        "version_number",
        {
          ascending: false,
        }
      )
      .limit(1);

  const jobContent =
    versions?.[0]?.content;

  if (!jobContent) {
    throw new Error(
      "Job description not found"
    );
  }

  const { data: candidates } =
    await supabase
      .from("candidates")
      .select("*")
      .eq("status", "parsed")
      .not(
        "resume_text",
        "is",
        null
      );

  if (!candidates?.length) {
    return [];
  }

  const response = await fetch(
    "http://127.0.0.1:8000/rank",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        job_description:
          jobContent,

        resumes:
          candidates.map(
            (c) =>
              c.resume_text
          ),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Ranking failed"
    );
  }

  const rankingResult =
    await response.json();

  const results =
    rankingResult.results ?? [];

  return results.map(
    (
      result: any,
      index: number
    ) => ({
      candidate:
        candidates[index],

      ranking:
        result,
    })
  );
}