"use client";

import Link from "next/link";
import { useState } from "react";
import {
  clearShortlistDecisions,
  saveShortlistDecision,
  type ReviewDecision,
} from "@/actions/shortlist-decisions";
import type { ComparisonCandidate } from "@/components/candidate-comparison-workspace";

type ReviewFilter = "all" | ReviewDecision | "pending";

interface Props {
  jobId: string;
  candidates: ComparisonCandidate[];
  initialDecisions: Record<string, ReviewDecision>;
}

const DECISION_LABELS: Record<ReviewDecision, string> = {
  shortlist: "Shortlisted",
  review: "Keep in review",
  decline: "Not shortlisted",
};

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The request could not be completed. Please try again.";
}

export default function ShortlistReviewWorkspace({
  jobId,
  candidates,
  initialDecisions,
}: Props) {
  const [decisions, setDecisions] = useState<
    Record<string, ReviewDecision>
  >(initialDecisions);

  const [filter, setFilter] = useState<ReviewFilter>("all");

  const [savingCandidates, setSavingCandidates] = useState<
    Record<string, boolean>
  >({});

  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const savingCount = Object.values(savingCandidates).filter(
    Boolean,
  ).length;

  const hasDecisions = Object.keys(decisions).length > 0;
  const isBusy = resetting || savingCount > 0;

  const shortlistedCount = candidates.filter(
    (candidate) => decisions[candidate.id] === "shortlist",
  ).length;

  const reviewCount = candidates.filter(
    (candidate) => decisions[candidate.id] === "review",
  ).length;

  const declinedCount = candidates.filter(
    (candidate) => decisions[candidate.id] === "decline",
  ).length;

  const pendingCount =
    candidates.length -
    shortlistedCount -
    reviewCount -
    declinedCount;

  const visibleCandidates = candidates.filter((candidate) => {
    const decision = decisions[candidate.id];

    if (filter === "all") {
      return true;
    }

    if (filter === "pending") {
      return !decision;
    }

    return decision === filter;
  });

  async function handleDecision(
    candidateId: string,
    decision: ReviewDecision,
  ) {
    if (isBusy) {
      return;
    }

    setError(null);
    setNotice(null);

    setSavingCandidates((current) => ({
      ...current,
      [candidateId]: true,
    }));

    try {
      await saveShortlistDecision(jobId, candidateId, decision);

      setDecisions((current) => ({
        ...current,
        [candidateId]: decision,
      }));

      setNotice(
        `${DECISION_LABELS[decision]} decision saved to this workspace.`,
      );
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSavingCandidates((current) => ({
        ...current,
        [candidateId]: false,
      }));
    }
  }

  async function resetDecisions() {
    if (isBusy) {
      return;
    }

    if (!hasDecisions) {
      setFilter("all");
      return;
    }

    const confirmed = window.confirm(
      "Clear all saved recruiter decisions for this job? This cannot be undone from the review page.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setNotice(null);
    setResetting(true);

    try {
      await clearShortlistDecisions(jobId);

      setDecisions({});
      setFilter("all");
      setNotice("Saved recruiter decisions were cleared.");
    } catch (resetError) {
      setError(errorMessage(resetError));
    } finally {
      setResetting(false);
    }
  }

  return (
    <section className="shortlist-review">
      <header className="shortlist-review-header">
        <div>
          <span className="workspace-kicker">
            RECRUITER DECISIONS
          </span>
          <h2>Shortlist review</h2>
          <p>
            Review job-matched candidates and record your current
            recommendation for each profile.
          </p>
        </div>

        <span className="shortlist-draft-badge" aria-live="polite">
          {resetting
            ? "Clearing decisions…"
            : savingCount > 0
              ? "Saving changes…"
              : hasDecisions
                ? "Saved to workspace"
                : "No saved decisions"}
        </span>
      </header>

      <div className="shortlist-draft-notice">
        <span aria-hidden="true">ⓘ</span>
        <p>
          Recruiter decisions are saved for this job and shared with
          authorized members of your workspace. They remain separate
          from the matching engine&apos;s recommendation.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="shortlist-draft-notice"
          style={{ borderLeft: "3px solid #ef4444" }}
        >
          <span aria-hidden="true">!</span>
          <p>{error}</p>
        </div>
      )}

      {notice && !error && (
        <div
          role="status"
          className="shortlist-draft-notice"
        >
          <span aria-hidden="true">✓</span>
          <p>{notice}</p>
        </div>
      )}

      <div className="shortlist-summary-grid">
        <div className="shortlist-summary-card">
          <span>Awaiting review</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="shortlist-summary-card">
          <span>Shortlisted</span>
          <strong>{shortlistedCount}</strong>
        </div>

        <div className="shortlist-summary-card">
          <span>Keep in review</span>
          <strong>{reviewCount}</strong>
        </div>

        <div className="shortlist-summary-card">
          <span>Not shortlisted</span>
          <strong>{declinedCount}</strong>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="shortlist-empty">
          <span className="shortlist-empty-icon" aria-hidden="true">
            ◎
          </span>
          <h3>No matched candidates to review yet</h3>
          <p>
            Run matching for this job first. Saved match results will
            appear here for recruiter review.
          </p>
        </div>
      ) : (
        <>
          <div className="shortlist-toolbar">
            <div>
              <h3>Candidate review queue</h3>
              <p>
                {visibleCandidates.length} of {candidates.length} candidates
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => void resetDecisions()}
              disabled={isBusy || !hasDecisions}
            >
              {resetting ? "Clearing…" : "Reset decisions"}
            </button>
          </div>

          <div
            className="shortlist-filters"
            aria-label="Filter candidates by decision"
          >
            {(
              [
                ["all", "All candidates"],
                ["pending", "Awaiting review"],
                ["shortlist", "Shortlisted"],
                ["review", "Keep in review"],
                ["decline", "Not shortlisted"],
              ] as [ReviewFilter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`shortlist-filter ${
                  filter === value ? "shortlist-filter-active" : ""
                }`}
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                disabled={isBusy}
              >
                {label}
              </button>
            ))}
          </div>

          {visibleCandidates.length === 0 ? (
            <div className="shortlist-filter-empty">
              No candidates match this filter.
            </div>
          ) : (
            <div className="shortlist-candidate-list">
              {visibleCandidates.map((candidate) => {
                const decision = decisions[candidate.id];
                const isSaving = savingCandidates[candidate.id] === true;

                return (
                  <article
                    className="shortlist-candidate-card"
                    key={candidate.id}
                  >
                    <div className="shortlist-candidate-main">
                      <div className="shortlist-candidate-identity">
                        <span className="shortlist-candidate-avatar">
                          {candidate.name
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase() ?? "")
                            .join("") || "C"}
                        </span>

                        <div>
                          <h4>{candidate.name}</h4>
                          <p>
                            {candidate.email || "Email unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="shortlist-candidate-score">
                        <strong>
                          {candidate.score == null
                            ? "—"
                            : `${candidate.score}%`}
                        </strong>
                        <span>Overall fit</span>
                      </div>

                      <span
                        className={`shortlist-decision-status ${
                          decision
                            ? `shortlist-status-${decision}`
                            : ""
                        }`}
                      >
                        {isSaving
                          ? "Saving…"
                          : decision
                            ? DECISION_LABELS[decision]
                            : "Awaiting review"}
                      </span>
                    </div>

                    {candidate.recommendation && (
                      <p className="shortlist-engine-recommendation">
                        <span>Engine recommendation</span>
                        {candidate.recommendation}
                      </p>
                    )}

                    {candidate.matchedSkills.length > 0 && (
                      <div className="shortlist-evidence">
                        <span>Matched skills</span>
                        <div className="shortlist-evidence-chips">
                          {candidate.matchedSkills
                            .slice(0, 5)
                            .map((skill) => (
                              <span key={skill}>{skill}</span>
                            ))}
                        </div>
                      </div>
                    )}

                    {candidate.missingSkills.length > 0 && (
                      <div className="shortlist-evidence">
                        <span>Skills to review</span>
                        <div className="shortlist-evidence-chips shortlist-gaps">
                          {candidate.missingSkills
                            .slice(0, 5)
                            .map((skill) => (
                              <span key={skill}>{skill}</span>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="shortlist-candidate-actions">
                      {candidate.profileHref && (
                        <Link
                          href={candidate.profileHref}
                          className="shortlist-profile-link"
                        >
                          View candidate profile
                        </Link>
                      )}

                      <div className="shortlist-decision-actions">
                        <button
                          type="button"
                          className={`shortlist-action shortlist-action-accept ${
                            decision === "shortlist" ? "is-active" : ""
                          }`}
                          onClick={() =>
                            void handleDecision(
                              candidate.id,
                              "shortlist",
                            )
                          }
                          aria-pressed={decision === "shortlist"}
                          disabled={isBusy}
                        >
                          Shortlist
                        </button>

                        <button
                          type="button"
                          className={`shortlist-action ${
                            decision === "review" ? "is-active" : ""
                          }`}
                          onClick={() =>
                            void handleDecision(candidate.id, "review")
                          }
                          aria-pressed={decision === "review"}
                          disabled={isBusy}
                        >
                          Keep in review
                        </button>

                        <button
                          type="button"
                          className={`shortlist-action shortlist-action-decline ${
                            decision === "decline" ? "is-active" : ""
                          }`}
                          onClick={() =>
                            void handleDecision(candidate.id, "decline")
                          }
                          aria-pressed={decision === "decline"}
                          disabled={isBusy}
                        >
                          Do not shortlist
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <footer className="shortlist-review-footnote">
        <span aria-hidden="true">ⓘ</span>
        <p>
          Use match scores as supporting evidence, not as an automatic hiring
          decision. Review the candidate&apos;s experience and qualifications
          before making a final decision.
        </p>
      </footer>
    </section>
  );
}