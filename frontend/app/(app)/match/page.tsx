"use client";

import { useState } from "react";
import api, { MatchResponse, CandidateMatchResult, ApiError } from "@/lib/api";
import ScoreRing from "@/components/score-ring";
import ScoreBar from "@/components/score-bar";

const DEMO_RESUME = `Jane Doe
jane.doe@email.com | github.com/janedoe | linkedin.com/in/janedoe

SUMMARY
Machine Learning Engineer with 4 years of experience deploying production ML systems.

SKILLS
Python, PyTorch, TensorFlow, scikit-learn, AWS, Docker, Kubernetes, MLflow, SQL, FastAPI

EXPERIENCE
ML Engineer — Amazon (2022–Present)
- Built and deployed recommendation models serving 10M users
- Reduced model training time by 60% using distributed training on AWS SageMaker

Data Scientist — Wipro (2020–2022)  
- Developed NLP pipelines for document classification

EDUCATION
B.Tech Computer Science — NIT Trichy, 2020 | CGPA: 8.5

CERTIFICATIONS
AWS Certified Machine Learning Specialty`;

const DEMO_JD = `Senior Machine Learning Engineer

Requirements:
- 5+ years of experience in ML/AI
- Expert Python programming
- Deep knowledge of PyTorch or TensorFlow
- Experience with MLOps (MLflow, Kubeflow, Airflow)
- AWS or GCP cloud experience
- Docker and Kubernetes
- Strong statistical modeling knowledge

Preferred:
- PhD in CS or related field
- LLM experience
- AWS ML Specialty certification

Responsibilities:
- Design and deploy scalable ML pipelines
- Collaborate with research teams
- Mentor junior engineers`;

function getMatchFromResponse(result: MatchResponse): CandidateMatchResult | null {
  const cm = result.candidate_match;
  if (!cm) return null;
  // Handle both plain object and dataclass-like structure
  return cm as CandidateMatchResult;
}

export default function MatchPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleMatch() {
    if (!resumeText.trim() || !jobText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.match(jobText.trim(), resumeText.trim());
      setResult(data);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(`Backend error (${e.status}): ${e.message}`);
      } else {
        setError("Unable to reach the backend. Make sure it is running.");
      }
    } finally {
      setLoading(false);
    }
  }

  const matchResult = result ? getMatchFromResponse(result) : null;

  return (
    <div style={{ padding: "40px 32px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>Candidate Matching</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Score a candidate against a job description across 6 dimensions: skills, experience, education, certifications, projects, and context.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Resume input */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ marginBottom: 10, display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setResumeText(DEMO_RESUME)}>
              Load Demo
            </button>
            {resumeText && (
              <button className="btn btn-ghost btn-sm" onClick={() => setResumeText("")}>Clear</button>
            )}
          </div>
          <label className="form-label">Resume Text</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: 320, fontSize: "0.8125rem", fontFamily: "monospace" }}
            placeholder="Paste candidate's resume..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>

        {/* JD input */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ marginBottom: 10, display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setJobText(DEMO_JD)}>
              Load Demo
            </button>
            {jobText && (
              <button className="btn btn-ghost btn-sm" onClick={() => setJobText("")}>Clear</button>
            )}
          </div>
          <label className="form-label">Job Description</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: 320, fontSize: "0.8125rem" }}
            placeholder="Paste job description..."
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <button
          id="match-btn"
          className="btn btn-primary btn-lg"
          onClick={handleMatch}
          disabled={loading || !resumeText.trim() || !jobText.trim()}
        >
          {loading ? (
            <><div className="spinner" /> Analyzing Match…</>
          ) : (
            "⚡ Match Candidate"
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>⚠️</span>
          <div>{error}</div>
        </div>
      )}

      {result && matchResult && (
        <MatchResultView result={result} match={matchResult} />
      )}

      {result && !matchResult && (
        <div className="alert alert-warning">
          <span>⚠️</span>
          <div>Match completed but score data was not returned. The pipeline may have encountered an issue. Raw result available in the browser console.</div>
        </div>
      )}
    </div>
  );
}

