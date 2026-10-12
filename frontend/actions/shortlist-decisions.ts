"use server";

import {
  assertOrganizationAccess,
  requireAuthenticatedContext,
} from "@/lib/authorization";

export type ReviewDecision = "shortlist" | "review" | "decline";

const VALID_DECISIONS = new Set<ReviewDecision>([
  "shortlist",
  "review",
  "decline",
]);

type StoredDecision = {
  candidate_id: string;
  decision: string;
};

async function getAuthorizedJob(jobId: string) {
  if (typeof jobId !== "string" || !jobId.trim()) {
    throw new Error("A valid job ID is required.");
  }

  const context = await requireAuthenticatedContext();
  const { supabase } = context;

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, organization_id")
    .eq("id", jobId)
    .maybeSingle();

  if (error || !job) {
    throw new Error("Job not found or unavailable to this account.");
  }

  assertOrganizationAccess(context, job.organization_id);

  return {
    context,
    job,
  };
}

export async function loadShortlistDecisions(
  jobId: string,
): Promise<Record<string, ReviewDecision>> {
  const { context, job } = await getAuthorizedJob(jobId);

  const { data, error } = await context.supabase
    .from("shortlist_decisions")
    .select("candidate_id, decision")
    .eq("job_id", job.id)
    .eq("organization_id", job.organization_id);

  if (error) {
    throw new Error("Unable to load saved recruiter decisions.");
  }

  const decisions: Record<string, ReviewDecision> = {};

  for (const row of (data ?? []) as StoredDecision[]) {
    if (
      row.decision === "shortlist" ||
      row.decision === "review" ||
      row.decision === "decline"
    ) {
      decisions[row.candidate_id] = row.decision;
    }
  }

  return decisions;
}

export async function saveShortlistDecision(
  jobId: string,
  candidateId: string,
  decision: ReviewDecision,
): Promise<void> {
  if (typeof candidateId !== "string" || !candidateId.trim()) {
    throw new Error("A valid candidate ID is required.");
  }

  if (!VALID_DECISIONS.has(decision)) {
    throw new Error("Invalid recruiter decision.");
  }

  const { context, job } = await getAuthorizedJob(jobId);
  const { supabase, dbUserId } = context;

  // Verify that the candidate is in the same organization as this job.
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id")
    .eq("id", candidateId)
    .eq("organization_id", job.organization_id)
    .maybeSingle();

  if (candidateError || !candidate) {
    throw new Error("Candidate not found or unavailable to this account.");
  }

  // Recruiter decisions are available only for candidates with a saved
  // matching result for this particular job.
  const { data: match, error: matchError } = await supabase
    .from("candidate_matches")
    .select("id")
    .eq("job_id", job.id)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (matchError || !match) {
    throw new Error(
      "Run matching for this job before recording a recruiter decision.",
    );
  }

  const { error: saveError } = await supabase
    .from("shortlist_decisions")
    .upsert(
      {
        organization_id: job.organization_id,
        job_id: job.id,
        candidate_id: candidateId,
        decision,
        decided_by: dbUserId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "job_id,candidate_id",
      },
    );

  if (saveError) {
    throw new Error("Unable to save the recruiter decision.");
  }
}

export async function clearShortlistDecisions(
  jobId: string,
): Promise<void> {
  const { context, job } = await getAuthorizedJob(jobId);

  const { error } = await context.supabase
    .from("shortlist_decisions")
    .delete()
    .eq("job_id", job.id)
    .eq("organization_id", job.organization_id);

  if (error) {
    throw new Error("Unable to clear the saved recruiter decisions.");
  }
}