"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function createCandidate(
  fileName: string,
  fileUrl: string
) {
  const clerkUser = await currentUser();

  console.log("CLERK USER:", clerkUser?.id);

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const supabase = createSupabaseServerClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUser.id)
    .single();

  console.log("USER:", user);
  console.log("USER ERROR:", userError);

  const { data: membership, error: membershipError } =
    await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", user?.id)
      .single();

  console.log("MEMBERSHIP:", membership);
  console.log("MEMBERSHIP ERROR:", membershipError);

  const { data: candidate, error } = await supabase
    .from("candidates")
    .insert({
      organization_id: membership?.organization_id,
      resume_file_name: fileName,
      resume_storage_path: fileUrl,
    })
    .select()
    .single();

  console.log("CANDIDATE:", candidate);
  console.log("CANDIDATE ERROR:", error);

  if (error) {
    throw new Error(error.message);
  }

  return candidate;
}