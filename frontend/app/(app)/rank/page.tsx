"use client";

import { useState } from "react";
import api, { BulkMatchResult, CandidateMatchResult, ApiError } from "@/lib/api";
import ScoreRing from "@/components/score-ring";
import ScoreBar from "@/components/score-bar";

const DEMO_JD = `Senior Machine Learning Engineer

Requirements:
- 5+ years in ML/AI
- Python, PyTorch or TensorFlow
- MLOps experience (MLflow, Kubeflow)
- AWS or GCP cloud experience
- Docker, Kubernetes
- Strong statistical modeling

Preferred:
- PhD in CS or related field
- LLM/transformer experience

Responsibilities:
- Design and deploy scalable ML pipelines
- Collaborate with research teams
- Mentor junior engineers`;

const DEMO_RESUMES = [
  `Alice Chen
alice.chen@email.com | github.com/alice | linkedin.com/in/alice

ML Engineer with 7 years of experience.

SKILLS: Python, PyTorch, TensorFlow, AWS SageMaker, MLflow, Kubernetes, Docker, Spark, SQL

EXPERIENCE:
Senior ML Engineer — Google (2021–Present)
- Led MLOps platform serving 100M users
- PhD in Computer Science from MIT (2021)

EDUCATION: PhD Computer Science, MIT, 2021

CERTIFICATIONS: AWS ML Specialty, GCP Professional Data Engineer`,

  `Bob Kumar
bob.kumar@email.com | github.com/bobkumar

Data Scientist with 3 years experience.

SKILLS: Python, scikit-learn, pandas, SQL, AWS basics, Jupyter, TensorFlow (basic)

EXPERIENCE:
Data Analyst — Infosys (2022–Present)
- Built dashboards and basic ML models
- Created reporting pipelines

EDUCATION: B.Tech Computer Science, NIT, 2022`,

  `Sara Martinez
sara.m@email.com

Senior Data Scientist with 5 years experience.

SKILLS: Python, PyTorch, MLflow, Docker, AWS, SQL, Airflow, Kubeflow, scikit-learn

EXPERIENCE:
Senior Data Scientist — Amazon (2020–Present)
- Deployed production ML models for recommendation systems
- Reduced inference latency by 45%

ML Engineer — Wipro (2018–2020)

EDUCATION: M.Tech AI, IIT Bombay, 2019

CERTIFICATIONS: AWS ML Specialty`,
];

interface RankedCandidate {
  raw: BulkMatchResult;
  match: CandidateMatchResult | null;
  index: number;
}

