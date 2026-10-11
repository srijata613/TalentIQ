"use server";

import {
  assertOrganizationAccess,
  requireAuthenticatedContext,
} from "@/lib/authorization";

export async function cloneJob(jobId: string) {
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

  // Do not read versions or create a copy until access is verified.
  assertOrganizationAccess(context, job.organization_id);

  const {
    data: latestVersion,
    error: versionError,
  } = await supabase
    .from("job_versions")
    .select("*")
    .eq("job_id", jobId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (versionError) {
    throw new Error("Unable to load the source job version.");
  }

  const content = latestVersion?.content ?? "";

  const { data: newJob, error: createJobError } = await supabase
    .from("jobs")
    .insert({
      organization_id: job.organization_id,
      title: `${job.title} (Copy)`,
      status: job.status,
      current_version: 1,
      content,
    })
    .select()
    .single();

  if (createJobError || !newJob) {
    throw new Error("Unable to create the job copy.");
  }

  const { error: createVersionError } = await supabase
    .from("job_versions")
    .insert({
      job_id: newJob.id,
      version_number: 1,
      content,
    });

  if (createVersionError) {
    // The new job already exists; report the partial failure explicitly.
    throw new Error(
      "The job copy was created, but its initial version could not be saved."
    );
  }

  return newJob;
}
