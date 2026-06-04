"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getJobs() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const supabase = createSupabaseServerClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUser.id)
    .maybeSingle();

  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", user?.id)
    .maybeSingle();

  if (!membership) {
    return [];
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false });

  return jobs ?? [];
}