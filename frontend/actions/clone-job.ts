"use server";

import { createSupabaseServerClient }
  from "@/lib/supabase-server";

export async function cloneJob(
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

  if (!job) {
    throw new Error(
      "Job not found"
    );
  }

  const {
    data: latestVersion,
  } =
    await supabase
      .from("job_versions")
      .select("*")
      .eq(
        "job_id",
        jobId
      )
      .order(
        "version_number",
        {
          ascending: false,
        }
      )
      .limit(1)
      .single();

  const {
    data: newJob,
    error,
  } =
    await supabase
      .from("jobs")
      .insert({
        organization_id:
          job.organization_id,

        title:
          `${job.title} (Copy)`,

        status:
          job.status,

        current_version: 1,

        content:
          latestVersion?.content ??
          "",
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  await supabase
    .from("job_versions")
    .insert({
      job_id:
        newJob.id,

      version_number: 1,

      content:
        latestVersion?.content ??
        "",
    });

  return newJob;
}