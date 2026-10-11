"use server";

import { requireSingleOrganizationContext } from "@/lib/authorization";

export async function createCandidate(
  fileName: string,
  fileUrl: string
) {
  if (!fileName?.trim()) {
    throw new Error("A resume file name is required.");
  }

  if (!fileUrl?.trim()) {
    throw new Error("A resume storage path is required.");
  }

  // Authenticate the user and require exactly one organization membership.
  const { supabase, organizationId } =
    await requireSingleOrganizationContext();

  // Create the candidate within the authenticated user's organization.
  const { data: candidate, error } = await supabase
    .from("candidates")
    .insert({
      organization_id: organizationId,
      resume_file_name: fileName.trim(),
      resume_storage_path: fileUrl.trim(),
    })
    .select()
    .single();

  if (error || !candidate) {
    throw new Error("Unable to create the candidate record.");
  }

  return candidate;
}