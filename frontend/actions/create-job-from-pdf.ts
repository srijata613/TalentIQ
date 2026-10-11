"use server";

import { requireSingleOrganizationContext } from "@/lib/authorization";

export async function createJobFromPdf(
  title: string,
  storagePath: string,
  fileName: string
) {
  if (!title?.trim()) {
    throw new Error("A job title is required.");
  }

  if (!storagePath?.trim()) {
    throw new Error("A job-description storage path is required.");
  }

  if (!fileName?.trim()) {
    throw new Error("A job-description file name is required.");
  }

  // Authenticate the user and verify their organization membership.
  const { supabase, organizationId } =
    await requireSingleOrganizationContext();

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      organization_id: organizationId,
      title: title.trim(),
      status: "draft",
      current_version: 1,
      jd_storage_path: storagePath.trim(),
      jd_file_name: fileName.trim(),
      source: "pdf",
    })
    .select()
    .single();

  if (error || !job) {
    throw new Error("Unable to create the job record.");
  }

  return job;
}