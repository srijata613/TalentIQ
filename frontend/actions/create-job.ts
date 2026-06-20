"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function createJob(
  title: string,
  description: string
) {
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
    throw new Error("Organization not found");
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      organization_id: membership.organization_id,
      title,
      content: description,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase
    .from("job_versions")
    .insert({
      job_id: job.id,
      version_number: 1,
      content: description,
    });

  return job;
}