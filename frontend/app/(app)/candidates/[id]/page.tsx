import { createSupabaseServerClient } from "@/lib/supabase-server";
import AnalyzeCandidateButton from "@/components/analyze-candidate-button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Candidate Detail" };

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single();

  if (!candidate) {
    return (
      <div>
        <Link href="/candidates" className="back-link">
          ← Back to Candidates
        </Link>
        <div className="glass" style={{ padding: 40, textAlign: "center", borderRadius: 12, marginTop: 16 }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#FFFFFF", marginBottom: 8 }}>Candidate Not Found</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>No candidate matches ID: {id}</p>
          <Link href="/candidates" className="btn btn-secondary">
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/candidates" className="back-link">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Candidates
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">
            {candidate.parsed_name || "Candidate Profile"}
          </h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
            <span className={`badge ${candidate.status === "parsed" ? "badge-emerald" : "badge-gray"}`}>
              Status: {candidate.status || "uploaded"}
            </span>
            {candidate.parsed_email && (
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                {candidate.parsed_email}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <AnalyzeCandidateButton candidateId={id} />
          <Link href={`/match`} className="btn btn-primary">
            Match Against Job
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        {/* Main Info */}
        <div className="glass" style={{ padding: 24, borderRadius: 12 }}>
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "#FFFFFF", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            Candidate Overview
          </h3>

          {/* Contact details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Email</div>
              <div style={{ fontWeight: 500, color: "#FFFFFF", marginTop: 2 }}>{candidate.parsed_email || "Not provided"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Phone</div>
              <div style={{ fontWeight: 500, color: "#FFFFFF", marginTop: 2 }}>{candidate.parsed_phone || "Not provided"}</div>
            </div>
          </div>

          {/* Social Links */}
          {(candidate.parsed_linkedin || candidate.parsed_github || candidate.parsed_portfolio) && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Links</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {candidate.parsed_linkedin && (
                  <a href={candidate.parsed_linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    LinkedIn ↗
                  </a>
                )}
                {candidate.parsed_github && (
                  <a href={candidate.parsed_github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    GitHub ↗
                  </a>
                )}
                {candidate.parsed_portfolio && (
                  <a href={candidate.parsed_portfolio} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    Portfolio ↗
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 10, color: "var(--text-secondary)" }}>
              Parsed Skills ({candidate.parsed_skills?.length || 0})
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(candidate.parsed_skills || []).map((skill: string) => (
                <span key={skill} className="skill-tag skill-tag-matched">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Degrees */}
          {candidate.parsed_degrees?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 10, color: "var(--text-secondary)" }}>
                Education / Degrees
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {candidate.parsed_degrees.map((degree: string) => (
                  <span key={degree} className="badge badge-indigo">
                    {degree}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Designations */}
          {candidate.parsed_designations?.length > 0 && (
            <div>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 10, color: "var(--text-secondary)" }}>
                Prior Roles & Designations
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {candidate.parsed_designations.map((d: string) => (
                  <span key={d} className="badge badge-indigo">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div>
          <div className="glass" style={{ padding: 20, borderRadius: 12 }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 12, color: "#FFFFFF" }}>Metadata</h4>
            <div style={{ fontSize: "0.8125rem", display: "flex", flexDirection: "column", gap: 10, color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>ID:</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#FFFFFF" }}>{candidate.id.slice(0, 8)}...</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Added:</span>
                <span style={{ color: "#FFFFFF" }}>{new Date(candidate.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
