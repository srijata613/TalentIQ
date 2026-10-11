"use server";

import { requireAuthenticatedContext } from "@/lib/authorization";

export async function getJobTemplates() {
  const { supabase } = await requireAuthenticatedContext();

  const { data, error } = await supabase
    .from("job_templates")
    .select("*")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error("Unable to retrieve job templates.");
  }

  return data ?? [];
}