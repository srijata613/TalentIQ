"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function syncUser() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const supabase = createSupabaseServerClient();

  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", user.id)
    .maybeSingle();

  if (selectError) {
    throw new Error("Unable to check the existing database user.");
  }

  if (existingUser) {
    return existingUser;
  }

  const { data, error: insertError } = await supabase
    .from("users")
    .insert({
      clerk_user_id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      full_name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      avatar_url: user.imageUrl,
    })
    .select()
    .maybeSingle();

  if (insertError || !data) {
    throw new Error("Unable to synchronize your account with the database.");
  }

  return data;
}