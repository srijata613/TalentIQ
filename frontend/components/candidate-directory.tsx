"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/icon";

type Candidate = {
  id: string;
  parsed_name?: string | null;
  parsed_email?: string | null;
  parsed_phone?: string | null;
  parsed_skills?: string[] | null;
  status?: string | null;
  created_at?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

function initials(value?: string | null) {
  const words = (value || "Candidate").trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "C";
}

function statusText(status?: string | null) {
  return (status || "uploaded").replace(/[_-]/g, " ").toLowerCase();
}

export default function CandidateDirectory({
  candidates,
}: {
  candidates?: Candidate[] | null;
}) {
  // Keep the directory resilient if a query returns null or a caller omits the list.
  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filteredCandidates = useMemo(
    () =>
      safeCandidates.filter((candidate) => {
        const skills = Array.isArray(candidate.parsed_skills)
          ? candidate.parsed_skills.join(" ")
          : "";
        const text = `${candidate.parsed_name ?? ""} ${candidate.parsed_email ?? ""} ${skills}`.toLowerCase();
        return (
          text.includes(query.trim().toLowerCase()) &&
          (status === "all" || statusText(candidate.status) === status)
        );
      }),
    [safeCandidates, query, status],
  );

  const parsedCount = safeCandidates.filter((candidate) => candidate.status === "parsed").length;
  const statusOptions = Array.from(
    new Set(safeCandidates.map((candidate) => statusText(candidate.status))),
  ).sort();

  return (
    <>
      <div className="candidate-summary-row">
        <div className="candidate-summary-metric">
          <span>Total profiles</span>
          <strong>{safeCandidates.length}</strong>
        </div>
        <div className="candidate-summary-metric">
          <span>Parsed resumes</span>
          <strong>{parsedCount}</strong>
        </div>
        <div className="candidate-summary-metric">
          <span>Awaiting analysis</span>
          <strong>{Math.max(0, safeCandidates.length - parsedCount)}</strong>
        </div>
      </div>

      <div className="list-toolbar">
        <label className="toolbar-search">
          <Icon name="search" size={16} />
          <input
            className="form-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or skill..."
            aria-label="Search candidates"
          />
        </label>
        <div className="toolbar-controls">
          <label className="filter-select-label">
            <Icon name="filter" size={14} />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="form-select"
              aria-label="Filter candidates by status"
            >
              <option value="all">All statuses</option>
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item.replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </option>
              ))}
            </select>
          </label>
          <span className="toolbar-meta">
            {filteredCandidates.length} of {safeCandidates.length} profiles
          </span>
        </div>
      </div>

      {safeCandidates.length === 0 ? (
        <div className="listing-panel content-empty-state">
          <span className="empty-state-icon"><Icon name="users" size={23} /></span>
          <h2>Your talent pool starts here</h2>
          <p>Add candidate resumes to build searchable profiles, inspect skills, and match talent to your roles.</p>
          <Link href="/candidates/upload" className="btn btn-primary">
            <Icon name="upload" size={15} /> Add candidates
          </Link>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="listing-panel content-empty-state">
          <span className="empty-state-icon"><Icon name="search" size={23} /></span>
          <h2>No matching candidates</h2>
          <p>Try another search term or status.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setQuery("");
              setStatus("all");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="listing-panel">
          <div className="dashboard-table-wrap">
            <table className="data-table candidates-data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th className="align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => {
                  const skills = Array.isArray(candidate.parsed_skills)
                    ? candidate.parsed_skills
                    : [];
                  const label = statusText(candidate.status);

                  return (
                    <tr key={candidate.id}>
                      <td>
                        <div className="candidate-cell">
                          <span className="candidate-avatar">{initials(candidate.parsed_name)}</span>
                          <span className="candidate-cell-copy">
                            <strong>{candidate.parsed_name || "Unnamed candidate"}</strong>
                            <span>{candidate.parsed_email || candidate.parsed_phone || "Contact details not parsed"}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="candidate-skill-list">
                          {skills.length ? (
                            <>
                              {skills.slice(0, 3).map((skill) => (
                                <span key={skill} className="skill-tag skill-tag-neutral">{skill}</span>
                              ))}
                              {skills.length > 3 && (
                                <span className="skill-tag skill-tag-neutral">+{skills.length - 3}</span>
                              )}
                            </>
                          ) : (
                            <span className="table-muted">Not parsed yet</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${candidate.status === "parsed" ? "badge-emerald" : "badge-gray"}`}>
                          {label}
                        </span>
                      </td>
                      <td className="table-muted">{formatDate(candidate.created_at)}</td>
                      <td>
                        <div className="action-cell">
                          <Link href={`/candidates/${candidate.id}`} className="btn btn-secondary btn-sm">
                            View profile
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
