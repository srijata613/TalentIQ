"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function createJobFromPdf(
  title: string,
  storagePath: string,
  fileName: string
) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const supabase =
    createSupabaseServerClient();

  const { data: user } =
    await supabase
      .from("users")
      .select("*")
      .eq(
        "clerk_user_id",
        clerkUser.id
      )
      .single();

  const { data: membership } =
    await supabase
      .from("memberships")
      .select("*")
      .eq(
        "user_id",
        user?.id
      )
      .single();

  const { data: job, error } =
    await supabase
      .from("jobs")
      .insert({
        organization_id:
          membership?.organization_id,

        title,

        status: "draft",

        current_version: 1,

        jd_storage_path:
          storagePath,

        jd_file_name:
          fileName,

        source: "pdf",
      })
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  return job;
}