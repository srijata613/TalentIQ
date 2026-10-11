"use server";

import {
  assertOrganizationAccess,
  requireAuthenticatedContext,
} from "@/lib/authorization";

export async function getJobMatches(jobId: string) {
  if (!jobId?.trim()) {
    throw new Error("A job ID is required.");
  }

  const context = await requireAuthenticatedContext();
  const { supabase } = context;

  // Verify that the requested job exists and belongs to an
  // organization the signed-in user can access.
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, organization_id")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError || !job) {
    throw new Error("Job not found or unavailable to this account.");
  }

  assertOrganizationAccess(context, job.organization_id);

  // The embedded inner join restricts returned matches to candidates
  // belonging to the authorized job's organization.
  const { data, error } = await supabase
    .from("candidate_matches")
    .select(`
      *,
      candidates!inner (
        id,
        parsed_name,
        parsed_email,
        parsed_skills,
        organization_id
      )
    `)
    .eq("job_id", jobId)
    .eq("candidates.organization_id", job.organization_id)
    .order("final_score", { ascending: false });

  if (error) {
    throw new Error("Unable to load the job's matching results.");
  }

  // Preserve the existing response shape without returning the
  // internal organization ID in each nested candidate object.
  return (data ?? []).map((match) => {
    const candidate = match.candidates;

    return {
      ...match,
      candidates: {
        id: candidate.id,
        parsed_name: candidate.parsed_name,
        parsed_email: candidate.parsed_email,
        parsed_skills: candidate.parsed_skills,
      },
    };
  });
}
