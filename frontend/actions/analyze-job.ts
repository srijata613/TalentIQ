"use server";

import { API_BASE_URL } from "@/lib/api-config";
import {
  assertOrganizationAccess,
  requireAuthenticatedContext,
} from "@/lib/authorization";

export async function analyzeJob(
  jobId: string,
  content: string
) {
  if (!jobId?.trim()) {
    throw new Error("A job ID is required.");
  }

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Job description content is required.");
  }

  // Authorize the requested job before calling the analysis backend.
  const context = await requireAuthenticatedContext();
  const { supabase } = context;

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, organization_id")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError || !job) {
    throw new Error("Job not found or unavailable to this account.");
  }

  assertOrganizationAccess(context, job.organization_id);

  const response = await fetch(`${API_BASE_URL}/jobs/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.status}`);
  }

  const result = await response.json();

  const { error } = await supabase
    .from("job_analysis")
    .upsert(
      {
        job_id: jobId,
        required_skills: result.required_skills ?? [],
        preferred_skills: result.preferred_skills ?? [],
        responsibilities: result.responsibilities ?? [],
        experience_requirements: result.experience
          ? [result.experience]
          : [],
        education_requirements: result.education ?? [],
        certifications: result.certifications ?? [],
        seniority: result.seniority,
        industry: result.industry,
        domain: result.domain,
        technologies: result.technologies ?? [],
        tools: result.tools ?? [],
        soft_skills: result.soft_skills ?? [],
        keywords: result.keywords ?? [],
        must_have: result.must_have ?? [],
        nice_to_have: result.nice_to_have ?? [],
        readability_score: result.readability_score,
        hidden_requirements: result.hidden_requirements ?? [],
        semantic_requirements: result.semantic_requirements ?? [],
        missing_requirements: result.missing_requirements ?? [],
        duplicate_requirements: result.duplicate_requirements ?? [],
        skill_gaps: result.skill_gaps ?? [],
        salary_benchmark: result.salary_benchmark ?? {},
      },
      { onConflict: "job_id" }
    );

  if (error) {
    throw new Error("Analysis completed, but its results could not be saved.");
  }

  return result;
}