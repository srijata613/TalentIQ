"use server";

import { API_BASE_URL } from "@/lib/api-config";
import { analyzeJob } from "@/actions/analyze-job";
import {
  assertOrganizationAccess,
  requireAuthenticatedContext,
} from "@/lib/authorization";

export async function analyzeJobPdf(jobId: string) {
  if (!jobId?.trim()) {
    throw new Error("A job ID is required.");
  }

  const context = await requireAuthenticatedContext();
  const { supabase } = context;

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, organization_id, jd_storage_path")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError || !job) {
    throw new Error("Job not found or unavailable to this account.");
  }

  assertOrganizationAccess(context, job.organization_id);

  if (!job.jd_storage_path) {
    throw new Error("No PDF uploaded for this job.");
  }

  const { data: signedUrlData, error: signedUrlError } =
    await supabase.storage
      .from("job-descriptions")
      .createSignedUrl(job.jd_storage_path, 60);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error("Failed to create a signed URL for the job PDF.");
  }

  const response = await fetch(`${API_BASE_URL}/jobs/analyze-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pdf_url: signedUrlData.signedUrl }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PDF analysis failed: HTTP ${response.status}.`);
  }

  const result: unknown = await response.json();

  if (
    !result ||
    typeof result !== "object" ||
    !("content" in result) ||
    typeof result.content !== "string" ||
    !result.content.trim()
  ) {
    throw new Error("PDF analysis did not return usable job description text.");
  }

  const extractedContent = result.content;

  const { error: updateError } = await supabase
    .from("jobs")
    .update({ content: extractedContent })
    .eq("id", jobId);

  if (updateError) {
    throw new Error("PDF was analyzed, but the job description could not be saved.");
  }

  const { data: latestVersion, error: versionReadError } = await supabase
    .from("job_versions")
    .select("version_number")
    .eq("job_id", jobId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (versionReadError) {
    throw new Error("Job description was saved, but its version could not be read.");
  }

  const nextVersion = (latestVersion?.version_number ?? 0) + 1;

  const { error: versionInsertError } = await supabase
    .from("job_versions")
    .insert({
      job_id: jobId,
      version_number: nextVersion,
      content: extractedContent,
    });

  if (versionInsertError) {
    throw new Error("Job description was saved, but its new version could not be recorded.");
  }

  await analyzeJob(jobId, extractedContent);

  return true;
}
