import { getJob } from "@/actions/get-job";
import { getJobMatches } from "@/actions/get-job-matches";
import CandidateComparisonWorkspace from "@/components/candidate-comparison-workspace";
import ScoreRing from "@/components/score-ring";
import ScoreBar from "@/components/score-bar";
import ShortlistReviewWorkspace from "@/components/shortlist-review-workspace";
import RunMatchingButton from "@/components/run-matching-button";
import { loadShortlistDecisions } from "@/actions/shortlist-decisions";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Matches | TalentIQ",
};

type MatchRecord = Record<string, unknown>;

export default async function JobMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ job }, matches, initialDecisions] = await Promise.all([
    getJob(id),
    getJobMatches(id),
    loadShortlistDecisions(id),
  ]);

  const strongMatches = matches.filter((match: MatchRecord) => {
    const recommendation = String(
      match.recommendation ?? "",
    )
      .trim()
      .toLowerCase();

    return (
      recommendation.includes("strong") ||
      recommendation === "hire"
    );
  }).length;

  const averageScore = matches.length
    ? Math.round(
        matches.reduce(
          (total: number, match: MatchRecord) =>
            total + toPercent(match.final_score),
          0,
        ) / matches.length,
      )
    : 0;

  /*
   * Adapt saved match records to the comparison component's
   * presentation model. This does not call the backend or write data.
   */
  const comparisonCandidates = matches.map(
    (match: MatchRecord, index: number) => {
      const candidate = asRecord(match.candidates);

      const candidateId =
        typeof candidate.id === "string"
          ? candidate.id
          : typeof match.candidate_id === "string"
            ? match.candidate_id
            : null;

      const candidateName =
        typeof candidate.parsed_name === "string" &&
        candidate.parsed_name.trim()
          ? candidate.parsed_name
          : `Candidate ${index + 1}`;

      const candidateEmail =
        typeof candidate.parsed_email === "string"
          ? candidate.parsed_email
          : undefined;

      return {
        id:
          candidateId ??
          `saved-match-${String(match.id ?? index)}`,
        name: candidateName,
        email: candidateEmail,

        score: toOptionalPercent(match.final_score),
        skillScore: toOptionalPercent(match.skill_score),
        experienceScore: toOptionalPercent(
          match.experience_score,
        ),
        educationScore: toOptionalPercent(
          match.education_score,
        ),
        certificationScore: toOptionalPercent(
          match.certification_score,
        ),
        domainScore: toOptionalPercent(match.domain_score),

        recommendation:
          typeof match.recommendation === "string"
            ? match.recommendation
            : undefined,

        matchedSkills: toStringList(match.matched_skills),
        missingSkills: toStringList(match.missing_skills),
        strengths: toStringList(match.strengths),
        weaknesses: toStringList(match.weaknesses),

        profileHref: candidateId
          ? `/candidates/${candidateId}`
          : undefined,
      };
    },
  );

  if (!job) {
    return (
      <div className="workspace-page">
        <Link href="/jobs" className="back-link">
          ← Back to Jobs
        </Link>

        <section className="workspace-empty glass">
          <div className="workspace-empty-icon">⌕</div>
          <h2>Job not found</h2>
          <p>
            Return to the jobs workspace and choose a saved role.
          </p>
          <Link href="/jobs" className="btn btn-primary">
            View jobs
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <div className="workspace-breadcrumbs">
        <Link href="/jobs">Jobs</Link>
        <span>/</span>
        <Link href={`/jobs/${id}`}>
          {job.title || "Job"}
        </Link>
        <span>/</span>
        <span>Candidate matches</span>
      </div>

      <header className="workspace-hero matches-hero">
        <div className="workspace-hero-copy">
          <div className="workspace-eyebrow">
            <span className="workspace-eyebrow-dot" />
            MATCH INTELLIGENCE
          </div>

          <h1 className="page-title">Candidate matches</h1>

          <p className="page-subtitle">
            Review how each parsed candidate aligns with{" "}
            <strong>{job.title || "this role"}</strong>, then open a
            profile to inspect the details.
          </p>

          <div className="workspace-meta-row">
            <span className="badge badge-brand">
              Job-specific ranking
            </span>

            <span className="workspace-meta">
              {matches.length} saved match
              {matches.length === 1 ? "" : "es"}
            </span>
          </div>
        </div>

        <div className="workspace-hero-actions">
          <Link
            href={`/jobs/${id}`}
            className="btn btn-secondary"
          >
            Back to job
          </Link>

          <RunMatchingButton jobId={id} />
        </div>
      </header>

      <div className="workspace-stat-grid workspace-stat-grid-3">
        <div className="glass workspace-stat-card">
          <div className="workspace-stat-top">
            <span>Evaluated candidates</span>
            <span className="workspace-stat-icon">◎</span>
          </div>
          <strong>{matches.length}</strong>
          <small>Saved results for this job</small>
        </div>

        <div className="glass workspace-stat-card">
          <div className="workspace-stat-top">
            <span>Strong matches</span>
            <span className="workspace-stat-icon">✦</span>
          </div>
          <strong>{strongMatches}</strong>
          <small>Based on the engine recommendation</small>
        </div>

        <div className="glass workspace-stat-card">
          <div className="workspace-stat-top">
            <span>Average fit score</span>
            <span className="workspace-stat-icon">◉</span>
          </div>
          <strong>
            {matches.length ? `${averageScore}%` : "—"}
          </strong>
          <small>
            {matches.length
              ? "Across saved results"
              : "Run matching to calculate"}
          </small>
        </div>
      </div>

      {/* Phase 3A: interactive candidate comparison */}
      <CandidateComparisonWorkspace
        jobTitle={String(job.title || "Selected role")}
        candidates={comparisonCandidates}
      />
      <ShortlistReviewWorkspace
        jobId={id}
        candidates={comparisonCandidates}
        initialDecisions={initialDecisions}
      />
      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span className="workspace-kicker">LEADERBOARD</span>
            <h2>Ranked candidates</h2>
          </div>

          {matches.length > 0 && (
            <span className="workspace-section-caption">
              Sorted by saved final score
            </span>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="glass workspace-empty matches-empty">
            <div className="workspace-empty-icon">◎</div>

            <h2>Find the best-aligned candidates</h2>

            <p>
              Run matching to evaluate parsed candidate resumes
              against this job description. Results are saved to the
              job’s leaderboard.
            </p>

            <RunMatchingButton jobId={id} />

            <span className="workspace-empty-footnote">
              Only candidates with parsed resume text can be evaluated.
            </span>
          </div>
        ) : (
          <div className="matches-results-list">
            {matches.map(
              (match: MatchRecord, index: number) => {
                const candidate = asRecord(match.candidates);

                const candidateId =
                  typeof candidate.id === "string"
                    ? candidate.id
                    : null;

                const candidateName =
                  typeof candidate.parsed_name === "string" &&
                  candidate.parsed_name.trim()
                    ? candidate.parsed_name
                    : `Candidate ${index + 1}`;

                const candidateEmail =
                  typeof candidate.parsed_email === "string"
                    ? candidate.parsed_email
                    : "";

                const score = toPercent(match.final_score);

                const recommendation =
                  typeof match.recommendation === "string"
                    ? match.recommendation
                    : "Recommendation unavailable";

                const grade =
                  typeof match.grade === "string"
                    ? match.grade
                    : undefined;

                const matchedSkills = toStringList(
                  match.matched_skills,
                );

                const missingSkills = toStringList(
                  match.missing_skills,
                );

                const strengths = toStringList(match.strengths);
                const weaknesses = toStringList(match.weaknesses);

                const subScores = [
                  ["Skills alignment", match.skill_score],
                  ["Experience", match.experience_score],
                  ["Domain fit", match.domain_score],
                  ["Leadership", match.leadership_score],
                ] as const;

                return (
                  <article
                    className="glass match-result-card"
                    key={String(
                      match.id ??
                        `${candidateId ?? "candidate"}-${index}`,
                    )}
                  >
                    <div className="match-result-topline">
                      <div className="match-rank">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="match-candidate-summary">
                        <div className="match-candidate-heading">
                          <div className="candidate-avatar candidate-avatar-small">
                            {initials(candidateName)}
                          </div>

                          <div className="match-candidate-copy">
                            {candidateId ? (
                              <Link
                                href={`/candidates/${candidateId}`}
                                className="match-candidate-name"
                              >
                                {candidateName}
                              </Link>
                            ) : (
                              <h3 className="match-candidate-name">
                                {candidateName}
                              </h3>
                            )}

                            {candidateEmail && (
                              <p>{candidateEmail}</p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`badge ${
                            recommendation
                              .toLowerCase()
                              .includes("strong")
                              ? "badge-brand"
                              : recommendation
                                    .toLowerCase()
                                    .includes("moderate")
                                ? "badge-yellow"
                                : "badge-gray"
                          }`}
                        >
                          {recommendation}
                        </span>
                      </div>

                      <div className="match-score-summary">
                        <ScoreRing
                          score={score}
                          size={82}
                          strokeWidth={6}
                          label={grade}
                          sublabel="FIT SCORE"
                        />
                      </div>
                    </div>

                    <div className="match-result-scores">
                      {subScores.map(([label, value]) =>
                        value != null ? (
                          <ScoreBar
                            key={label}
                            label={label}
                            score={toPercent(value)}
                          />
                        ) : null,
                      )}
                    </div>

                    {(matchedSkills.length > 0 ||
                      missingSkills.length > 0) && (
                      <div className="match-skills-grid">
                        {matchedSkills.length > 0 && (
                          <div>
                            <h4>
                              <span className="match-positive-mark">
                                ✓
                              </span>{" "}
                              Matched skills
                            </h4>

                            <div className="workspace-chip-list">
                              {matchedSkills
                                .slice(0, 10)
                                .map((skill) => (
                                  <span
                                    className="workspace-chip workspace-chip-brand"
                                    key={skill}
                                  >
                                    {skill}
                                  </span>
                                ))}

                              {matchedSkills.length > 10 && (
                                <span className="workspace-chip">
                                  +{matchedSkills.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {missingSkills.length > 0 && (
                          <div>
                            <h4>
                              <span className="match-gap-mark">
                                −
                              </span>{" "}
                              Skills to review
                            </h4>

                            <div className="workspace-chip-list">
                              {missingSkills
                                .slice(0, 10)
                                .map((skill) => (
                                  <span
                                    className="workspace-chip workspace-chip-muted"
                                    key={skill}
                                  >
                                    {skill}
                                  </span>
                                ))}

                              {missingSkills.length > 10 && (
                                <span className="workspace-chip">
                                  +{missingSkills.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(strengths.length > 0 ||
                      weaknesses.length > 0) && (
                      <div className="match-insights-grid">
                        {strengths.length > 0 && (
                          <div>
                            <h4>Strengths</h4>
                            <ul>
                              {strengths.slice(0, 3).map(
                                (item, index) => (
                                  <li key={`${item}-${index}`}>
                                    {item}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                        {weaknesses.length > 0 && (
                          <div>
                            <h4>Considerations</h4>
                            <ul>
                              {weaknesses.slice(0, 3).map(
                                (item, index) => (
                                  <li key={`${item}-${index}`}>
                                    {item}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="match-result-footer">
                      <span className="workspace-meta">
                        Score is specific to this job
                      </span>

                      {candidateId && (
                        <Link
                          href={`/candidates/${candidateId}`}
                          className="btn btn-secondary btn-sm"
                        >
                          View candidate{" "}
                          <span aria-hidden="true">↗</span>
                        </Link>
                      )}
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" &&
          item.trim().length > 0,
      )
    : [];
}

function toPercent(value: unknown): number {
  const number =
    typeof value === "number"
      ? value
      : Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(
    Math.max(
      0,
      Math.min(100, number <= 1 ? number * 100 : number),
    ),
  );
}

function toOptionalPercent(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.round(
    Math.max(
      0,
      Math.min(100, number <= 1 ? number * 100 : number),
    ),
  );
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "C"
  );
}