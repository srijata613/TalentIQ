"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/icon";

type Job = { id: string; title?: string | null; status?: string | null; created_at?: string | null; updated_at?: string | null };

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
function statusText(status?: string | null) { return (status || "draft").replace(/[_-]/g, " ").toLowerCase(); }

export default function JobsDirectory({ jobs }: { jobs: Job[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const text = `${job.title ?? ""} ${job.status ?? ""}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (status === "all" || statusText(job.status) === status);
  }), [jobs, query, status]);
  const statusOptions = Array.from(new Set(jobs.map((job) => statusText(job.status)))).sort();

  return (
    <>
      <div className="list-toolbar">
        <label className="toolbar-search">
          <Icon name="search" size={16} />
          <input className="form-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search job titles..." aria-label="Search jobs" />
        </label>
        <div className="toolbar-controls">
          <label className="filter-select-label"><Icon name="filter" size={14} /><select value={status} onChange={(event) => setStatus(event.target.value)} className="form-select" aria-label="Filter jobs by status"><option value="all">All statuses</option>{statusOptions.map((item) => <option key={item} value={item}>{item.replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}</select></label>
          <span className="toolbar-meta">{filteredJobs.length} of {jobs.length} roles</span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="listing-panel content-empty-state">
          <span className="empty-state-icon"><Icon name="briefcase" size={23} /></span>
          <h2>No jobs yet</h2>
          <p>Create your first job description to structure the requirements and start matching candidates to the role.</p>
          <Link href="/jobs/new" className="btn btn-primary"><Icon name="plus" size={15} /> Create your first job</Link>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="listing-panel content-empty-state">
          <span className="empty-state-icon"><Icon name="search" size={23} /></span>
          <h2>No matching jobs</h2>
          <p>Try another title or status filter.</p>
          <button type="button" className="btn btn-secondary" onClick={() => { setQuery(""); setStatus("all"); }}>Clear filters</button>
        </div>
      ) : (
        <div className="listing-panel">
          <div className="dashboard-table-wrap">
            <table className="data-table jobs-data-table">
              <thead><tr><th>Role</th><th>Status</th><th>Created</th><th>Last updated</th><th className="align-right">Actions</th></tr></thead>
              <tbody>{filteredJobs.map((job) => {
                const label = statusText(job.status);
                return <tr key={job.id}>
                  <td><Link href={`/jobs/${job.id}`} className="listing-row-title">{job.title || "Untitled role"}</Link><span className="table-meta">ID · {job.id.slice(0, 8)}</span></td>
                  <td><span className={`inline-status status-${label.replace(/\s+/g, "-")}`}>{label}</span></td>
                  <td className="table-muted">{formatDate(job.created_at)}</td>
                  <td className="table-muted">{formatDate(job.updated_at || job.created_at)}</td>
                  <td><div className="action-cell"><Link href={`/jobs/${job.id}`} className="btn btn-secondary btn-sm">Open job</Link><Link href={`/jobs/${job.id}/matches`} className="btn btn-primary btn-sm">Matches</Link></div></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
