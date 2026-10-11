"use server";

import { requireSingleOrganizationContext } from "@/lib/authorization";

export async function createJob(
  title: string,
  description: string
) {
  if (!title?.trim()) {
    throw new Error("A job title is required.");
  }

  if (!description?.trim()) {
    throw new Error("A job description is required.");
  }

  const { supabase, organizationId } =
    await requireSingleOrganizationContext();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      organization_id: organizationId,
      title: title.trim(),
      content: description,
    })
    .select()
    .single();

  if (jobError || !job) {
    throw new Error("Unable to create the job.");
  }

  const { error: versionError } = await supabase
    .from("job_versions")
    .insert({
      job_id: job.id,
      version_number: 1,
      content: description,
    });

  if (versionError) {
    throw new Error(
      "The job was created, but its initial version could not be saved."
    );
  }

  return job;
}