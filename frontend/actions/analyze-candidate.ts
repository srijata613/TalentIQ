"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function analyzeCandidate(
  candidateId: string
) {
  const supabase = createSupabaseServerClient();

  const { data: candidate, error } =
    await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single();

  if (error || !candidate) {
    throw new Error("Candidate not found");
  }

  const {
    data: signedUrlData,
    error: signedUrlError,
  } = await supabase.storage
    .from("resumes")
    .createSignedUrl(
      candidate.resume_storage_path,
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

  const response = await fetch(
    "http://127.0.0.1:8000/parse-resume-url",
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

  await supabase
    .from("candidates")
    .update({
      parsed_name: result.name,
      parsed_email: result.email,
      parsed_phone: result.phone,
      parsed_skills: result.skills,
      resume_text: result.resume_text,
      status: "parsed",
    })
    .eq("id", candidateId);

  return result;
}