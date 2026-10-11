"use server";

import {
  assertOrganizationAccess,
  requireAuthenticatedContext,
} from "@/lib/authorization";

export async function getJob(jobId: string) {
  if (!jobId?.trim()) {
    throw new Error("A job ID is required.");
  }

  const context = await requireAuthenticatedContext();
  const { supabase } = context;

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError || !job) {
    throw new Error("Job not found or unavailable to this account.");
  }

  // Authorize before retrieving the job's related data.
  assertOrganizationAccess(context, job.organization_id);

  const [
    { data: versions, error: versionsError },
    { data: analysis, error: analysisError },
  ] = await Promise.all([
    supabase
      .from("job_versions")
      .select("*")
      .eq("job_id", jobId)
      .order("version_number", { ascending: false }),

    supabase
      .from("job_analysis")
      .select("*")
      .eq("job_id", jobId)
      .maybeSingle(),
  ]);

  if (versionsError || analysisError) {
    throw new Error("Unable to load the job details.");
  }

  return {
    job,
    versions: versions ?? [],
    analysis: analysis ?? null,
  };
}
