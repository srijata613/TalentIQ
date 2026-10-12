"use server";

import { API_BASE_URL } from "@/lib/api-config";
import { requireSingleOrganizationContext } from "@/lib/authorization";

type SearchFilters = {
  skills: string[];
  domain: string;
  minExperience: number;
  certification: string;
  minScore: number;
};

type CandidateRecord = {
  id: string;
  full_name: string | null;
  email: string | null;
  parsed_name: string | null;
  parsed_email: string | null;
  parsed_skills: unknown;
  parsed_experience_years: number | string | null;
  parsed_certifications: unknown;
  inferred_skills: unknown;
  created_at: string | null;
};

type JobRecord = {
  id: string;
  title: string | null;
};

type MatchRecord = {
  candidate_id: string;
  job_id: string;
  final_score: number | string | null;
  recommendation: string | null;
};

type SearchRecord = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  ).map((item) => item.trim());
}

function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
}

function scoreAsPercent(value: unknown): number | null {
  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    return null;
  }

  if (typeof value === "string" && !value.trim()) {
    return null;
  }

  const score = Number(value);

  if (!Number.isFinite(score) || score < 0) {
    return null;
  }

  // Saved candidate_matches.final_score values are normally
  // stored between 0 and 1. The search UI uses a 0–100 scale.
  const percentage = score <= 1 ? score * 100 : score;

  return Math.min(100, percentage);
}

async function postBackend(
  path: string,
  payload: unknown,
): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Unable to reach the TalentIQ backend. Check the API URL and server status.",
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
      isRecord(body) &&
      typeof body.detail === "string"
        ? body.detail
        : `Backend request failed with HTTP ${response.status}.`;

    throw new Error(detail);
  }

  return body;
}

function extractSearchResults(value: unknown): SearchRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (isRecord(value) && Array.isArray(value.results)) {
    return value.results.filter(isRecord);
  }

  throw new Error(
    "The backend returned an unexpected candidate-search response.",
  );
}

export async function searchCandidates(
  input: SearchFilters,
): Promise<SearchRecord[]> {
  const skills = stringList(input.skills);
  const domain = normalizeDomain(input.domain ?? "");
  const certification = (input.certification ?? "").trim();
  const minExperience = Number(input.minExperience);
  const minScore = Number(input.minScore);

  if (
    !Number.isFinite(minExperience) ||
    minExperience < 0 ||
    minExperience > 100
  ) {
    throw new Error("Minimum experience must be between 0 and 100 years.");
  }

  if (
    !Number.isFinite(minScore) ||
    minScore < 0 ||
    minScore > 100
  ) {
    throw new Error("Minimum score must be between 0 and 100.");
  }

  // Require a signed-in account that belongs to exactly one
  // organization. Do not accept an organization ID from the browser.
  const context = await requireSingleOrganizationContext();
  const { supabase, organizationId } = context;

  const { data: candidateData, error: candidatesError } =
    await supabase
      .from("candidates")
      .select(
        "id, full_name, email, parsed_name, parsed_email, parsed_skills, parsed_experience_years,parsed_certifications, inferred_skills, created_at"
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

  if (candidatesError) {
    throw new Error(
      "Unable to load candidates from this workspace.",
    );
  }

  const candidates = (candidateData ?? []) as CandidateRecord[];

  if (candidates.length === 0) {
    return [];
  }

  const { data: jobData, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("organization_id", organizationId);

  if (jobsError) {
    throw new Error(
      "Unable to load workspace jobs for match-score lookup.",
    );
  }

  const jobs = (jobData ?? []) as JobRecord[];
  const jobIds = jobs.map((job) => job.id);
  const jobTitles = new Map(
    jobs.map((job) => [job.id, job.title ?? "Untitled job"]),
  );

  const bestMatchByCandidate = new Map<
    string,
    {
      score: number;
      jobId: string;
      recommendation: string | null;
    }
  >();

  if (jobIds.length > 0) {
    const { data: matchData, error: matchesError } =
      await supabase
        .from("candidate_matches")
        .select(
          "candidate_id, job_id, final_score, recommendation",
        )
        .in("job_id", jobIds);

    if (matchesError) {
      throw new Error(
        "Unable to load saved matching results for this workspace.",
      );
    }

    const matches = (matchData ?? []) as MatchRecord[];

    for (const match of matches) {
      const score = scoreAsPercent(match.final_score);

      if (score === null) {
        continue;
      }

      const current = bestMatchByCandidate.get(
        match.candidate_id,
      );

      if (!current || score > current.score) {
        bestMatchByCandidate.set(match.candidate_id, {
          score,
          jobId: match.job_id,
          recommendation: match.recommendation,
        });
      }
    }
  }

  // Domain labels are inferred by the existing backend clustering
  // route. Only send parsed skill fields, not resume text or contact
  // information, for this inference.
  const domainByCandidate = new Map<string, string>();

  if (domain) {
    const clusters = await postBackend(
      "/cluster-candidates",
      {
        candidates: candidates.map((candidate) => ({
          id: candidate.id,
          parsed_skills: stringList(candidate.parsed_skills),
        })),
      },
    );

    if (!isRecord(clusters)) {
      throw new Error(
        "The backend returned an unexpected domain-clustering response.",
      );
    }

    for (const [clusterDomain, groupedCandidates] of Object.entries(
      clusters,
    )) {
      if (!Array.isArray(groupedCandidates)) {
        continue;
      }

      for (const groupedCandidate of groupedCandidates) {
        if (
          isRecord(groupedCandidate) &&
          typeof groupedCandidate.id === "string"
        ) {
          domainByCandidate.set(
            groupedCandidate.id,
            normalizeDomain(clusterDomain),
          );
        }
      }
    }
  }

  const backendCandidates = candidates.map((candidate) => {
    const bestMatch = bestMatchByCandidate.get(candidate.id);
    const inferredSkills = stringList(candidate.inferred_skills);
    const candidateDomain = domainByCandidate.get(candidate.id) ?? null;

    return {
      id: candidate.id,
      name:
        candidate.parsed_name?.trim() ||
        candidate.full_name?.trim() ||
        "Unnamed candidate",
      email: candidate.parsed_email ?? candidate.email,
      parsed_name:
        candidate.parsed_name ?? candidate.full_name,
      parsed_email:
        candidate.parsed_email ?? candidate.email,
      parsed_skills: stringList(candidate.parsed_skills),
      parsed_experience_years: Number(
        candidate.parsed_experience_years ?? 0,
      ),
      experience_years: Number(
        candidate.parsed_experience_years ?? 0,
      ),
      parsed_certifications: stringList(
        candidate.parsed_certifications,
      ),
      certifications: stringList(
        candidate.parsed_certifications,
      ),
      inferred_skills: inferredSkills,
      implicit_skills: [
        ...new Set([
          ...inferredSkills.map((item) => item.toLowerCase()),
          ...(candidateDomain ? [candidateDomain] : []),
        ]),
      ],
      domain: candidateDomain,
      final_score: bestMatch?.score ?? 0,
      best_match_score_pct: bestMatch?.score ?? null,
      best_match_job_title: bestMatch
        ? jobTitles.get(bestMatch.jobId) ?? "Untitled job"
        : null,
      recommendation: bestMatch?.recommendation ?? null,
      score_available: bestMatch !== undefined,
    };
  });

  const response = await postBackend(
    "/search-candidates",
    {
      candidates: backendCandidates,
      skills,
      domain: domain || null,
      min_experience: minExperience,
      certification: certification || null,
      min_score: minScore,
    },
  );

  return extractSearchResults(response);
}