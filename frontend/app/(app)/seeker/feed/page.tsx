"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  careerTips,
  demoJobs,
  type DemoJob,
  type WorkMode,
} from "@/lib/demo-jobs";

type FeedTab = "for-you" | "all" | "saved";

function readStoredIds(key: string): string[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function BriefcaseMark() {
  return (
    <span className="job-card-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
      </svg>
    </span>
  );
}

function JobCard({
  job,
  isSaved,
  hasExpressedInterest,
  onToggleSave,
  onExpressInterest,
}: {
  job: DemoJob;
  isSaved: boolean;
  hasExpressedInterest: boolean;
  onToggleSave: () => void;
  onExpressInterest: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="job-feed-card">
      <div className="job-feed-card-top">
        <BriefcaseMark />

        <div className="job-feed-title-block">
          {job.recommended && (
            <span className="job-recommended-label">
              Recommended · Demo
            </span>
          )}
          <h3>{job.title}</h3>
          <p className="job-feed-company">
            {job.company}
            <span aria-hidden="true"> · </span>
            {job.location}
          </p>
        </div>

        <button
          type="button"
          className={`job-save-button${isSaved ? " is-saved" : ""}`}
          onClick={onToggleSave}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Unsave ${job.title}` : `Save ${job.title}`}
          title={isSaved ? "Remove bookmark" : "Save job"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4V4.75Z" />
          </svg>
        </button>
      </div>

      <div className="job-feed-meta">
        <span>{job.workMode}</span>
        <span>{job.employmentType}</span>
        <span>{job.experience}</span>
      </div>

      <div className="job-feed-compensation">{job.compensation}</div>

      <p className="job-feed-summary">
        {expanded
          ? job.summary
          : `${job.summary.slice(0, 135)}${job.summary.length > 135 ? "…" : ""}`}
      </p>

      <div className="job-feed-skills">
        {job.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      {job.recommendationReason && (
        <p className="job-feed-recommendation-reason">
          <span aria-hidden="true">✦</span>
          {job.recommendationReason}
        </p>
      )}

      <div className="job-feed-card-footer">
        <span className="job-feed-posted">{job.postedLabel}</span>

        <div className="job-feed-card-actions">
          <button
            type="button"
            className="job-text-button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "View details"}
          </button>

          <button
            type="button"
            className={`job-interest-button${hasExpressedInterest ? " is-recorded" : ""}`}
            onClick={onExpressInterest}
            disabled={hasExpressedInterest}
          >
            {hasExpressedInterest ? "Interest recorded" : "I'm interested"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function JobFeedPage() {
  const { user, isLoaded } = useUser();

  const [activeTab, setActiveTab] = useState<FeedTab>("for-you");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [workMode, setWorkMode] = useState("all");
  const [employmentType, setEmploymentType] = useState("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [notice, setNotice] = useState("");

  const savedStorageKey = user?.id
    ? `talentiq:saved-jobs:${user.id}`
    : null;

  const interestStorageKey = user?.id
    ? `talentiq:job-interest:${user.id}`
    : null;

  useEffect(() => {
    if (!isLoaded) return;

    if (!user?.id) {
      setSavedIds([]);
      setInterestedIds([]);
      setStorageLoaded(true);
      return;
    }

    setStorageLoaded(false);

    const savedKey = `talentiq:saved-jobs:${user.id}`;
    const interestKey = `talentiq:job-interest:${user.id}`;

    setSavedIds(readStoredIds(savedKey));
    setInterestedIds(readStoredIds(interestKey));
    setStorageLoaded(true);
  }, [isLoaded, user?.id]);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return demoJobs.filter((job) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "for-you" && job.recommended) ||
        (activeTab === "saved" && savedIds.includes(job.id));

      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.summary,
        ...job.skills,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      const matchesLocation =
        location === "all" || job.location === location;

      const matchesWorkMode =
        workMode === "all" || job.workMode === workMode;

      const matchesEmployment =
        employmentType === "all" || job.employmentType === employmentType;

      return (
        matchesTab &&
        matchesQuery &&
        matchesLocation &&
        matchesWorkMode &&
        matchesEmployment
      );
    });
  }, [
    activeTab,
    query,
    location,
    workMode,
    employmentType,
    savedIds,
  ]);

  function toggleSaved(jobId: string) {
    if (!savedStorageKey) {
      setNotice("Sign in to save your preferences in this browser.");
      return;
    }

    const next = savedIds.includes(jobId)
      ? savedIds.filter((id) => id !== jobId)
      : [...savedIds, jobId];

    setSavedIds(next);
    window.localStorage.setItem(savedStorageKey, JSON.stringify(next));

    setNotice(
      next.includes(jobId)
        ? "Job saved in this browser."
        : "Job removed from saved jobs.",
    );
  }

  function expressInterest(jobId: string) {
    if (!interestStorageKey) {
      setNotice("Sign in to record your interest in this browser.");
      return;
    }

    if (interestedIds.includes(jobId)) return;

    const next = [...interestedIds, jobId];

    setInterestedIds(next);
    window.localStorage.setItem(interestStorageKey, JSON.stringify(next));
    setNotice(
      "Interest recorded locally for this demo. No application was submitted.",
    );
  }

  function resetFilters() {
    setQuery("");
    setLocation("all");
    setWorkMode("all");
    setEmploymentType("all");
  }

  if (!isLoaded || !storageLoaded) {
    return (
      <div className="job-feed-loading" role="status">
        Preparing your Job Feed…
      </div>
    );
  }

  return (
    <div className="job-feed-page">
      <section className="job-feed-hero">
        <div className="job-feed-hero-copy">
          <span className="role-eyebrow">YOUR NEXT CAREER MOVE</span>
          <h1>
            Find work that
            <br />
            <span>moves you forward.</span>
          </h1>
          <p>
            Explore example opportunities, discover roles to consider,
            and build momentum in your job search.
          </p>
          <span className="job-demo-disclaimer">
            <span aria-hidden="true">ⓘ</span>
            Demo listings · Not live vacancies
          </span>
        </div>

        <div className="job-feed-hero-art" aria-hidden="true">
          <div className="job-feed-orbit job-feed-orbit-one" />
          <div className="job-feed-orbit job-feed-orbit-two" />
          <div className="job-feed-hero-symbol">↗</div>
          <span className="job-feed-art-label">YOUR NEXT CHAPTER</span>
        </div>
      </section>

      {notice && (
        <div className="job-feed-notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">
            ×
          </button>
        </div>
      )}

      <div className="job-feed-layout">
        <section className="job-feed-main" aria-label="Job opportunities">
          <div className="job-feed-section-heading">
            <div>
              <span className="role-eyebrow">OPPORTUNITIES</span>
              <h2>Explore jobs</h2>
              <p>Start with roles worth a closer look.</p>
            </div>
            <span className="job-feed-result-count">
              {filteredJobs.length} results
            </span>
          </div>

          <div className="job-feed-tabs" role="tablist" aria-label="Job feed views">
            {(
              [
                ["for-you", "For you"],
                ["all", "All jobs"],
                ["saved", `Saved (${savedIds.length})`],
              ] as [FeedTab, string][]
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={activeTab === tab ? "is-active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="job-feed-filters">
            <label className="job-feed-search">
              <span className="job-feed-search-icon" aria-hidden="true">⌕</span>
              <span className="sr-only">Search jobs</span>
              <input
                type="search"
                placeholder="Search roles, companies, or skills…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <div className="job-feed-filter-row">
              <label>
                <span>Location</span>
                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                >
                  <option value="all">All locations</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Remote">Remote</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                </select>
              </label>

              <label>
                <span>Work mode</span>
                <select
                  value={workMode}
                  onChange={(event) => setWorkMode(event.target.value)}
                >
                  <option value="all">All modes</option>
                  <option value={"Remote" satisfies WorkMode}>Remote</option>
                  <option value={"Hybrid" satisfies WorkMode}>Hybrid</option>
                  <option value={"On-site" satisfies WorkMode}>On-site</option>
                </select>
              </label>

              <label>
                <span>Job type</span>
                <select
                  value={employmentType}
                  onChange={(event) => setEmploymentType(event.target.value)}
                >
                  <option value="all">All types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </label>
            </div>

            <button
              type="button"
              className="job-filter-reset"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          </div>

          <div className="job-feed-list" aria-live="polite">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedIds.includes(job.id)}
                  hasExpressedInterest={interestedIds.includes(job.id)}
                  onToggleSave={() => toggleSaved(job.id)}
                  onExpressInterest={() => expressInterest(job.id)}
                />
              ))
            ) : (
              <div className="job-feed-empty">
                <span className="job-feed-empty-mark" aria-hidden="true">⌕</span>
                <h3>
                  {activeTab === "saved"
                    ? "No saved jobs match"
                    : "No matching opportunities"}
                </h3>
                <p>
                  Try changing your search or filters. You can save example
                  jobs to find them here later.
                </p>
                <button
                  type="button"
                  className="job-interest-button"
                  onClick={() => {
                    setActiveTab("all");
                    resetFilters();
                  }}
                >
                  Browse all demo jobs
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="job-feed-aside">
          <section className="job-feed-aside-panel">
            <span className="role-eyebrow">PICKED FOR EXPLORATION</span>
            <h2>Roles to explore</h2>
            <p>
              These demo recommendations are examples of how TalentIQ could
              surface opportunities that match your interests.
            </p>

            {demoJobs
              .filter((job) => job.recommended)
              .slice(0, 3)
              .map((job) => (
                <button
                  key={job.id}
                  type="button"
                  className="job-recommendation-link"
                  onClick={() => {
                    setActiveTab("all");
                    setQuery(job.title);
                    setLocation("all");
                    setWorkMode("all");
                    setEmploymentType("all");
                  }}
                >
                  <span className="job-recommendation-dot" />
                  <span>
                    <strong>{job.title}</strong>
                    <small>{job.company} · Sample listing</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
          </section>

          <section className="job-feed-aside-panel career-tips-panel">
            <span className="role-eyebrow">SMALL STEPS, REAL PROGRESS</span>
            <h2>Career tips</h2>
            <p>Practical ideas for your next career move.</p>

            {careerTips.map((tip) => (
              <article className="career-tip-card" key={tip.title}>
                <span>{tip.category}</span>
                <h3>{tip.title}</h3>
                <p>{tip.description}</p>
                <small>{tip.readTime}</small>
              </article>
            ))}
          </section>

          <p className="job-feed-demo-note">
            Listings, recommendations, saved jobs, and interest actions on
            this page use sample content and browser-local state. They do
            not represent real vacancies or submitted applications.
          </p>
        </aside>
      </div>
    </div>
  );
}