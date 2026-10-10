"use client";

import { useState } from "react";
import api, { JobAnalysisResponse, ApiError } from "@/lib/api";

const DEMO_JD = `Senior Machine Learning Engineer

About the Role:
We're looking for a Senior ML Engineer to join our AI Platform team. You'll design and deploy ML systems that power our core product.

Requirements:
- 5+ years of experience in machine learning or data science
- Expert-level Python programming
- Deep knowledge of PyTorch or TensorFlow
- Experience with MLOps tools (MLflow, Kubeflow, Airflow)
- Familiarity with cloud platforms (AWS, GCP, or Azure)
- Experience with containerization (Docker, Kubernetes)
- Strong understanding of statistical modeling and experimentation

Preferred Qualifications:
- PhD in Computer Science, Statistics, or related field
- Experience with large language models and transformer architectures
- AWS Certified Machine Learning Specialty certification
- Experience with distributed training frameworks

Responsibilities:
- Design and implement scalable ML training and inference pipelines
- Collaborate with research teams to productionize models
- Mentor junior engineers and drive technical roadmap
- Ensure model quality through rigorous evaluation frameworks

Education:
- Bachelor's degree in Computer Science, Engineering, or equivalent`;

export default function JobAnalyzerPage() {
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [result, setResult] = useState<JobAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    const text = content.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.analyzeJob(text);
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

  async function handleImportUrl() {
    if (!url.trim()) return;
    setUrlLoading(true);
    setError(null);
    try {
      const data = await api.importJobUrl(url.trim());
      if (data.error) {
        setError(data.error);
      } else if (data.content) {
        setContent(data.content);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError(`Import failed (${e.status}): ${e.message}`);
      } else {
        setError("Failed to import URL.");
      }
    } finally {
      setUrlLoading(false);
    }
  }

  return (
    <div style={{ padding: "40px 32px", maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>Job Description Analyzer</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Extract skills, requirements, seniority, technologies, and more from any job description.
        </p>
      </div>

      {/* URL import */}
      <div className="glass" style={{ padding: 20, marginBottom: 16 }}>
        <label className="form-label">Import from URL</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="form-input"
            type="url"
            placeholder="https://company.com/careers/role"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleImportUrl()}
          />
          <button
            className="btn btn-secondary"
            onClick={handleImportUrl}
            disabled={urlLoading || !url.trim()}
            style={{ whiteSpace: "nowrap" }}
          >
            {urlLoading ? <><div className="spinner" /> Fetching…</> : "Import"}
          </button>
        </div>
      </div>

      {/* Text input */}
      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ marginBottom: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setContent(DEMO_JD)}>
            Load Demo JD
          </button>
          {content && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setContent(""); setResult(null); setError(null); }}>
              Clear
            </button>
          )}
        </div>

        <label className="form-label">Job Description Text</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: 280, fontSize: "0.875rem" }}
          placeholder="Paste job description here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div style={{ marginTop: 16 }}>
          <button
            id="analyze-jd-btn"
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={loading || !content.trim()}
          >
            {loading ? <><div className="spinner" /> Analyzing…</> : "Analyze Job Description"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>⚠️</span>
          <div>{error}</div>
        </div>
      )}

      {result && <JobAnalysisView data={result} />}
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((item) => (
        <span key={item} className="skill-tag skill-tag-neutral">{item}</span>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="section-title" style={{ marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function JobAnalysisView({ data }: { data: JobAnalysisResponse }) {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Overview row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {data.seniority && (
          <InfoCard label="Seniority" value={data.seniority} icon="👤" />
        )}
        {data.industry && (
          <InfoCard label="Industry" value={data.industry} icon="🏭" />
        )}
        {data.domain && (
          <InfoCard label="Domain" value={data.domain} icon="📊" />
        )}
        {data.experience && (
          <InfoCard label="Experience Required" value={data.experience} icon="📅" />
        )}
        {data.readability_score !== null && data.readability_score !== undefined && (
          <InfoCard label="Readability Score" value={`${data.readability_score}%`} icon="📖" />
        )}
        {data.salary_benchmark && Object.keys(data.salary_benchmark).length > 0 && (
          <InfoCard
            label="Salary Benchmark"
            value={data.salary_benchmark.range as string ?? JSON.stringify(data.salary_benchmark)}
            icon="💰"
          />
        )}
      </div>

      <div className="glass" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {data.required_skills?.length > 0 && (
          <Section title="Required Skills">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.required_skills.map((s) => (
                <span key={s} className="skill-tag skill-tag-matched">{s}</span>
              ))}
            </div>
          </Section>
        )}

        {data.must_have?.length > 0 && (
          <Section title="Must Have">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.must_have.map((s) => (
                <span key={s} className="badge badge-red">{s}</span>
              ))}
            </div>
          </Section>
        )}

        {data.preferred_skills?.length > 0 && (
          <Section title="Preferred Skills">
            <TagList items={data.preferred_skills} />
          </Section>
        )}

        {data.nice_to_have?.length > 0 && (
          <Section title="Nice to Have">
            <TagList items={data.nice_to_have} />
          </Section>
        )}

        {data.technologies?.length > 0 && (
          <Section title="Technologies">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.technologies.map((t) => (
                <span key={t} className="badge badge-blue">{t}</span>
              ))}
            </div>
          </Section>
        )}

        {data.tools?.length > 0 && (
          <Section title="Tools">
            <TagList items={data.tools} />
          </Section>
        )}

        {data.soft_skills?.length > 0 && (
          <Section title="Soft Skills">
            <TagList items={data.soft_skills} />
          </Section>
        )}
      </div>

      {(data.education?.length > 0 || data.certifications?.length > 0) && (
        <div className="glass" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {data.education?.length > 0 && (
            <Section title="Education Requirements">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.education.map((e) => (
                  <span key={e} className="badge badge-purple">{e}</span>
                ))}
              </div>
            </Section>
          )}
          {data.certifications?.length > 0 && (
            <Section title="Certifications">
              <TagList items={data.certifications} />
            </Section>
          )}
        </div>
      )}

      {data.responsibilities?.length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <Section title="Responsibilities">
            <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
              {data.responsibilities.map((r, i) => (
                <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{r}</li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {(data.hidden_requirements?.length > 0 || data.missing_requirements?.length > 0 || data.skill_gaps?.length > 0) && (
        <div className="glass" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="section-title">Insights</div>
          {data.hidden_requirements?.length > 0 && (
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--warning)", marginBottom: 6 }}>⚠️ Hidden Requirements</div>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {data.hidden_requirements.map((r, i) => (
                  <li key={i} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: 4 }}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {data.missing_requirements?.length > 0 && (
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--danger)", marginBottom: 6 }}>❌ Missing Requirements</div>
              <TagList items={data.missing_requirements} />
            </div>
          )}
          {data.skill_gaps?.length > 0 && (
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>🔍 Skill Gaps Detected</div>
              <TagList items={data.skill_gaps} />
            </div>
          )}
        </div>
      )}

      {data.keywords?.length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <Section title="Keywords">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {data.keywords.slice(0, 30).map((k) => (
                <span key={k} className="badge badge-gray">{k}</span>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="glass-sm" style={{ padding: "12px 16px" }}>
      <div style={{ fontSize: "1.25rem", marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{value}</div>
    </div>
  );
}
