"use server";

import { API_BASE_URL } from "@/lib/api-config";
import {
  assertOrganizationAccess,
  requireAuthenticatedContext,
} from "@/lib/authorization";

export async function analyzeCandidate(candidateId: string) {
  if (!candidateId?.trim()) {
    throw new Error("A candidate ID is required.");
  }

  const context = await requireAuthenticatedContext();
  const { supabase } = context;

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .maybeSingle();

  if (candidateError || !candidate) {
    throw new Error("Candidate not found or unavailable to this account.");
  }

  // Verify organization access before accessing the stored resume.
  assertOrganizationAccess(context, candidate.organization_id);

  if (!candidate.resume_storage_path) {
    throw new Error("This candidate does not have a stored resume.");
  }

  const {
    data: signedUrlData,
    error: signedUrlError,
  } = await supabase.storage
    .from("resumes")
    .createSignedUrl(candidate.resume_storage_path, 60);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error("Failed to create a signed URL for the resume.");
  }

  const response = await fetch(`${API_BASE_URL}/parse-resume-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pdf_url: signedUrlData.signedUrl,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Resume analysis failed: ${response.status}`);
  }

  const result: unknown = await response.json();

  if (
    !result ||
    typeof result !== "object" ||
    !("resume_text" in result) ||
    typeof result.resume_text !== "string" ||
    !result.resume_text.trim()
  ) {
    throw new Error(
      "Resume analysis did not return usable resume text."
    );
  }

  const parsed = result as Record<string, unknown>;

  const { error: updateError } = await supabase
    .from("candidates")
    .update({
      parsed_name: parsed.parsed_name ?? null,
      parsed_email: parsed.parsed_email ?? null,
      parsed_phone: parsed.parsed_phone ?? null,
      parsed_linkedin: parsed.parsed_linkedin ?? null,
      parsed_github: parsed.parsed_github ?? null,
      parsed_portfolio: parsed.parsed_portfolio ?? null,

      parsed_skills: parsed.parsed_skills ?? [],
      parsed_degrees: parsed.parsed_degrees ?? [],
      parsed_graduation_years: parsed.parsed_graduation_years ?? [],
      parsed_designations: parsed.parsed_designations ?? [],
      parsed_projects: parsed.parsed_projects ?? [],
      parsed_certifications: parsed.parsed_certifications ?? [],
      parsed_achievements: parsed.parsed_achievements ?? [],
      parsed_summary: parsed.parsed_summary ?? null,
      parsed_experience_years: parsed.parsed_experience_years ?? null,

      parsed_location: parsed.parsed_location ?? null,
      parsed_universities: parsed.parsed_universities ?? [],
      parsed_cgpa: parsed.parsed_cgpa ?? null,
      parsed_companies: parsed.parsed_companies ?? [],
      parsed_leadership_signals:
        parsed.parsed_leadership_signals ?? [],
      parsed_project_technologies:
        parsed.parsed_project_technologies ?? [],
      parsed_project_impacts: parsed.parsed_project_impacts ?? [],
      parsed_publications: parsed.parsed_publications ?? [],
      parsed_open_source: parsed.parsed_open_source ?? [],

      resume_text: parsed.resume_text,
      status: "parsed",
    })
    .eq("id", candidateId);

  if (updateError) {
    throw new Error(
      `Resume was analyzed, but the results could not be saved: ${updateError.message}`
    );
  }

  return parsed;
}