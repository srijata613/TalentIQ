"use server";

import { API_BASE_URL } from "@/lib/api-config";
import {
  assertOrganizationAccess,
  requireAuthenticatedContext,
} from "@/lib/authorization";

export type InterviewPack = {
  focus_areas: string[];
  technical_questions: string[];
  behavioral_questions: string[];
  risk_validation_questions: string[];
  interview_recommendation: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      ).map((item) => item.trim())
    : [];
}

function finiteNumber(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") {
    return 0;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function asScoreFraction(value: unknown): number {
  const score = finiteNumber(value);
  return Math.max(0, Math.min(1, score > 1 ? score / 100 : score));
}

function asScorePercent(value: unknown): number {
  const score = finiteNumber(value);
  return Math.max(0, Math.min(100, score <= 1 ? score * 100 : score));
}

async function postInterviewPack(payload: Record<string, unknown>) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/interview-pack`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate: payload }),
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Unable to reach the interview service. Check the backend status.",
    );
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const detail =
      isRecord(body) && typeof body.detail === "string"
        ? body.detail
        : `Interview generation failed with HTTP ${response.status}.`;

    throw new Error(detail);
  }

  if (!isRecord(body)) {
    throw new Error("The interview service returned an unexpected response.");
  }

  return body;
}

export async function generateInterviewPack(
  jobId: string,
  candidateId: string,
): Promise<InterviewPack> {
  if (!jobId?.trim() || !candidateId?.trim()) {
    throw new Error("A job and candidate must be selected.");
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

  assertOrganizationAccess(context, job.organization_id);

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id")
    .eq("id", candidateId)
    .eq("organization_id", job.organization_id)
    .maybeSingle();

  if (candidateError || !candidate) {
    throw new Error("Candidate not found or unavailable to this account.");
  }

  const { data: match, error: matchError } = await supabase
    .from("candidate_matches")
    .select(
        "candidate_id, job_id, final_score, matched_skills, missing_skills, leadership_fit, behavioral_signals, risk_assessment, risk_score",
    )
    .eq("job_id", jobId)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (matchError || !match) {
    throw new Error(
      "No saved match exists for this candidate and job. Run matching first.",
    );
  }

  const behavioralSignals = isRecord(match.behavioral_signals)
    ? match.behavioral_signals
    : {};

  const riskAssessment = isRecord(match.risk_assessment)
    ? match.risk_assessment
    : {};

  // The interview engine expects final_score in 0–1 and leadership_fit
  // in 0–100. Convert only for the request; preserve saved values.
  const payload = {
    matched_skills: stringList(match.matched_skills),
    missing_skills: stringList(match.missing_skills),
    final_score: asScoreFraction(match.final_score),
    leadership_fit: asScorePercent(match.leadership_fit),
    behavioral_signals: behavioralSignals,
    risk_assessment: riskAssessment,
    risk_score: finiteNumber(match.risk_score),
  };

  const response = await postInterviewPack(payload);

  return {
    focus_areas: stringList(response.focus_areas),
    technical_questions: stringList(response.technical_questions),
    behavioral_questions: stringList(response.behavioral_questions),
    risk_validation_questions: stringList(
      response.risk_validation_questions,
    ),
    interview_recommendation:
      typeof response.interview_recommendation === "string"
        ? response.interview_recommendation
        : "Interview recommendation unavailable",
  };
}