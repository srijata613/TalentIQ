"use server";

import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function createOrganization(name: string) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUser.id)
    .maybeSingle();

  if (!user) {
    throw new Error("User not found");
  }

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-");

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      slug,
    })
    .select()
    .single();

  if (orgError) {
    throw orgError;
  }

  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({
      user_id: user.id,
      organization_id: organization.id,
      role: "owner",
    });

  if (membershipError) {
    throw membershipError;
  }

  return organization;
}