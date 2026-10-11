"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function createOrganization(name: string) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const organizationName = name.trim();

  if (
    organizationName.length < 2 ||
    organizationName.length > 120
  ) {
    throw new Error(
      "Organization name must be between 2 and 120 characters."
    );
  }

  const slug = organizationName
    .toLowerCase()
    .replace(/\s+/g, "-");

  const supabase = createSupabaseServerClient();

  const { data: organization, error } = await supabase.rpc(
    "create_organization",
    {
      p_name: organizationName,
      p_slug: slug,
    }
  );

  if (error) {
    throw new Error(
      `Failed to create organization: ${error.message}`
    );
  }

  return organization;
}
