"use client";

import { useState } from "react";
import Link from "next/link";
import { searchCandidates } from "@/actions/search-candidates";

type SearchResult = Record<string, unknown>;

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getStringList(...values: unknown[]): string[] {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      ).map((item) => item.trim());
    }
  }

  return [];
}

function getNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }
  }

  return null;
}

export default function SearchPage() {
  const [skills, setSkills] = useState("");
  const [domain, setDomain] = useState("");
  const [minExp, setMinExp] = useState(0);
  const [certification, setCertification] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await searchCandidates({
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        domain,
        minExperience: minExp,
        certification,
        minScore,
      });

      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to search candidates. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Candidate Search</h1>
        <p className="page-subtitle">
          Filter candidates by skills, domain, experience, and saved match
          score.
        </p>
      </div>

      {/* Search filters */}
      <div
        className="glass"
        style={{
          padding: 24,
          marginBottom: 24,
          borderRadius: 12,
        }}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSearch();
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <label className="form-label" htmlFor="search-skills">
                Skills (comma-separated)
              </label>
              <input
                id="search-skills"
                className="form-input"
                placeholder="Python, PyTorch, AWS"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="search-domain">
                Domain
              </label>
              <input
                id="search-domain"
                className="form-input"
                placeholder="machine-learning"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="search-experience">
                Min Experience (years)
              </label>
              <input
                id="search-experience"
                className="form-input"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={minExp}
                onChange={(event) => {
                  const value = event.target.value;
                  setMinExp(value === "" ? 0 : Number(value));
                }}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="search-certification">
                Certification Contains
              </label>
              <input
                id="search-certification"
                className="form-input"
                placeholder="AWS"
                value={certification}
                onChange={(event) => setCertification(event.target.value)}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="search-min-score">
                Min Score (0–100)
              </label>
              <input
                id="search-min-score"
                className="form-input"
                type="number"
                min={0}
                max={100}
                step={1}
                value={minScore}
                onChange={(event) => {
                  const value = event.target.value;
                  setMinScore(value === "" ? 0 : Number(value));
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              id="search-candidates-btn"
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Searching Candidates..." : "Search Candidates"}
            </button>
          </div>
        </form>
      </div>

      {/* Search errors */}
      {error && (
        <div
          className="glass"
          role="alert"
          style={{
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            borderLeft: "4px solid #ef4444",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        </div>
      )}

      {/* Search results */}
      {results !== null && (
        <div>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: 14,
              color: "#FFFFFF",
            }}
          >
            Search Results ({results.length} candidate
            {results.length !== 1 ? "s" : ""})
          </h2>

          {results.length === 0 ? (
            <div
              className="glass"
              style={{
                padding: 40,
                textAlign: "center",
                color: "#A1A1AA",
                borderRadius: 12,
              }}
            >
              No candidates matched your filter criteria. Try adjusting
              your filters or uploading and analyzing more resumes.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {results.map((candidate, index) => {
                const candidateId = getString(candidate.id);

                const name =
                  getString(candidate.name) ??
                  getString(candidate.parsed_name) ??
                  `Candidate ${index + 1}`;

                const email =
                  getString(candidate.email) ??
                  getString(candidate.parsed_email);

                const candidateSkills = getStringList(
                  candidate.parsed_skills,
                  candidate.skills,
                );

                const experienceYears = getNumber(
                  candidate.experience_years,
                  candidate.parsed_experience_years,
                );

                const certifications = getStringList(
                  candidate.certifications,
                  candidate.parsed_certifications,
                );

                const domainLabel = getString(candidate.domain);

                const bestMatchScore = getNumber(
                  candidate.best_match_score_pct,
                );

                const bestMatchJobTitle = getString(
                  candidate.best_match_job_title,
                );

                return (
                  <article
                    key={candidateId ?? `${name}-${index}`}
                    className="glass"
                    style={{ padding: "18px 20px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "#FFFFFF",
                            marginBottom: 6,
                          }}
                        >
                          {candidateId ? (
                            <Link
                              href={`/candidates/${encodeURIComponent(candidateId)}`}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              {name}
                            </Link>
                          ) : (
                            name
                          )}
                        </div>

                        {email && (
                          <div
                            style={{
                              fontSize: "0.8125rem",
                              color: "#A1A1AA",
                              marginBottom: 8,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {email}
                          </div>
                        )}

                        {domainLabel && (
                          <div style={{ marginBottom: 8 }}>
                            <span className="badge badge-indigo">
                              {domainLabel}
                            </span>
                          </div>
                        )}

                        {experienceYears !== null && (
                          <div
                            style={{
                              fontSize: "0.8125rem",
                              color: "#A1A1AA",
                              marginBottom: 8,
                            }}
                          >
                            {experienceYears} year
                            {experienceYears !== 1 ? "s" : ""} experience
                          </div>
                        )}

                        {candidateSkills.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                            }}
                          >
                            {candidateSkills.slice(0, 6).map((skill, i) => (
                              <span
                                key={`${skill}-${i}`}
                                className="skill-tag skill-tag-matched"
                              >
                                {skill}
                              </span>
                            ))}

                            {candidateSkills.length > 6 && (
                              <span className="skill-tag skill-tag-neutral">
                                +{candidateSkills.length - 6}
                              </span>
                            )}
                          </div>
                        )}

                        {certifications.length > 0 && (
                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                            }}
                          >
                            {certifications.map((certification, i) => (
                              <span
                                key={`${certification}-${i}`}
                                className="badge badge-indigo"
                              >
                                {certification}
                              </span>
                            ))}
                          </div>
                        )}

                        {candidateId && (
                          <div style={{ marginTop: 12 }}>
                            <Link
                              href={`/candidates/${encodeURIComponent(candidateId)}`}
                              style={{
                                fontSize: "0.8125rem",
                                color: "#FF6129",
                                textDecoration: "none",
                              }}
                            >
                              View candidate profile ↗
                            </Link>
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          textAlign: "center",
                          minWidth: 76,
                          flexShrink: 0,
                        }}
                      >
                        {bestMatchScore !== null ? (
                          <>
                            <div
                              style={{
                                fontSize: "1.5rem",
                                fontWeight: 700,
                                color:
                                  bestMatchScore >= 80
                                    ? "#10b981"
                                    : bestMatchScore >= 60
                                      ? "#FF6129"
                                      : "#ef4444",
                              }}
                            >
                              {Math.round(bestMatchScore)}%
                            </div>

                            <div
                              style={{
                                fontSize: "0.7rem",
                                color: "#A1A1AA",
                              }}
                            >
                              Best saved match
                            </div>

                            {bestMatchJobTitle && (
                              <div
                                title={bestMatchJobTitle}
                                style={{
                                  fontSize: "0.7rem",
                                  color: "#A1A1AA",
                                  marginTop: 4,
                                  maxWidth: 120,
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {bestMatchJobTitle}
                              </div>
                            )}
                          </>
                        ) : (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#A1A1AA",
                              lineHeight: 1.5,
                            }}
                          >
                            No saved match yet
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}