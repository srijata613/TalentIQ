
import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type OrganizationMembership = {
  organization_id: string;
  role: string;
};

export type AuthenticatedContext = {
  clerkUserId: string;
  dbUserId: string;
  supabase: ReturnType<typeof createSupabaseServerClient>;
  memberships: OrganizationMembership[];
};

/**
 * Requires a signed-in Clerk user, a matching database user,
 * and a successfully retrieved list of organization memberships.
 */
export async function requireAuthenticatedContext(): Promise<AuthenticatedContext> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const supabase = createSupabaseServerClient();

  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUser.id)
    .maybeSingle();

  if (userError) {
    throw new Error("Unable to verify the database user.");
  }

  if (!dbUser) {
    throw new Error(
      "No database user was found for this Clerk account. Please sync your account first."
    );
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", dbUser.id);

  if (membershipError) {
    throw new Error("Unable to verify organization membership.");
  }

  return {
    clerkUserId: clerkUser.id,
    dbUserId: dbUser.id,
    supabase,
    memberships: (memberships ?? []) as OrganizationMembership[],
  };
}

/**
 * Verifies that the current user belongs to the resource's organization.
 * Call this before returning or modifying organization-owned resources.
 */
export function assertOrganizationAccess(
  context: AuthenticatedContext,
  organizationId: string | null | undefined
): asserts organizationId is string {
  if (
    !organizationId ||
    !context.memberships.some(
      (membership) => membership.organization_id === organizationId
    )
  ) {
    throw new Error("Forbidden: you do not have access to this organization.");
  }
}

/**
 * For creation flows that currently assume one organization per user.
 * Explicitly rejects ambiguous multi-organization membership rather
 * than silently choosing the wrong organization.
 */
export async function requireSingleOrganizationContext() {
  const context = await requireAuthenticatedContext();

  if (context.memberships.length === 0) {
    throw new Error(
      "You must belong to an organization before creating this resource."
    );
  }

  if (context.memberships.length > 1) {
    throw new Error(
      "Multiple organization memberships found. An active organization must be selected."
    );
  }

  const membership = context.memberships[0];

  return {
    ...context,
    organizationId: membership.organization_id,
    organizationRole: membership.role,
  };
}
