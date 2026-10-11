"use server";

import { API_BASE_URL } from "@/lib/api-config";
import {
  assertOrganizationAccess,
  requireAuthenticatedContext,
} from "@/lib/authorization";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/**
 * The current /match response uses a 0-100 scale inside
 * candidate_match. Older flattened responses may use 0-1.
 * Store final_score in the 0-1 range expected by shortlisting.
 */
function normalizeScore(value: unknown): number {
  const number = finiteNumber(value);

  if (number === null) {
    return 0;
  }

  const normalized = number > 1 ? number / 100 : number;

  return Math.max(0, Math.min(1, normalized));
}

function scoreGrade(score: number): string {
  const percent = score * 100;

  if (percent >= 90) return "A+";
  if (percent >= 80) return "A";
  if (percent >= 70) return "B+";
  if (percent >= 60) return "B";
  if (percent >= 50) return "C";

  return "D";
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

async function responseError(response: Response): Promise<string> {
  try {
    const body = asRecord(await response.json());
    const detail = body.detail ?? body.message;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  } catch {
    // The response may not contain JSON.
  }

  return `Backend returned HTTP ${response.status}.`;
}

export async function runJobMatching(jobId: string) {
  if (!jobId?.trim()) {
    throw new Error("A job must be selected before matching.");
  }

  // Preserve the request's authenticated session for the final writes.
  const { sessionId } = await auth();

  if (!sessionId) {
    throw new Error("Unauthorized");
  }

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

  // Verify workspace access before reading versions or candidates.
  assertOrganizationAccess(context, job.organization_id);

  const { data: version, error: versionError } = await supabase
    .from("job_versions")
    .select("content, version_number")
    .eq("job_id", jobId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (versionError || !version?.content?.trim()) {
    throw new Error("The job needs a saved description before matching.");
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("*")
    .eq("organization_id", job.organization_id)
    .not("resume_text", "is", null);

  if (candidatesError) {
    throw new Error(`Could not load candidates: ${candidatesError.message}`);
  }

  const eligibleCandidates = (candidates ?? []).filter(
    (candidate) =>
      typeof candidate.resume_text === "string" &&
      candidate.resume_text.trim().length > 0,
  );

  if (eligibleCandidates.length === 0) {
    throw new Error(
      "No candidates with usable parsed resume text were found in this workspace.",
    );
  }

  const rowsToInsert: JsonRecord[] = [];
  const leaderboard: {
    candidate_id: string;
    candidate_name: string;
    score: number;
    grade: string;
    recommendation: string;
  }[] = [];
  const failures: string[] = [];

  // Generate results first. Do not delete existing results while processing.
  for (const candidate of eligibleCandidates) {
    const candidateName =
      nonEmptyString(candidate.parsed_name) ?? "Unnamed candidate";

    try {
      const response = await fetch(`${API_BASE_URL}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_text: version.content,
          resume_text: candidate.resume_text,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await responseError(response));
      }

      const result = asRecord(await response.json());
      const candidateMatch = asRecord(result.candidate_match);

      const rawOverallScore =
        candidateMatch.overall_score ?? result.final_score;

      if (finiteNumber(rawOverallScore) === null) {
        throw new Error(
          "The matching response did not contain a readable overall score.",
        );
      }

      const finalScore = normalizeScore(rawOverallScore);
      const grade =
        nonEmptyString(result.grade) ?? scoreGrade(finalScore);

      const aiProfile = asRecord(result.ai_profile);
      const riskAssessment = asRecord(result.risk_assessment);

      const skillMatch = asRecord(candidateMatch.skill_match);
      const experienceMatch = asRecord(candidateMatch.experience_match);
      const educationMatch = asRecord(candidateMatch.education_match);
      const certificationMatch = asRecord(
        candidateMatch.certification_match,
      );

      const recommendation =
        nonEmptyString(result.recommendation) ??
        nonEmptyString(aiProfile.recommendation) ??
        "Needs review";

      const matchedSkills = asStringList(
        result.matched_skills ?? skillMatch.matched,
      );
      const missingSkills = asStringList(
        result.missing_skills ?? skillMatch.missing,
      );
      const strengths = asStringList(
        result.strengths ?? aiProfile.strengths,
      );
      const weaknesses = asStringList(
        result.weaknesses ?? aiProfile.concerns,
      );

      const riskScore =
        finiteNumber(result.risk_score) ??
        finiteNumber(riskAssessment.risk_score) ??
        0;

      /*
       * Preserve the existing database shape while retaining the full
       * backend breakdown for the detailed matching experience.
       */
      const explanation =
        result.explanation ??
        {
          candidate_match: candidateMatch,
          evidence: asStringList(candidateMatch.evidence),
          metadata: asRecord(candidateMatch.metadata),
        };

      const row: JsonRecord = {
        job_id: jobId,
        candidate_id: candidate.id,

        final_score: finalScore,
        grade,
        recommendation,

        skill_score: normalizeScore(
          skillMatch.score ?? result.skill_score,
        ),
        experience_score: normalizeScore(
          experienceMatch.score ?? result.experience_score,
        ),
        education_score: normalizeScore(
          educationMatch.score ?? result.education_score,
        ),
        certification_score: normalizeScore(
          certificationMatch.score ?? result.certification_score,
        ),

        bonus_score: normalizeScore(result.bonus_score),
        leadership_score: normalizeScore(result.leadership_score),
        communication_score: normalizeScore(result.communication_score),
        domain_score: normalizeScore(result.domain_score),
        industry_score: normalizeScore(result.industry_score),

        growth_score: normalizeScore(result.growth_score),
        adaptability_score: normalizeScore(result.adaptability_score),

        behavioral_signals: asRecord(result.behavioral_signals),
        implicit_skills: asStringList(
          result.inferred_skills ?? result.implicit_skills,
        ),
        matched_skills: matchedSkills,
        missing_skills: missingSkills,
        strengths,
        weaknesses,
        explanation,
        risk_score: riskScore,

        startup_fit: finiteNumber(result.startup_fit) ?? 0,
        enterprise_fit: finiteNumber(result.enterprise_fit) ?? 0,
        remote_fit: finiteNumber(result.remote_fit) ?? 0,
        leadership_fit: finiteNumber(result.leadership_fit) ?? 0,

        recommendations: result.recommendations ?? {},
        risk_assessment: riskAssessment,
      };

      rowsToInsert.push(row);

      leaderboard.push({
        candidate_id: String(candidate.id),
        candidate_name: candidateName,
        score: finalScore,
        grade,
        recommendation,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown matching error";

      failures.push(`${candidateName}: ${message}`);
    }
  }

  /*
   * Do not replace existing saved results with a partial leaderboard.
   * The recruiter can review the error and retry the run.
   */
  if (failures.length > 0) {
    const firstFailure = failures[0];

    throw new Error(
      `Matching could not be completed for ${failures.length} of ` +
        `${eligibleCandidates.length} candidates. Existing results were kept. ` +
        `First failure: ${firstFailure}`,
    );
  }

  if (rowsToInsert.length === 0) {
    throw new Error("No matching results were generated.");
  }

  /*
   * Matching may take longer than a Clerk session JWT's short lifetime.
   * Create a persistence client only after matching is complete and ask
   * Clerk for a fresh JWT for each database request.
   *
   * This still uses the public Supabase key and normal RLS policies.
   * It does not use or expose a service-role key.
   */
  const clerk = await clerkClient();

  const persistenceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => {
        const tokenResult = await clerk.sessions.getToken(sessionId);
        return tokenResult.jwt;
      },
    },
  );

  // Clear prior results only after every candidate has matched successfully.
  const { error: deleteError } = await persistenceSupabase
    .from("candidate_matches")
    .delete()
    .eq("job_id", jobId);

  if (deleteError) {
    throw new Error(
      `New results were generated, but old matches could not be cleared: ${deleteError.message}`,
    );
  }

  const { error: insertError } = await persistenceSupabase
    .from("candidate_matches")
    .insert(rowsToInsert);

  if (insertError) {
    throw new Error(
      `Could not save the new leaderboard: ${insertError.message}`,
    );
  }

  leaderboard.sort((a, b) => b.score - a.score);

  return {
    job_id: jobId,
    matched_count: leaderboard.length,
    results: leaderboard,
  };
}