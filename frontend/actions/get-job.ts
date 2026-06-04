"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getJob(jobId: string) {
  const supabase = createSupabaseServerClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  const { data: versions } = await supabase
    .from("job_versions")
    .select("*")
    .eq("job_id", jobId)
    .order("version_number", { ascending: false });

    const { data: analysis } = await supabase
    .from("job_analysis")
    .select("*")
    .eq("job_id", jobId)
    .maybeSingle();

  return {
    job,
    versions: versions ?? [],
    analysis: analysis ?? null,
  };
}