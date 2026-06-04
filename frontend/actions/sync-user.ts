"use server";

import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function syncUser() {
  const user = await currentUser();

  if (!user) return null;

  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", user.id)
    .maybeSingle();

  console.log("SELECT ERROR:", selectError);

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

  console.log("INSERT ERROR:", insertError);

  return data;
}