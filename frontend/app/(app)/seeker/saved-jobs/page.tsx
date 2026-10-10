
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { demoJobs } from "@/lib/demo-jobs";

function readSavedIds(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default function SavedJobsPage() {
  const { user, isLoaded } = useUser();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [workMode, setWorkMode] = useState("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user?.id) {
      setSavedIds([]);
      setLoaded(true);
      return;
    }

    setSavedIds(
      readSavedIds(`talentiq:saved-jobs:${user.id}`),
    );
    setLoaded(true);
  }, [isLoaded, user?.id]);

  const savedJobs = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return demoJobs.filter((job) => {
      if (!savedIds.includes(job.id)) return false;
      if (workMode !== "all" && job.workMode !== workMode) return false;

      const searchText = [
        job.title,
        job.company,
        job.location,
        job.summary,
        ...job.skills,
      ].join(" ").toLowerCase();

      return !normalized || searchText.includes(normalized);
    });
  }, [savedIds, query, workMode]);

  function removeSavedJob(jobId: string) {
    if (!user?.id) return;

    const next = savedIds.filter((id) => id !== jobId);
    setSavedIds(next);

    localStorage.setItem(
      `talentiq:saved-jobs:${user.id}`,
      JSON.stringify(next),
    );
  }

  if (!isLoaded || !loaded) {
    return <div className="seeker-data-loading">Loading saved jobs…</div>;
  }

  return (
    <div className="seeker-data-page">
      <header className="seeker-data-heading">
        <span className="role-eyebrow">YOUR CAREER WORKSPACE</span>
        <h1>Saved <span>jobs.</span></h1>
        <p>
          Keep the opportunities worth revisiting in one place.
        </p>
      </header>

      <div className="seeker-data-toolbar">
        <label className="seeker-data-search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search saved jobs</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search saved roles, companies, or skills…"
          />
        </label>

        <label className="seeker-data-select">
          <span>Work mode</span>
          <select
            value={workMode}
            onChange={(event) => setWorkMode(event.target.value)}
          >
            <option value="all">All modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </label>
      </div>

      <div className="seeker-data-results">
        <span>{savedJobs.length} saved {savedJobs.length === 1 ? "job" : "jobs"}</span>
        <span>Sample listings · Browser-local data</span>
      </div>

      {savedJobs.length > 0 ? (
        <div className="saved-job-list">
          {savedJobs.map((job) => (
            <article className="saved-job-card" key={job.id}>
              <div className="saved-job-card-main">
                <div className="saved-job-mark" aria-hidden="true">
                  {job.company.slice(0, 1)}
                </div>

                <div className="saved-job-content">
                  <h2>{job.title}</h2>
                  <p>{job.company} · {job.location}</p>
                  <div className="saved-job-tags">
                    <span>{job.workMode}</span>
                    <span>{job.employmentType}</span>
                    <span>{job.experience}</span>
                  </div>
                  <strong>{job.compensation}</strong>
                  <p className="saved-job-summary">{job.summary}</p>
                </div>
              </div>

              <div className="saved-job-actions">
                <button
                  type="button"
                  className="saved-job-remove"
                  onClick={() => removeSavedJob(job.id)}
                >
                  Remove bookmark
                </button>

                <Link href="/seeker/feed" className="saved-job-explore">
                  Back to feed <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="seeker-data-empty">
          <span className="seeker-data-empty-icon" aria-hidden="true">♡</span>
          <h2>No saved jobs here yet</h2>
          <p>
            Bookmark an opportunity in the Job Feed and it will show up here.
            Your saved demo listings stay in this browser.
          </p>
          <Link href="/seeker/feed" className="seeker-data-primary-link">
            Explore the Job Feed <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}
    </div>
  );
}
