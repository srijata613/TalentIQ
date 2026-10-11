"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";

export interface ComparisonCandidate {
  id: string;
  name: string;
  email?: string;
  score: number | null;
  skillScore: number | null;
  experienceScore: number | null;
  educationScore: number | null;
  certificationScore: number | null;
  domainScore: number | null;
  recommendation?: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  profileHref?: string;
}

type ScoreField =
  | "score"
  | "skillScore"
  | "experienceScore"
  | "educationScore"
  | "certificationScore"
  | "domainScore";

type ListField =
  | "matchedSkills"
  | "missingSkills"
  | "strengths"
  | "weaknesses";

type ComparisonRow =
  | {
      label: string;
      kind: "score";
      key: ScoreField;
    }
  | {
      label: string;
      kind: "chips";
      key: ListField;
      empty: string;
    }
  | {
      label: string;
      kind: "bullets";
      key: ListField;
      empty: string;
    }
  | {
      label: string;
      kind: "text";
      key: "recommendation";
      empty: string;
    };

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: "Overall fit",
    kind: "score",
    key: "score",
  },
  {
    label: "Skills alignment",
    kind: "score",
    key: "skillScore",
  },
  {
    label: "Experience fit",
    kind: "score",
    key: "experienceScore",
  },
  {
    label: "Education fit",
    kind: "score",
    key: "educationScore",
  },
  {
    label: "Certification fit",
    kind: "score",
    key: "certificationScore",
  },
  {
    label: "Domain fit",
    kind: "score",
    key: "domainScore",
  },
  {
    label: "Matched skills",
    kind: "chips",
    key: "matchedSkills",
    empty: "No matched skills available.",
  },
  {
    label: "Skills to review",
    kind: "chips",
    key: "missingSkills",
    empty: "No missing skills listed.",
  },
  {
    label: "Strengths",
    kind: "bullets",
    key: "strengths",
    empty: "No strengths supplied.",
  },
  {
    label: "Considerations",
    kind: "bullets",
    key: "weaknesses",
    empty: "No considerations supplied.",
  },
  {
    label: "Recommendation",
    kind: "text",
    key: "recommendation",
    empty: "No recommendation available.",
  },
];

interface Props {
  jobTitle: string;
  candidates: ComparisonCandidate[];
}

