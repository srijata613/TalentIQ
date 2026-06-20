"use server";

import { createSupabaseServerClient }
  from "@/lib/supabase-server";

export async function getJobTemplates() {

  const supabase =
    createSupabaseServerClient();

  const { data, error } =
    await supabase
      .from("job_templates")
      .select("*")
      .order(
        "created_at",
        {
          ascending: true,
        }
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data ?? [];
}