"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { analyzeJob } from "@/actions/analyze-job";

export async function importJobUrl(
  title: string,
  url: string
) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    "http://127.0.0.1:8000/jobs/import-url",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        url,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to import URL"
    );
  }

  const result =
    await response.json();

  const content =
    result.content ?? "";

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
        user.id
      )
      .single();

  const { data: job, error } =
    await supabase
      .from("jobs")
      .insert({
        organization_id:
          membership.organization_id,

        title,

        status: "draft",

        current_version: 1,

        content,

        source: "url",
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      error.message
    );
  }

  await supabase
    .from("job_versions")
    .insert({
      job_id: job.id,

      version_number: 1,

      content,
    });

  await analyzeJob(
    job.id,
    content
  );

  return job;
}