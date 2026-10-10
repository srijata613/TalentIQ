import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Candidates" };

export default async function CandidatesPage() {
  const supabase = createSupabaseServerClient();
  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Candidates</h1>
          <p className="page-subtitle">View and manage uploaded candidate resumes in your talent pool</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/candidates/upload" className="btn btn-primary">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Resume
          </Link>
          <Link href="/analyze/resume" className="btn btn-secondary">
            AI Resume Analyzer
          </Link>
        </div>
      </div>

      {(!candidates || candidates.length === 0) ? (
        <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: 12 }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 8, color: "#FFFFFF" }}>No candidates yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 20 }}>
            Upload a candidate resume or parse one with the AI Resume Analyzer to get started.
          </p>
          <Link href="/candidates/upload" className="btn btn-primary">
            Upload Candidate Resume
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {candidates.map((c) => (
            <div key={c.id} className="glass" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <h3 style={{ fontWeight: 600, fontSize: "1rem", color: "#FFFFFF" }}>
                    {c.parsed_name || "Unnamed Candidate"}
                  </h3>
                  <span className={`badge ${c.status === "parsed" ? "badge-emerald" : "badge-gray"}`}>
                    {c.status || "uploaded"}
                  </span>
                </div>
                {c.parsed_email && (
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: 4 }}>
                    Email: {c.parsed_email}
                  </div>
                )}
                {c.parsed_phone && (
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                    Phone: {c.parsed_phone}
                  </div>
                )}
                {c.parsed_skills && c.parsed_skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12 }}>
                    {c.parsed_skills.slice(0, 5).map((s: string) => (
                      <span key={s} className="skill-tag skill-tag-matched">{s}</span>
                    ))}
                    {c.parsed_skills.length > 5 && (
                      <span className="skill-tag skill-tag-neutral">+{c.parsed_skills.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Link href={`/candidates/${c.id}`} className="btn btn-secondary btn-sm">
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
