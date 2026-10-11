"use server";

import { API_BASE_URL } from "@/lib/api-config";
import { analyzeJob } from "@/actions/analyze-job";
import { requireSingleOrganizationContext } from "@/lib/authorization";

export async function importJobUrl(
  title: string,
  url: string
) {
  if (!title?.trim()) {
    throw new Error("A job title is required.");
  }

  if (!url?.trim()) {
    throw new Error("A job URL is required.");
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url.trim());
  } catch {
    throw new Error("Enter a valid job URL.");
  }

  if (
    !["http:", "https:"].includes(parsedUrl.protocol) ||
    parsedUrl.username ||
    parsedUrl.password
  ) {
    throw new Error("Enter a valid HTTP or HTTPS URL without embedded credentials.");
  }

  // Verify authentication and organization membership before the external request.
  const { supabase, organizationId } =
    await requireSingleOrganizationContext();

  const response = await fetch(`${API_BASE_URL}/jobs/import-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: parsedUrl.toString(),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to import the job URL: HTTP ${response.status}.`);
  }

  let result: { content?: unknown };

  try {
    result = await response.json();
  } catch {
    throw new Error("The job-import backend returned an invalid response.");
  }

  const content = result.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("No job description could be extracted from the URL.");
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      organization_id: organizationId,
      title: title.trim(),
      status: "draft",
      current_version: 1,
      content,
      source: "url",
    })
    .select()
    .single();

  if (jobError || !job) {
    throw new Error("Unable to create the imported job.");
  }

  const { error: versionError } = await supabase
    .from("job_versions")
    .insert({
      job_id: job.id,
      version_number: 1,
      content,
    });

  if (versionError) {
    throw new Error(
      "The job was created, but its initial version could not be saved."
    );
  }

  // This action performs its own authentication and organization-access checks.
  await analyzeJob(job.id, content);

  return job;
}