export default function CandidateComparisonWorkspace({
  jobTitle,
  candidates,
}: Props) {
  // Only use real candidates passed in by the saved-matches page.
  // Never substitute fictional preview profiles.
  const availableCandidates = candidates;

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    availableCandidates.slice(0, 2).map((candidate) => candidate.id),
  );

  const selectedCandidates = availableCandidates.filter((candidate) =>
    selectedIds.includes(candidate.id),
  );

  function toggleCandidate(candidateId: string) {
    setSelectedIds((current) => {
      if (current.includes(candidateId)) {
        return current.filter((id) => id !== candidateId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, candidateId];
    });
  }

  function resetSelection() {
    setSelectedIds(
      availableCandidates.slice(0, 2).map((candidate) => candidate.id),
    );
  }

  const hasCandidates = availableCandidates.length > 0;
  const canCompare = selectedCandidates.length >= 2;

  return (
    <section className="compare-workspace">
      <header className="compare-heading">
        <div className="compare-heading-copy">
          <span className="workspace-kicker">
            CANDIDATE EVALUATION
          </span>

          <h2>Compare candidates</h2>

          <p>
            Review candidates against{" "}
            <strong>{jobTitle}</strong>. Compare their scores, skills, and
            supporting information before making a decision.
          </p>
        </div>

        <span
          className={`compare-mode-badge ${
            hasCandidates
              ? "compare-mode-saved"
              : "compare-mode-preview"
          }`}
        >
          {hasCandidates ? "Saved match data" : "No saved matches"}
        </span>
      </header>

      <div className="compare-selection-heading">
        <div>
          <h3>Select profiles to compare</h3>
          <p>
            {hasCandidates
              ? `Choose up to three candidates. ${availableCandidates.length} saved ${
                  availableCandidates.length === 1
                    ? "candidate is"
                    : "candidates are"
                } available.`
              : "Saved candidates will appear here after matching."}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={resetSelection}
          disabled={!hasCandidates}
        >
          Reset selection
        </button>
      </div>

      {hasCandidates ? (
        <div className="compare-candidate-picker">
          {availableCandidates.map((candidate, index) => {
            const selected = selectedIds.includes(candidate.id);
            const disabled =
              !selected && selectedIds.length >= 3;

            return (
              <button
                key={candidate.id}
                type="button"
                className={`compare-picker-card ${
                  selected ? "compare-picker-selected" : ""
                }`}
                onClick={() => toggleCandidate(candidate.id)}
                aria-pressed={selected}
                disabled={disabled}
              >
                <span className="compare-picker-top">
                  <span className="compare-avatar">
                    {initials(candidate.name)}
                  </span>

                  <span
                    className={`compare-check ${
                      selected ? "compare-check-selected" : ""
                    }`}
                    aria-hidden="true"
                  >
                    {selected ? "✓" : ""}
                  </span>
                </span>

                <span className="compare-picker-name">
                  {candidate.name}
                </span>

                <span className="compare-picker-email">
                  {candidate.email || "Email unavailable"}
                </span>

                <span className="compare-picker-bottom">
                  <span>
                    {candidate.score == null
                      ? "Score unavailable"
                      : `${candidate.score}% fit`}
                  </span>

                  <span className="compare-picker-rank">
                    {selected ? "Selected" : `Candidate ${index + 1}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="compare-insufficient">
          <span className="compare-insufficient-icon">↔</span>
          <strong>No saved candidates yet</strong>
          <p>
            Run matching for this job to populate the comparison workspace
            with real candidate results.
          </p>
        </div>
      )}

      <div className="compare-board-heading">
        <div>
          <h3>Side-by-side comparison</h3>
          <p>
            {selectedCandidates.length} of{" "}
            {availableCandidates.length} available{" "}
            {availableCandidates.length === 1
              ? "candidate"
              : "candidates"}{" "}
            selected
          </p>
        </div>

        {canCompare && (
          <span className="compare-board-status">
            {selectedCandidates.length} profiles
          </span>
        )}
      </div>

      {!canCompare ? (
        <div className="compare-insufficient">
          <span className="compare-insufficient-icon">↔</span>

          <strong>
            {!hasCandidates
              ? "No saved matches yet"
              : availableCandidates.length === 1
                ? "One saved match available"
                : "Choose at least two candidates"}
          </strong>

          <p>
            {!hasCandidates
              ? "Run matching for this job to see real candidate results here."
              : availableCandidates.length === 1
                ? "Match at least one more candidate to enable side-by-side comparison. Your existing saved result remains available in the leaderboard below."
                : "Select at least two candidates above to compare their fit scores, skills, strengths, and recommendations."}
          </p>
        </div>
      ) : (
        <div className="compare-board-scroll">
          <div
            className="compare-board"
            style={
              {
                "--compare-count": selectedCandidates.length,
              } as CSSProperties
            }
          >
            <div className="compare-board-header-row">
              <div className="compare-axis-heading">
                <span>COMPARISON</span>
                <small>Role-specific evidence</small>
              </div>

              {selectedCandidates.map((candidate, index) => (
                <div
                  className="compare-profile-heading"
                  key={candidate.id}
                >
                  <div className="compare-profile-top">
                    <span className="compare-profile-rank">
                      0{index + 1}
                    </span>

                    <span className="compare-profile-avatar">
                      {initials(candidate.name)}
                    </span>
                  </div>

                  <h4>{candidate.name}</h4>

                  {candidate.email && (
                    <p className="compare-profile-email">
                      {candidate.email}
                    </p>
                  )}

                  <div className="compare-overall-score">
                    <div
                      className="compare-score-ring"
                      style={{
                        background:
                          candidate.score == null
                            ? "#292930"
                            : `conic-gradient(#ff6129 ${
                                clampScore(candidate.score) * 3.6
                              }deg, #292930 0deg)`,
                      }}
                      role="img"
                      aria-label={
                        candidate.score == null
                          ? "Overall score unavailable"
                          : `Overall fit ${candidate.score}%`
                      }
                    >
                      <span>
                        {candidate.score == null
                          ? "—"
                          : candidate.score}
                      </span>
                    </div>

                    <div className="compare-score-copy">
                      <strong>Overall fit</strong>
                      <span>
                        {candidate.score == null
                          ? "Not available"
                          : "Out of 100"}
                      </span>
                    </div>
                  </div>

                  {candidate.profileHref && (
                    <Link
                      href={candidate.profileHref}
                      className="compare-profile-link"
                    >
                      Open profile ↗
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {COMPARISON_ROWS.map((row) => (
              <div className="compare-board-row" key={row.label}>
                <div className="compare-axis-label">
                  <strong>{row.label}</strong>
                  <span>{rowDescription(row.label)}</span>
                </div>

                {selectedCandidates.map((candidate) => (
                  <div
                    className="compare-cell"
                    key={`${candidate.id}-${row.label}`}
                  >
                    {renderCell(candidate, row)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="compare-footnote">
        <span className="compare-footnote-icon">ⓘ</span>
        <p>
          Fit scores support recruiter judgment. Review the underlying skills,
          experience, and evidence instead of relying on a single number.
        </p>
      </footer>
    </section>
  );
}

function renderCell(
  candidate: ComparisonCandidate,
  row: ComparisonRow,
) {
  if (row.kind === "score") {
    const score = candidate[row.key];

    return (
      <div className="compare-score-cell">
        <div className="compare-score-cell-top">
          <span>
            {score == null ? "Not available" : `${score}%`}
          </span>
        </div>

        <div
          className="compare-progress-track"
          role="progressbar"
          aria-label={row.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score == null ? 0 : clampScore(score)}
          aria-valuetext={
            score == null ? "Not available" : `${score}%`
          }
        >
          <span
            className={
              score == null ? "compare-progress-unavailable" : ""
            }
            style={{
              width: `${score == null ? 0 : clampScore(score)}%`,
            }}
          />
        </div>
      </div>
    );
  }

  if (row.kind === "chips") {
    const values = candidate[row.key] as string[];

    return values.length ? (
      <div className="compare-chip-list">
        {values.map((value) => (
          <span
            className={`compare-chip ${
              row.key === "matchedSkills"
                ? "compare-chip-positive"
                : "compare-chip-neutral"
            }`}
            key={value}
          >
            {value}
          </span>
        ))}
      </div>
    ) : (
      <span className="compare-empty-value">{row.empty}</span>
    );
  }

  if (row.kind === "bullets") {
    const values = candidate[row.key] as string[];

    return values.length ? (
      <ul className="compare-bullet-list">
        {values.slice(0, 4).map((value, index) => (
          <li key={`${value}-${index}`}>{value}</li>
        ))}
      </ul>
    ) : (
      <span className="compare-empty-value">{row.empty}</span>
    );
  }

  const recommendation = candidate.recommendation?.trim();

  return recommendation ? (
    <span
      className={`compare-recommendation ${
        recommendation.toLowerCase().includes("strong")
          ? "compare-recommendation-strong"
          : ""
      }`}
    >
      {recommendation}
    </span>
  ) : (
    <span className="compare-empty-value">{row.empty}</span>
  );
}

function rowDescription(label: string): string {
  const descriptions: Record<string, string> = {
    "Overall fit": "Combined score",
    "Skills alignment": "Technical overlap",
    "Experience fit": "Relevant experience",
    "Education fit": "Education criteria",
    "Certification fit": "Credentials",
    "Domain fit": "Industry relevance",
    "Matched skills": "Evidence of overlap",
    "Skills to review": "Potential gaps",
    Strengths: "Positive indicators",
    Considerations: "Areas to explore",
    Recommendation: "Engine output",
  };

  return descriptions[label] ?? "";
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

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}
