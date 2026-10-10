
"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComparisonCandidate } from "@/components/candidate-comparison-workspace";

type ReviewDecision = "shortlist" | "review" | "decline";
type ReviewFilter = "all" | ReviewDecision | "pending";

interface Props {
  candidates: ComparisonCandidate[];
}

const DECISION_LABELS: Record<ReviewDecision, string> = {
  shortlist: "Shortlisted",
  review: "Keep in review",
  decline: "Not shortlisted",
};

export default function ShortlistReviewWorkspace({
  candidates,
}: Props) {
  const [decisions, setDecisions] = useState<
    Record<string, ReviewDecision>
  >({});
  const [filter, setFilter] = useState<ReviewFilter>("all");

  const shortlistedCount = candidates.filter(
    (candidate) => decisions[candidate.id] === "shortlist",
  ).length;

  const reviewCount = candidates.filter(
    (candidate) => decisions[candidate.id] === "review",
  ).length;

  const declinedCount = candidates.filter(
    (candidate) => decisions[candidate.id] === "decline",
  ).length;

  const pendingCount = candidates.length -
    shortlistedCount -
    reviewCount -
    declinedCount;

  const visibleCandidates = candidates.filter((candidate) => {
    const decision = decisions[candidate.id];

    return filter === "all" || decision === filter;
  });

  function setDecision(
    candidateId: string,
    decision: ReviewDecision,
  ) {
    setDecisions((current) => ({
      ...current,
      [candidateId]: decision,
    }));
  }

  function resetDecisions() {
    setDecisions({});
    setFilter("all");
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

        <span className="shortlist-draft-badge">
          Draft · Not saved
        </span>
      </header>

      <div className="shortlist-draft-notice">
        <span aria-hidden="true">ⓘ</span>
        <p>
          These are temporary review decisions held in this page.
          They are not written to the database or shared with other
          users.
        </p>
      </div>

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
              onClick={resetDecisions}
              disabled={Object.keys(decisions).length === 0}
            >
              Reset decisions
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
              {visibleCandidates.map((candidate, index) => {
                const decision = decisions[candidate.id];

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
                        className={`shortlist-decision-status shortlist-status-${decision}`}
                      >
                        {decision ? DECISION_LABELS[decision] : "Awaiting review"}
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
                          {candidate.matchedSkills.slice(0, 5).map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {candidate.missingSkills.length > 0 && (
                      <div className="shortlist-evidence">
                        <span>Skills to review</span>
                        <div className="shortlist-evidence-chips shortlist-gaps">
                          {candidate.missingSkills.slice(0, 5).map((skill) => (
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
                            setDecision(candidate.id, "shortlist")
                          }
                          aria-pressed={decision === "shortlist"}
                        >
                          Shortlist
                        </button>

                        <button
                          type="button"
                          className={`shortlist-action ${
                            decision === "review" ? "is-active" : ""
                          }`}
                          onClick={() => setDecision(candidate.id, "review")}
                          aria-pressed={decision === "review"}
                        >
                          Keep in review
                        </button>

                        <button
                          type="button"
                          className={`shortlist-action shortlist-action-decline ${
                            decision === "decline" ? "is-active" : ""
                          }`}
                          onClick={() => setDecision(candidate.id, "decline")}
                          aria-pressed={decision === "decline"}
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
          decision. Review the candidate's experience and qualifications
          before making a final decision.
        </p>
      </footer>
    </section>
  );
}
