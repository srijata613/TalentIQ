"use client";

import { useState } from "react";
import api, { ParsedResume, ApiError } from "@/lib/api";

const DEMO_RESUME = `John Smith
john.smith@email.com | +1-555-0123 | linkedin.com/in/johnsmith | github.com/johnsmith

SUMMARY
Senior Software Engineer with 6 years of experience building scalable backend systems and ML pipelines.

SKILLS
Python, FastAPI, React, TypeScript, PostgreSQL, Redis, Docker, Kubernetes, AWS, TensorFlow, PyTorch

EXPERIENCE
Senior Software Engineer — Google (2021–Present)
- Led development of ML inference pipeline serving 50M requests/day
- Reduced model latency by 40% through quantization and caching

Software Engineer — Infosys (2019–2021)
- Built REST APIs for enterprise clients using Python and Django

EDUCATION
B.Tech Computer Science — IIT Delhi, 2019 | CGPA: 8.7

CERTIFICATIONS
AWS Solutions Architect Professional
Google Cloud Professional Data Engineer`;

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    const text = resumeText.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.parseResume(text);
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

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === "application/pdf") {
      setError("PDF parsing is available via the Candidate Upload workflow (/candidates/upload). Please paste the resume text here.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setResumeText(ev.target?.result as string);
    reader.readAsText(file);
  }

  return (
    <div style={{ padding: "40px 32px", maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>Resume Analyzer</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Paste resume text to extract identity, skills, experience, education, and more.
        </p>
      </div>

      {/* Input section */}
      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
            📎 Upload .txt file
            <input type="file" accept=".txt,.text" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setResumeText(DEMO_RESUME)}
          >
            Load Demo Resume
          </button>
          {resumeText && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setResumeText(""); setResult(null); setError(null); }}>
              Clear
            </button>
          )}
        </div>

        <label className="form-label">Resume Text</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: 280, fontFamily: "monospace", fontSize: "0.8125rem" }}
          placeholder="Paste resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />

        <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={loading || !resumeText.trim()}
            id="analyze-resume-btn"
          >
            {loading ? (
              <>
                <div className="spinner" />
                Analyzing...
              </>
            ) : (
              "Analyze Resume"
            )}
          </button>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            {resumeText.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>⚠️</span>
          <div>{error}</div>
        </div>
      )}

      {/* Results */}
      {result && <ParsedResumeView data={result} />}
    </div>
  );
}

function ParsedResumeView({ data }: { data: ParsedResume }) {
  const identity = data.identity ?? {};
  const skills = data.skills ?? data.parsed_skills ?? [];
  const inferred = data.inferred_skills ?? [];
  const expYears = data.experience_years ?? data.experience?.total_years;
  const degrees = data.education?.degrees ?? [];
  const gradYears = data.education?.graduation_years ?? [];
  const institutions = data.education?.institutions ?? [];
  const designations = data.experience?.designations ?? [];
  const companies = data.experience?.companies ?? [];
  const projects = data.projects ?? [];
  const certifications = data.certifications ?? [];
  const achievements = data.achievements ?? [];
  const publications = data.publications ?? [];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Identity */}
      <div className="glass" style={{ padding: 24 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Identity</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {identity.name && (
            <Field label="Name" value={identity.name} />
          )}
          {identity.email && (
            <Field label="Email" value={identity.email} />
          )}
          {identity.phone && (
            <Field label="Phone" value={identity.phone} />
          )}
          {expYears !== undefined && expYears !== null && (
            <Field label="Experience" value={`${expYears} year${Number(expYears) !== 1 ? "s" : ""}`} />
          )}
          {identity.linkedin && (
            <Field label="LinkedIn" value={<a href={identity.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand-400)" }}>{identity.linkedin}</a>} />
          )}
          {identity.github && (
            <Field label="GitHub" value={<a href={identity.github} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand-400)" }}>{identity.github}</a>} />
          )}
          {identity.portfolio && (
            <Field label="Portfolio" value={<a href={identity.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand-400)" }}>{identity.portfolio}</a>} />
          )}
        </div>
        {data.summary && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Summary</div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{data.summary}</p>
          </div>
        )}
      </div>

      {/* Skills */}
      {(skills.length > 0 || inferred.length > 0) && (
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Skills</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {skills.map((s) => (
              <span key={s} className="skill-tag skill-tag-matched">{s}</span>
            ))}
          </div>
          {inferred.length > 0 && (
            <>
              <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)", margin: "12px 0 6px" }}>
                Inferred Skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {inferred.map((s) => (
                  <span key={String(s)} className="skill-tag skill-tag-neutral">{String(s)}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Experience */}
      {(designations.length > 0 || companies.length > 0) && (
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Experience</div>
          {designations.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Roles</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {designations.map((d) => <span key={String(d)} className="skill-tag skill-tag-neutral">{String(d)}</span>)}
              </div>
            </div>
          )}
          {companies.length > 0 && (
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Companies</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {companies.map((c) => <span key={String(c)} className="badge badge-indigo">{String(c)}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Education */}
      {(degrees.length > 0 || institutions.length > 0) && (
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Education</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: degrees.length > 0 && institutions.length > 0 ? 10 : 0 }}>
            {degrees.map((d) => <span key={String(d)} className="badge badge-blue">{String(d)}</span>)}
          </div>
          {institutions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {institutions.map((i) => <span key={String(i)} className="skill-tag skill-tag-neutral">{String(i)}</span>)}
            </div>
          )}
          {gradYears.length > 0 && (
            <div style={{ marginTop: 8, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Graduation: {gradYears.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Projects</div>
          <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
            {projects.slice(0, 8).map((p, i) => (
              <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{String(p)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Certifications & Achievements */}
      {(certifications.length > 0 || achievements.length > 0 || publications.length > 0) && (
        <div className="glass" style={{ padding: 24 }}>
          {certifications.length > 0 && (
            <>
              <div className="section-title" style={{ marginBottom: 8 }}>Certifications</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {certifications.map((c) => <span key={String(c)} className="badge badge-purple">{String(c)}</span>)}
              </div>
            </>
          )}
          {achievements.length > 0 && (
            <>
              <div className="section-title" style={{ marginBottom: 8 }}>Achievements</div>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {achievements.map((a, i) => (
                  <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 4 }}>{String(a)}</li>
                ))}
              </ul>
            </>
          )}
          {publications.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 16, marginBottom: 8 }}>Publications</div>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {publications.map((p, i) => (
                  <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 4 }}>{String(p)}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Behavioral signals */}
      {data.behavioral_signals && Object.keys(data.behavioral_signals).length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Behavioral Signals</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(data.behavioral_signals).map(([key, val]) => (
              <div key={key} className="glass-sm" style={{ padding: "8px 12px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 2 }}>{key.replace(/_/g, " ")}</div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{String(val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scores */}
      {(data.adaptability_score !== undefined || data.growth_score !== undefined) && (
        <div className="glass" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Derived Scores</div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {data.adaptability_score !== undefined && (
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>Adaptability</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#6366f1" }}>
                  {typeof data.adaptability_score === "number" ? data.adaptability_score.toFixed(1) : data.adaptability_score}
                </div>
              </div>
            )}
            {data.growth_score !== undefined && (
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>Growth</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10b981" }}>
                  {typeof data.growth_score === "number" ? data.growth_score.toFixed(1) : data.growth_score}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}
