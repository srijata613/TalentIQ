import Link from "next/link";
import { getJobs } from "@/actions/get-jobs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Jobs" };

export default async function JobsPage() {
  const jobs = (await getJobs()) as Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Job Descriptions</h1>
          <p className="page-subtitle">
            Manage and analyze your active job postings and candidate pipelines.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/jobs/upload" className="btn btn-secondary">
            Upload Job PDF
          </Link>
          <Link href="/jobs/new" className="btn btn-primary">
            + New Job
          </Link>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div
          className="glass"
          style={{ padding: "56px 24px", textAlign: "center", borderRadius: 12 }}
        >
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 8, color: "#FFFFFF" }}>No jobs yet</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.875rem", maxWidth: 440, margin: "0 auto 24px" }}>
            Create your first job description or upload a spec document to start matching candidates.
          </p>
          <Link href="/jobs/new" className="btn btn-primary">
            Create First Job
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {jobs.map((job) => {
            const isFinished = job.status === "active" || job.status === "open";
            const badgeClass = isFinished ? "badge-emerald" : "badge-gray";

            return (
              <div key={job.id} className="glass" style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <Link
                      href={`/jobs/${job.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <h2
                        style={{
                          fontSize: "1.0625rem",
                          fontWeight: 600,
                          color: "#FFFFFF",
                          marginBottom: 6,
                        }}
                      >
                        {job.title}
                      </h2>
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className={`badge ${badgeClass}`}>{job.status ?? "draft"}</span>
                      {job.created_at && (
                        <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                          Created {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/jobs/${job.id}`} className="btn btn-secondary btn-sm">
                      View Job
                    </Link>
                    <Link href={`/jobs/${job.id}/matches`} className="btn btn-primary btn-sm">
                      Candidate Matches
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
