/**
 * TalentIQ API Client
 * Centralizes all backend HTTP calls.
 * Configure the base URL via NEXT_PUBLIC_API_URL (defaults to http://localhost:8000).
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  embedding_model: string;
  version: string;
}

export interface ParsedResume {
  identity?: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  skills?: string[];
  parsed_skills?: string[];
  inferred_skills?: string[];
  experience_years?: number;
  experience?: {
    designations?: string[];
    companies?: string[];
    total_years?: number;
  };
  education?: {
    degrees?: string[];
    graduation_years?: string[];
    institutions?: string[];
  };
  projects?: string[];
  certifications?: string[];
  achievements?: string[];
  publications?: string[];
  summary?: string;
  behavioral_signals?: Record<string, unknown>;
  adaptability_score?: number;
  growth_score?: number;
  resume_text?: string;
  // pipeline-enriched fields
  candidate_match?: CandidateMatchResult;
  risk_assessment?: RiskAssessment;
  recommendations?: Recommendation[];
  ai_profile?: AiProfile;
}

export interface MatchResult {
  score: number;
  matched: string[];
  missing: string[];
  evidence: string[];
}

export interface MatchMetadata {
  total_evidence: number;
  matched_categories: number;
  weak_categories: number;
  strong_categories: number;
  overall_confidence: number;
}

export interface CandidateMatchResult {
  overall_score: number;
  skill_match: MatchResult;
  experience_match: MatchResult;
  education_match: MatchResult;
  certification_match: MatchResult;
  project_match: MatchResult;
  context_match: MatchResult;
  evidence: string[];
  metadata: MatchMetadata;
}

export interface RiskAssessment {
  risk_score?: number;
  risk_level?: string;
  flags?: string[];
}

export interface Recommendation {
  title?: string;
  description?: string;
  priority?: string;
  [key: string]: unknown;
}

export interface AiProfile {
  headline?: string;
  summary?: string;
  strengths?: string[];
  growth_areas?: string[];
  [key: string]: unknown;
}

// Full pipeline /match response – the returned dict is the enriched candidate dict
export type MatchResponse = ParsedResume;

export interface JobAnalysisResponse {
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  experience: string | null;
  education: string[];
  certifications: string[];
  seniority: string | null;
  industry: string | null;
  domain: string | null;
  tools: string[];
  technologies: string[];
  soft_skills: string[];
  keywords: string[];
  must_have: string[];
  nice_to_have: string[];
  readability_score: number | null;
  hidden_requirements: string[];
  semantic_requirements: string[];
  missing_requirements: string[];
  duplicate_requirements: string[];
  skill_gaps: string[];
  salary_benchmark: Record<string, unknown>;
}

export interface RankResult {
  name?: string;
  overall_score?: number;
  skill_score?: number;
  experience_score?: number;
  education_score?: number;
  [key: string]: unknown;
}

export interface RankResponse {
  latency_seconds: number;
  results: RankResult[];
}

export type BulkMatchResult = ParsedResume;

export interface InterviewPackResponse {
  questions?: string[];
  topics?: string[];
  red_flags?: string[];
  [key: string]: unknown;
}

export interface ShortlistResponse {
  shortlisted?: unknown[];
  rejected?: unknown[];
  [key: string]: unknown;
}

export interface SearchResponse {
  results?: unknown[];
  [key: string]: unknown;
}

// ── API Functions ───────────────────────────────────────────────────────

export const api = {
  health(): Promise<HealthResponse> {
    return request<HealthResponse>("/health");
  },

  parseResume(resume_text: string): Promise<ParsedResume> {
    return request<ParsedResume>("/parse-resume", {
      method: "POST",
      body: JSON.stringify({ resume_text }),
    });
  },

  parseResumeUrl(pdf_url: string): Promise<ParsedResume> {
    return request<ParsedResume>("/parse-resume-url", {
      method: "POST",
      body: JSON.stringify({ pdf_url }),
    });
  },

  analyzeJob(content: string): Promise<JobAnalysisResponse> {
    return request<JobAnalysisResponse>("/jobs/analyze", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  importJobUrl(url: string): Promise<{ content?: string; error?: string }> {
    return request("/jobs/import-url", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  },

  match(job_text: string, resume_text: string): Promise<MatchResponse> {
    return request<MatchResponse>("/match", {
      method: "POST",
      body: JSON.stringify({ job_text, resume_text }),
    });
  },

  matchBulk(job_text: string, resumes: string[]): Promise<BulkMatchResult[]> {
    return request<BulkMatchResult[]>("/match-bulk", {
      method: "POST",
      body: JSON.stringify({ job_text, resumes }),
    });
  },

  rank(job_description: string, resumes: string[]): Promise<RankResponse> {
    return request<RankResponse>("/rank", {
      method: "POST",
      body: JSON.stringify({ job_description, resumes }),
    });
  },

  interviewPack(candidate: object): Promise<InterviewPackResponse> {
    return request<InterviewPackResponse>("/interview-pack", {
      method: "POST",
      body: JSON.stringify({ candidate }),
    });
  },

  shortlist(candidates: unknown[]): Promise<ShortlistResponse> {
    return request<ShortlistResponse>("/shortlist", {
      method: "POST",
      body: JSON.stringify({ candidates }),
    });
  },

  searchCandidates(params: {
    candidates: unknown[];
    skills?: string[];
    domain?: string | null;
    min_experience?: number;
    certification?: string | null;
    fit_type?: string | null;
    min_score?: number;
  }): Promise<SearchResponse> {
    return request<SearchResponse>("/search-candidates", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },
};

export default api;
