"use client";

import { useState } from "react";
import api, { ApiError } from "@/lib/api";

const DEMO_CANDIDATES = [
  {
    name: "Alice Chen",
    parsed_skills: ["Python", "PyTorch", "TensorFlow", "MLflow", "AWS", "Kubernetes"],
    experience_years: 7,
    certifications: ["AWS ML Specialty"],
    domain: "machine-learning",
    final_score: 88,
  },
  {
    name: "Bob Kumar",
    parsed_skills: ["Python", "SQL", "pandas", "scikit-learn"],
    experience_years: 3,
    certifications: [],
    domain: "data-analysis",
    final_score: 45,
  },
  {
    name: "Sara Martinez",
    parsed_skills: ["Python", "PyTorch", "MLflow", "Docker", "AWS", "Airflow"],
    experience_years: 5,
    certifications: ["AWS ML Specialty"],
    domain: "machine-learning",
    final_score: 76,
  },
];

export default function SearchPage() {
  const [skills, setSkills] = useState("");
  const [domain, setDomain] = useState("");
  const [minExp, setMinExp] = useState(0);
  const [certification, setCertification] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const skillsList = skills.split(",").map((s) => s.trim()).filter(Boolean);
      const data = await api.searchCandidates({
        candidates: DEMO_CANDIDATES,
        skills: skillsList.length > 0 ? skillsList : [],
        domain: domain || null,
        min_experience: minExp,
        certification: certification || null,
        min_score: minScore,
      });
      const arr = Array.isArray(data) ? data : (data as { results?: unknown[] }).results ?? (data as unknown as unknown[]);
      setResults(Array.isArray(arr) ? arr : [arr]);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(`Backend error (${e.status}): ${e.message}`);
      } else {
        setError("Unable to reach the backend service.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Candidate Search</h1>
        <p className="page-subtitle">
          Filter candidates by skills, domain, experience, and match score.
        </p>
      </div>

      {/* Filters Form */}
      <div className="glass" style={{ padding: 24, marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
          <div>
            <label className="form-label">Skills (comma-separated)</label>
            <input
              className="form-input"
              placeholder="Python, PyTorch, AWS"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Domain</label>
            <input
              className="form-input"
              placeholder="machine-learning"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Min Experience (years)</label>
            <input
              className="form-input"
              type="number"
              min={0}
              max={30}
              value={minExp}
              onChange={(e) => setMinExp(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label">Certification Contains</label>
            <input
              className="form-input"
              placeholder="AWS"
              value={certification}
              onChange={(e) => setCertification(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Min Score (0–100)</label>
            <input
              className="form-input"
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            id="search-candidates-btn"
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching Candidates..." : "Search Candidates"}
          </button>
        </div>
      </div>

      {error && (
        <div className="glass" style={{ padding: 16, borderRadius: 12, marginBottom: 24, borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: "0.875rem", color: "#ef4444" }}>{error}</div>
        </div>
      )}

      {results !== null && (
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 14, color: "#FFFFFF" }}>
            Search Results ({results.length} candidate{results.length !== 1 ? "s" : ""})
          </h2>

          {results.length === 0 ? (
            <div className="glass" style={{ padding: 40, textAlign: "center", color: "#A1A1AA", borderRadius: 12 }}>
              No candidates matched your filter criteria.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {results.map((c, i) => {
                const candidate = c as Record<string, unknown>;
                const name = candidate.name as string ?? candidate.parsed_name as string ?? `Candidate ${i + 1}`;
                const candidateSkills = candidate.parsed_skills as string[] ?? candidate.skills as string[] ?? [];
                const expYears = candidate.experience_years as number;
                const certs = candidate.certifications as string[] ?? [];
                const score = candidate.final_score as number ?? candidate.overall_score as number;

                return (
                  <div key={i} className="glass" style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "1rem", color: "#FFFFFF", marginBottom: 6 }}>{name}</div>
                        {Boolean(candidate.domain) && (
                          <span className="badge badge-indigo" style={{ marginBottom: 8 }}>{String(candidate.domain)}</span>
                        )}
                        {expYears !== undefined && (
                          <div style={{ fontSize: "0.8125rem", color: "#A1A1AA", marginBottom: 8 }}>
                            {expYears} year{expYears !== 1 ? "s" : ""} experience
                          </div>
                        )}
                        {candidateSkills.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {candidateSkills.slice(0, 6).map((s) => (
                              <span key={s} className="skill-tag skill-tag-matched">{s}</span>
                            ))}
                            {candidateSkills.length > 6 && (
                              <span className="skill-tag skill-tag-neutral">+{candidateSkills.length - 6}</span>
                            )}
                          </div>
                        )}
                        {certs.length > 0 && (
                          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {certs.map((cert) => (
                              <span key={cert} className="badge badge-indigo">{cert}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {score !== undefined && (
                        <div style={{ textAlign: "center", minWidth: 60 }}>
                          <div
                            style={{
                              fontSize: "1.5rem",
                              fontWeight: 700,
                              color: score >= 80 ? "#10b981" : score >= 60 ? "#FF6129" : "#ef4444",
                            }}
                          >
                            {Math.round(score)}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#A1A1AA" }}>fit score</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
