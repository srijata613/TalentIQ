import { getJob } from "@/actions/get-job";
import { getJobMatches } from "@/actions/get-job-matches";
import InterviewPackWorkspace from "@/components/interview-pack-workspace";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Preparation | TalentIQ",
};

type DataRecord = Record<string, unknown>;

function isRecord(value: unknown): value is DataRecord {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      ).map((item) => item.trim())
    : [];
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

export default async function InterviewPreparationPage({
  params,
}: {
  params: Promise<{ id: string; candidateId: string }>;
}) {
  const { id: jobId, candidateId } = await params;

  const [{ job }, matches] = await Promise.all([
    getJob(jobId),
    getJobMatches(jobId),
  ]);

  const selectedMatch = matches.find((item) => {
    const candidate = isRecord(item.candidates)
      ? item.candidates
      : {};

    const matchedCandidateId =
      readString(item.candidate_id) ??
      readString(candidate.id);

    return matchedCandidateId === candidateId;
  });

  if (!selectedMatch) {
    notFound();
  }

  const candidate = isRecord(selectedMatch.candidates)
    ? selectedMatch.candidates
    : {};

  const candidateName =
    readString(candidate.parsed_name) ?? "Candidate profile";

  const candidateEmail = readString(candidate.parsed_email);
  const matchedSkills = toStringList(selectedMatch.matched_skills);

  return (
    <div className="workspace-page">
      <div className="workspace-breadcrumbs">
        <Link href="/jobs">Jobs</Link>
        <span>/</span>
        <Link href={`/jobs/${jobId}`}>
          {job.title || "Job"}
        </Link>
        <span>/</span>
        <Link href={`/jobs/${jobId}/matches`}>
          Candidate matches
        </Link>
        <span>/</span>
        <span>Interview preparation</span>
      </div>

      <header className="workspace-hero">
        <div className="workspace-hero-copy">
          <div className="workspace-eyebrow">
            <span className="workspace-eyebrow-dot" />
            INTERVIEW PREPARATION
          </div>

          <h1 className="page-title">Interview workspace</h1>

          <p className="page-subtitle">
            Prepare a job-specific interview guide for{" "}
            <strong>{candidateName}</strong> and{" "}
            <strong>{job.title || "this role"}</strong>, using saved
            matching evidence as context.
          </p>

          <div className="workspace-meta-row">
            <span className="badge badge-brand">
              Job-specific guide
            </span>

            <span className="workspace-meta">
              {matchedSkills.length} matched skill
              {matchedSkills.length === 1 ? "" : "s"}
            </span>
          </div>

          {candidateEmail && (
            <p className="workspace-meta" style={{ marginTop: 12 }}>
              {candidateEmail}
            </p>
          )}
        </div>

        <div
          className="workspace-hero-actions"
          style={{ flexWrap: "wrap" }}
        >
          <Link
            href={`/jobs/${jobId}/matches`}
            className="btn btn-secondary"
          >
            ← Back to matches
          </Link>

          <Link
            href={`/candidates/${encodeURIComponent(candidateId)}`}
            className="btn btn-primary"
          >
            View candidate <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      {matchedSkills.length > 0 && (
        <section className="glass workspace-panel">
          <div className="workspace-section-heading">
            <div>
              <span className="workspace-kicker">SAVED MATCH EVIDENCE</span>
              <h2>Areas already matched</h2>
            </div>
          </div>

          <div className="workspace-chip-list">
            {matchedSkills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="workspace-chip workspace-chip-brand"
              >
                {skill}
              </span>
            ))}
          </div>

          <p
            className="workspace-muted"
            style={{ marginTop: 14, fontSize: "0.8125rem" }}
          >
            These skills come from the saved match for this job. Use the
            questions to validate practical knowledge and real experience,
            rather than relying on the match score alone.
          </p>
        </section>
      )}

      <InterviewPackWorkspace
        jobId={jobId}
        candidateId={candidateId}
        candidateName={candidateName}
        jobTitle={job.title || "Selected role"}
      />
    </div>
  );
}