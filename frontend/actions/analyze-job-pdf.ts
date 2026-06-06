"use server";

import { analyzeJob }
  from "@/actions/analyze-job";

import {
  createSupabaseServerClient,
} from "@/lib/supabase-server";

export async function
analyzeJobPdf(
  jobId: string
) {

  const supabase =
    createSupabaseServerClient();

  const { data: job } =
    await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

  if (
    !job?.jd_storage_path
  ) {
    throw new Error(
      "No PDF uploaded"
    );
  }

  const {
    data: signedUrlData,
    error: signedUrlError,
  } =
    await supabase.storage
      .from(
        "job-descriptions"
      )
      .createSignedUrl(
        job.jd_storage_path,
        60
      );

  if (
    signedUrlError ||
    !signedUrlData?.signedUrl
  ) {
    throw new Error(
      "Failed to create signed URL"
    );
  }

  const response =
    await fetch(
      "http://127.0.0.1:8000/jobs/analyze-pdf",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          pdf_url:
            signedUrlData.signedUrl,
        }),
      }
    );

  const result =
    await response.json();

  const extractedContent =
    result.content;

  await supabase
    .from("jobs")
    .update({
      content:
        extractedContent,
    })
    .eq(
      "id",
      jobId
    );

  const {
    data: latestVersion
  } =
    await supabase
      .from("job_versions")
      .select(
        "version_number"
      )
      .eq(
        "job_id",
        jobId
      )
      .order(
        "version_number",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  const nextVersion =
    (
      latestVersion
        ?.version_number ?? 0
    ) + 1;

  await supabase
    .from("job_versions")
    .insert({
      job_id:
        jobId,

      version_number:
        nextVersion,

      content:
        extractedContent,
    });

  await analyzeJob(
    jobId,
    extractedContent
  );

  return true;
}