export default function RankPage() {
  const [jobText, setJobText] = useState("");
  const [resumeInputs, setResumeInputs] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [ranked, setRanked] = useState<RankedCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  function addResume() {
    setResumeInputs((prev) => [...prev, ""]);
  }

  function removeResume(i: number) {
    setResumeInputs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateResume(i: number, val: string) {
    setResumeInputs((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  }

  function loadDemo() {
    setJobText(DEMO_JD);
    setResumeInputs(DEMO_RESUMES);
  }

  async function handleRank() {
    const resumes = resumeInputs.map((r) => r.trim()).filter(Boolean);
    if (!jobText.trim() || resumes.length === 0) return;

    setLoading(true);
    setError(null);
    setRanked([]);
    setSelectedIdx(null);

    try {
      const results = await api.matchBulk(jobText.trim(), resumes);
      const ranked: RankedCandidate[] = results.map((r, i) => ({
        raw: r,
        match: r.candidate_match as CandidateMatchResult | null,
        index: i,
      }));
      // Already sorted by backend, but re-sort by overall_score descending
      ranked.sort((a, b) => {
        const sa = a.match?.overall_score ?? 0;
        const sb = b.match?.overall_score ?? 0;
        return sb - sa;
      });
      setRanked(ranked);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(`Backend error (${e.status}): ${e.message}`);
      } else {
        setError("Unable to reach the backend.");
      }
    } finally {
      setLoading(false);
    }
  }

  const selectedCandidate = selectedIdx !== null ? ranked[selectedIdx] : null;

  return (
    <div style={{ padding: "40px 32px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>Rank & Shortlist Candidates</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Submit multiple resumes against a job description to get a ranked leaderboard with detailed match analysis.
        </p>
      </div>

      {/* Demo Button */}
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={loadDemo}>
          Load Demo (3 Candidates + JD)
        </button>
      </div>

      {/* JD input */}
      <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
        <label className="form-label">Job Description</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: 180, fontSize: "0.875rem" }}
          placeholder="Paste job description..."
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
        />
      </div>

      {/* Resumes */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            Candidate Resumes ({resumeInputs.length})
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={addResume}>
            + Add Resume
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {resumeInputs.map((text, i) => (
            <div key={i} className="glass" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>Candidate {i + 1}</label>
                {resumeInputs.length > 1 && (
                  <button className="btn btn-ghost btn-sm" onClick={() => removeResume(i)} style={{ color: "var(--danger)" }}>
                    Remove
                  </button>
                )}
              </div>
              <textarea
                className="form-textarea"
                style={{ minHeight: 160, fontSize: "0.8125rem", fontFamily: "monospace" }}
                placeholder="Paste resume text..."
                value={text}
                onChange={(e) => updateResume(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <button
          id="rank-btn"
          className="btn btn-primary btn-lg"
          onClick={handleRank}
          disabled={loading || !jobText.trim() || resumeInputs.every((r) => !r.trim())}
        >
          {loading ? (
            <><div className="spinner" /> Ranking Candidates…</>
          ) : (
            "🏆 Rank Candidates"
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>⚠️</span>
          <div>{error}</div>
        </div>
      )}

      {ranked.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: selectedCandidate ? "1fr 1.5fr" : "1fr", gap: 24 }}>
          {/* Leaderboard */}
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 12 }}>Leaderboard</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ranked.map((c, rank) => {
                const name = c.raw.identity?.name ?? `Candidate ${c.index + 1}`;
                const score = c.match?.overall_score ?? 0;
                const isSelected = selectedIdx === rank;
                return (
                  <button
                    key={rank}
                    onClick={() => setSelectedIdx(isSelected ? null : rank)}
                    style={{
                      background: isSelected ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isSelected ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 12,
                      padding: "16px 20px",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      transition: "all 0.15s ease",
                    }}
                    aria-pressed={isSelected}
                    id={`candidate-row-${rank}`}
                  >
                    {/* Rank badge */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: rank === 0 ? "#f59e0b20" : rank === 1 ? "#94a3b820" : "rgba(255,255,255,0.06)",
                        border: `2px solid ${rank === 0 ? "#f59e0b" : rank === 1 ? "#94a3b8" : "rgba(255,255,255,0.1)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        flexShrink: 0,
                        color: rank === 0 ? "#f59e0b" : rank === 1 ? "#94a3b8" : "var(--text-muted)",
                      }}
                    >
                      #{rank + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)", marginBottom: 2 }}>
                        {name}
                      </div>
                      {c.raw.identity?.email && (
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{c.raw.identity.email}</div>
                      )}
                      {/* Mini skill tags */}
                      {c.match?.skill_match?.matched?.slice(0, 3).map((s) => (
                        <span key={s} className="skill-tag skill-tag-matched" style={{ marginRight: 4, marginTop: 4, display: "inline-flex", fontSize: "0.7rem" }}>{s}</span>
                      ))}
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          color: score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444",
                        }}
                      >
                        {Math.round(score)}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>/ 100</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          {selectedCandidate && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                  {selectedCandidate.raw.identity?.name ?? `Candidate ${selectedCandidate.index + 1}`}
                </h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIdx(null)}>✕ Close</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Overall */}
                <div className="glass" style={{ padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
                  <ScoreRing score={selectedCandidate.match?.overall_score ?? 0} size={100} strokeWidth={9} />
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 4 }}>Overall Match</div>
                    {selectedCandidate.match?.evidence?.slice(0, 3).map((e, i) => (
                      <div key={i} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: 4 }}>• {e}</div>
                    ))}
                  </div>
                </div>

                {/* Scores */}
                {selectedCandidate.match && ([
                  { label: "Skills", key: "skill_match" as const },
                  { label: "Experience", key: "experience_match" as const },
                  { label: "Education", key: "education_match" as const },
                  { label: "Certifications", key: "certification_match" as const },
                  { label: "Projects", key: "project_match" as const },
                  { label: "Context", key: "context_match" as const },
                ] as const).map(({ label, key }) => {
                  const comp = selectedCandidate.match?.[key];
                  if (!comp) return null;
                  return (
                    <ScoreBar
                      key={key}
                      label={label}
                      score={comp.score ?? 0}
                      matched={comp.matched ?? []}
                      missing={comp.missing ?? []}
                    />
                  );
                })}

                {/* Missing skills */}
                {(selectedCandidate.match?.skill_match?.missing?.length ?? 0) > 0 && (
                  <div className="glass" style={{ padding: 16 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--danger)", marginBottom: 8 }}>Missing Skills</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {selectedCandidate.match?.skill_match?.missing?.map((s) => (
                        <span key={s} className="skill-tag skill-tag-missing">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk */}
                {selectedCandidate.raw.risk_assessment && (
                  <div className="glass" style={{ padding: 16 }}>
                    <div className="section-title" style={{ marginBottom: 8 }}>Risk</div>
                    {(selectedCandidate.raw.risk_assessment as { risk_level?: string; risk_score?: number }).risk_level && (
                      <span className="badge badge-yellow">
                        {(selectedCandidate.raw.risk_assessment as { risk_level?: string }).risk_level}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