function MatchResultView({ result, match }: { result: MatchResponse; match: CandidateMatchResult }) {
  const identity = result.identity ?? {};
  const name = identity.name ?? "Candidate";
  const riskAssessment = result.risk_assessment;
  const recommendations = result.recommendations ?? [];
  const aiProfile = result.ai_profile;

  const componentScores = [
    { label: "Skills", key: "skill_match" as const },
    { label: "Experience", key: "experience_match" as const },
    { label: "Education", key: "education_match" as const },
    { label: "Certifications", key: "certification_match" as const },
    { label: "Projects", key: "project_match" as const },
    { label: "Context", key: "context_match" as const },
  ];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Hero score card */}
      <div className="glass" style={{ padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
          <ScoreRing
            score={match.overall_score}
            size={140}
            strokeWidth={12}
            label={name}
            sublabel={identity.email ?? undefined}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 8 }}>
              Overall Match Score
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
              <MetaBadge
                label="Evidence points"
                value={String(match.metadata?.total_evidence ?? match.evidence?.length ?? 0)}
              />
              <MetaBadge
                label="Strong categories"
                value={String(match.metadata?.strong_categories ?? 0)}
              />
              <MetaBadge
                label="Weak categories"
                value={String(match.metadata?.weak_categories ?? 0)}
              />
              {match.metadata?.overall_confidence !== undefined && (
                <MetaBadge
                  label="Confidence"
                  value={`${Math.round(match.metadata.overall_confidence)}%`}
                />
              )}
            </div>
            {/* All matched skills summary */}
            {match.skill_match?.matched?.length > 0 && (
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6 }}>Matched Skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {match.skill_match.matched.slice(0, 8).map((s) => (
                    <span key={s} className="skill-tag skill-tag-matched">{s}</span>
                  ))}
                  {match.skill_match.matched.length > 8 && (
                    <span className="skill-tag skill-tag-neutral">+{match.skill_match.matched.length - 8}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evidence */}
        {match.evidence?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Key Evidence</div>
            <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
              {match.evidence.slice(0, 6).map((e, i) => (
                <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Component Scores */}
      <div>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 12 }}>Score Breakdown</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
          {componentScores.map(({ label, key }) => {
            const comp = match[key];
            if (!comp) return null;
            return (
              <ScoreBar
                key={key}
                label={label}
                score={comp.score ?? 0}
                matched={comp.matched ?? []}
                missing={comp.missing ?? []}
                evidence={comp.evidence ?? []}
              />
            );
          })}
        </div>
      </div>

      {/* Missing skills */}
      {match.skill_match?.missing?.length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>Missing Skills</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {match.skill_match.missing.map((s) => (
              <span key={s} className="skill-tag skill-tag-missing">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* AI Profile */}
      {aiProfile && (aiProfile.headline || aiProfile.summary || (aiProfile.strengths as string[])?.length > 0) && (
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>AI Candidate Profile</div>
          {aiProfile.headline && (
            <div style={{ fontSize: "1.0625rem", fontWeight: 600, marginBottom: 8 }}>{String(aiProfile.headline)}</div>
          )}
          {aiProfile.summary && (
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px" }}>
              {String(aiProfile.summary)}
            </p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {(aiProfile.strengths as string[])?.length > 0 && (
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--success)", marginBottom: 8 }}>✅ Strengths</div>
                <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                  {(aiProfile.strengths as string[]).map((s, i) => (
                    <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 4 }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {(aiProfile.growth_areas as string[])?.length > 0 && (
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--warning)", marginBottom: 8 }}>📈 Growth Areas</div>
                <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                  {(aiProfile.growth_areas as string[]).map((s, i) => (
                    <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 4 }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {riskAssessment && (
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Risk Assessment</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {riskAssessment.risk_score !== undefined && (
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>Risk Score</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: riskAssessment.risk_score > 50 ? "var(--danger)" : "var(--success)" }}>
                  {typeof riskAssessment.risk_score === "number" ? riskAssessment.risk_score.toFixed(0) : riskAssessment.risk_score}
                </div>
              </div>
            )}
            {riskAssessment.risk_level && (
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>Risk Level</div>
                <span className={`badge ${riskAssessment.risk_level.toLowerCase() === "low" ? "badge-green" : riskAssessment.risk_level.toLowerCase() === "medium" ? "badge-yellow" : "badge-red"}`}>
                  {riskAssessment.risk_level}
                </span>
              </div>
            )}
            {riskAssessment.flags && (riskAssessment.flags as string[]).length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6 }}>Flags</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {(riskAssessment.flags as string[]).map((f, i) => (
                    <span key={i} className="badge badge-red">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Recommendations</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recommendations.slice(0, 5).map((r, i) => {
              const rec = typeof r === "object" && r !== null ? r : { description: String(r) };
              return (
                <div key={i} className="glass-sm" style={{ padding: "12px 14px" }}>
                  {rec.title && (
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: 4 }}>{String(rec.title)}</div>
                  )}
                  {rec.description && (
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{String(rec.description)}</div>
                  )}
                  {!rec.title && !rec.description && (
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{JSON.stringify(rec)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaBadge({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}
