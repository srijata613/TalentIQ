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

  if (!response.ok) {
  throw new Error(
    `Resume analysis failed: ${response.status}`
  );
}

  const result =
    await response.json();

  await supabase
  .from("candidates")
  .update({
    parsed_name:
      result.identity?.name,

    parsed_email:
      result.identity?.email,

    parsed_phone:
      result.identity?.phone,

    parsed_linkedin:
      result.identity?.linkedin,

    parsed_github:
      result.identity?.github,

    parsed_portfolio:
      result.identity?.portfolio,

    parsed_skills:
      result.skills ?? [],

    parsed_degrees:
      result.education?.degrees ?? [],

    parsed_graduation_years:
      result.education?.graduation_years ?? [],

    parsed_designations:
      result.experience?.designations ?? [],

    parsed_projects:
      result.projects ?? [],

    parsed_certifications:
      result.certifications ?? [],

    parsed_achievements:
      result.achievements ?? [],

    parsed_summary:
      result.summary,

    parsed_experience_years:
      result.experience_years,

    resume_text:
      result.resume_text,

    status:
      "parsed",
  })
  .eq(
    "id",
    candidateId
  );

  return result;
}