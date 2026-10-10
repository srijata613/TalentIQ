import { getJob } from "@/actions/get-job";
import AnalyzeJobButton from "@/components/analyze-job-button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Job Detail" };

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { job, versions, analysis } = await getJob(id);

  if (!job) {
    return (
      <div>
        <Link href="/jobs" className="back-link">
          ← Back to Jobs
        </Link>
        <div className="glass" style={{ padding: 40, textAlign: "center", borderRadius: 12, marginTop: 16 }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#FFFFFF", marginBottom: 8 }}>Job Not Found</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>No job description matches ID: {id}</p>
          <Link href="/jobs" className="btn btn-secondary">
            Return to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const latestVersion = versions?.[0];
  const isFinished = job.status === "active" || job.status === "open";
  const badgeClass = isFinished ? "badge-emerald" : "badge-gray";

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/jobs" className="back-link">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">{job.title}</h1>
          <div style={{ marginTop: 8 }}>
            <span className={`badge ${badgeClass}`}>{job.status ?? "draft"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <AnalyzeJobButton jobId={job.id} content={latestVersion?.content ?? ""} />
          <Link href={`/jobs/${job.id}/matches`} className="btn btn-primary">
            Candidate Matches
          </Link>
        </div>
      </div>

      {/* Analysis */}
      {analysis && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16, color: "#FFFFFF" }}>Analysis Results</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Skills row */}
            {analysis.required_skills?.length > 0 && (
              <div className="glass" style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div className="section-title" style={{ marginBottom: 10 }}>Required Skills</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {analysis.required_skills.map((s: string) => (
                        <span key={s} className="skill-tag skill-tag-matched">{s}</span>
                      ))}
                    </div>
                  </div>
                  {analysis.preferred_skills?.length > 0 && (
                    <div style={{ flex: 1 }}>
                      <div className="section-title" style={{ marginBottom: 10 }}>Preferred Skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {analysis.preferred_skills.map((s: string) => (
                          <span key={s} className="skill-tag skill-tag-neutral">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Meta row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
              {analysis.seniority && (
                <InfoChip label="Seniority" value={analysis.seniority} />
              )}
              {analysis.industry && (
                <InfoChip label="Industry" value={analysis.industry} />
              )}
              {analysis.domain && (
                <InfoChip label="Domain" value={analysis.domain} />
              )}
              {analysis.experience_requirements?.length > 0 && (
                <InfoChip label="Experience" value={analysis.experience_requirements[0]} />
              )}
              {analysis.readability_score !== null && analysis.readability_score !== undefined && (
                <InfoChip label="Readability" value={`${analysis.readability_score}%`} />
              )}
            </div>

            {/* Technologies & tools */}
            {(analysis.technologies?.length > 0 || analysis.tools?.length > 0) && (
              <div className="glass" style={{ padding: 20, display: "flex", gap: 24, flexWrap: "wrap" }}>
                {analysis.technologies?.length > 0 && (
                  <div style={{ flex: 1 }}>
                    <div className="section-title" style={{ marginBottom: 8 }}>Technologies</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {analysis.technologies.map((t: string) => (
                        <span key={t} className="badge badge-brand">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.tools?.length > 0 && (
                  <div style={{ flex: 1 }}>
                    <div className="section-title" style={{ marginBottom: 8 }}>Tools</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {analysis.tools.map((t: string) => (
                        <span key={t} className="skill-tag skill-tag-neutral">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Education & Certs */}
            {(analysis.education_requirements?.length > 0 || analysis.certifications?.length > 0) && (
              <div className="glass" style={{ padding: 20, display: "flex", gap: 24, flexWrap: "wrap" }}>
                {analysis.education_requirements?.length > 0 && (
                  <div style={{ flex: 1 }}>
                    <div className="section-title" style={{ marginBottom: 8 }}>Education</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {analysis.education_requirements.map((e: string) => (
                        <span key={e} className="badge badge-indigo">{e}</span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.certifications?.length > 0 && (
                  <div style={{ flex: 1 }}>
                    <div className="section-title" style={{ marginBottom: 8 }}>Certifications</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {analysis.certifications.map((c: string) => (
                        <span key={c} className="badge badge-indigo">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Responsibilities */}
            {analysis.responsibilities?.length > 0 && (
              <div className="glass" style={{ padding: 20 }}>
                <div className="section-title" style={{ marginBottom: 10 }}>Responsibilities</div>
                <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {analysis.responsibilities.map((r: string, i: number) => (
                    <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {!analysis && (
        <div className="glass" style={{ padding: 20, borderRadius: 12, marginBottom: 28, borderLeft: "4px solid #FF6129" }}>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            <strong style={{ color: "#FFFFFF" }}>Analysis Pending:</strong> Click &quot;Analyze Job&quot; above to extract structured skills and requirements.
          </div>
        </div>
      )}

      {/* Version History */}
      {versions.length > 0 && (
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 16, color: "#FFFFFF" }}>Job Description Text</h2>
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                Version {latestVersion?.version_number ?? 1}
              </span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                {latestVersion?.created_at && new Date(latestVersion.created_at).toLocaleDateString()}
              </span>
            </div>
            <pre
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: 400,
                overflow: "auto",
                margin: 0,
                fontFamily: "inherit",
                lineHeight: 1.6,
              }}
            >
              {latestVersion?.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-sm" style={{ padding: "12px 14px" }}>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#FFFFFF" }}>{value}</div>
    </div>
  );
}
