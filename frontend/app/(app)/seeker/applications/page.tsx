
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { demoJobs } from "@/lib/demo-jobs";

type ApplicationStatus =
  | "Interested"
  | "Applied"
  | "Interviewing"
  | "Closed";

type TrackedApplication = {
  jobId: string;
  status: ApplicationStatus;
  updatedAt: string;
};

const statuses: ApplicationStatus[] = [
  "Interested",
  "Applied",
  "Interviewing",
  "Closed",
];

function isStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" &&
    statuses.includes(value as ApplicationStatus);
}

function readStringArray(key: string): string[] {
  try {
    const data = JSON.parse(localStorage.getItem(key) ?? "[]");

    return Array.isArray(data)
      ? data.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function readApplications(key: string): TrackedApplication[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!Array.isArray(data)) return [];

    return data.filter((item): item is TrackedApplication => (
      typeof item === "object" &&
      item !== null &&
      typeof item.jobId === "string" &&
      isStatus(item.status) &&
      typeof item.updatedAt === "string"
    ));
  } catch {
    return [];
  }
}

export default function ApplicationsPage() {
  const { user, isLoaded } = useUser();
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user?.id) {
      setApplications([]);
      setLoaded(true);
      return;
    }

    const applicationKey = `talentiq:applications:${user.id}`;
    const interestKey = `talentiq:job-interest:${user.id}`;

    const existing = readApplications(applicationKey);
    const existingIds = new Set(existing.map((item) => item.jobId));
    const legacyInterestIds = readStringArray(interestKey);

    // Bring previously recorded Feed interests into the tracker once.
    const imported: TrackedApplication[] = legacyInterestIds
      .filter((jobId) =>
        demoJobs.some((job) => job.id === jobId) &&
        !existingIds.has(jobId)
      )
      .map((jobId) => ({
        jobId,
        status: "Interested",
        updatedAt: new Date().toISOString(),
      }));

    const merged = [...existing, ...imported];

    setApplications(merged);

    if (imported.length > 0) {
      localStorage.setItem(applicationKey, JSON.stringify(merged));
    }

    setLoaded(true);
  }, [isLoaded, user?.id]);

  const visibleApplications = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return applications.filter((application) => {
      const job = demoJobs.find((item) => item.id === application.jobId);
      if (!job) return false;

      if (
        statusFilter !== "all" &&
        application.status !== statusFilter
      ) {
        return false;
      }

      const searchableText = [
        job.title,
        job.company,
        job.location,
        ...job.skills,
      ].join(" ").toLowerCase();

      return !normalized || searchableText.includes(normalized);
    });
  }, [applications, query, statusFilter]);

  function persistApplications(next: TrackedApplication[]) {
    setApplications(next);

    if (user?.id) {
      localStorage.setItem(
        `talentiq:applications:${user.id}`,
        JSON.stringify(next),
      );
    }
  }

  function changeStatus(jobId: string, status: ApplicationStatus) {
    const next = applications.map((application) =>
      application.jobId === jobId
        ? { ...application, status, updatedAt: new Date().toISOString() }
        : application
    );

    persistApplications(next);
  }

  function removeApplication(jobId: string) {
    persistApplications(
        applications.filter((application) => application.jobId !== jobId),
    );

    if (user?.id) {
        const interestKey = `talentiq:job-interest:${user.id}`;
        const remainingInterestIds = readStringArray(interestKey).filter(
        (id) => id !== jobId,
        );

        localStorage.setItem(
        interestKey,
        JSON.stringify(remainingInterestIds),
        );
    }
}

  if (!isLoaded || !loaded) {
    return <div className="seeker-data-loading">Loading applications…</div>;
  }

  const activeCount = applications.filter(
    (application) => application.status !== "Closed",
  ).length;

  const countFor = (status: ApplicationStatus) =>
    applications.filter((application) => application.status === status).length;

  return (
    <div className="seeker-data-page">
      <header className="seeker-data-heading">
        <span className="role-eyebrow">YOUR CAREER WORKSPACE</span>
        <h1>My <span>applications.</span></h1>
        <p>
          Track the opportunities you want to pursue and update their status
          as your job search progresses.
        </p>
      </header>

      <div className="application-disclaimer">
        <span aria-hidden="true">ⓘ</span>
        Demo tracker only. Changing a status here does not submit an application
        or contact an employer.
      </div>

      <div className="application-stat-grid">
        <div className="application-stat-card">
          <span>Total tracked</span>
          <strong>{applications.length}</strong>
        </div>
        <div className="application-stat-card">
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="application-stat-card">
          <span>Interviewing</span>
          <strong>{countFor("Interviewing")}</strong>
        </div>
        <div className="application-stat-card">
          <span>Closed</span>
          <strong>{countFor("Closed")}</strong>
        </div>
      </div>

      <div className="seeker-data-toolbar">
        <label className="seeker-data-search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search tracked applications</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search roles, companies, or skills…"
          />
        </label>

        <label className="seeker-data-select">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="seeker-data-results">
        <span>
          {visibleApplications.length} tracked{" "}
          {visibleApplications.length === 1 ? "opportunity" : "opportunities"}
        </span>
        <span>Saved in this browser</span>
      </div>

      {visibleApplications.length > 0 ? (
        <div className="application-list">
          {visibleApplications.map((application) => {
            const job = demoJobs.find(
              (item) => item.id === application.jobId,
            );

            if (!job) return null;

            return (
              <article className="application-card" key={job.id}>
                <div className="application-card-top">
                  <div className="saved-job-mark" aria-hidden="true">
                    {job.company.slice(0, 1)}
                  </div>

                  <div className="application-card-title">
                    <h2>{job.title}</h2>
                    <p>{job.company} · {job.location}</p>
                    <div className="saved-job-tags">
                      <span>{job.workMode}</span>
                      <span>{job.employmentType}</span>
                      <span>{job.compensation}</span>
                    </div>
                  </div>

                  <span
                    className={`application-status-pill application-status-${application.status.toLowerCase()}`}
                  >
                    {application.status}
                  </span>
                </div>

                <p className="application-card-summary">{job.summary}</p>

                <div className="application-card-footer">
                  <label className="application-status-control">
                    <span>Update demo status</span>
                    <select
                      value={application.status}
                      onChange={(event) => {
                        const nextStatus = event.target.value;
                        if (isStatus(nextStatus)) {
                          changeStatus(job.id, nextStatus);
                        }
                      }}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="application-card-actions">
                    <span className="application-updated">
                      Updated {new Date(application.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      className="saved-job-remove"
                      onClick={() => removeApplication(job.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="seeker-data-empty">
          <span className="seeker-data-empty-icon" aria-hidden="true">↗</span>
          <h2>
            {applications.length === 0
              ? "Your tracker starts here"
              : "No matching opportunities"}
          </h2>
          <p>
            {applications.length === 0
              ? "Choose I'm interested on a Job Feed listing to add it to this demo tracker. You can then move it through the available statuses."
              : "Try another search or status filter to find the opportunity you're looking for."}
          </p>
          <Link href="/seeker/feed" className="seeker-data-primary-link">
            Explore the Job Feed <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}
    </div>
  );
}
