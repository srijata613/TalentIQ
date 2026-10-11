"use server";

import { requireAuthenticatedContext } from "@/lib/authorization";

export async function getJobs() {
  const context = await requireAuthenticatedContext();
  const { supabase, memberships } = context;

  // Preserve the existing behavior for users without an organization.
  if (memberships.length === 0) {
    return [];
  }

  // Do not silently select an arbitrary workspace.
  if (memberships.length > 1) {
    throw new Error(
      "Multiple organization memberships found. An active organization must be selected."
    );
  }

  const membership = memberships[0];

  if (!membership.organization_id) {
    return [];
  }

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false });

  if (jobsError) {
    throw new Error("Unable to retrieve jobs for this workspace.");
  }

  return jobs ?? [];
}