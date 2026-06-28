"use server";

import { createSupabaseServerClient }
  from "@/lib/supabase-server";

export async function getJobMatches(
  jobId: string
) {
  const supabase =
    createSupabaseServerClient();

  const { data, error } =
    await supabase
      .from("candidate_matches")
      .select(`
        *,
        candidates (
          id,
          parsed_name,
          parsed_email,
          parsed_skills
        )
      `)
      .eq("job_id", jobId)
      .order(
        "final_score",
        {
          ascending: false,
        }
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data ?? [];
}