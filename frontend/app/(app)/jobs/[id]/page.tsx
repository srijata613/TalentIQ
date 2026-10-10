import { getJob } from "@/actions/get-job";
import AnalyzeJobButton from "@/components/analyze-job-button";
import RunMatchingButton from "@/components/run-matching-button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Job Workspace | TalentIQ" };

type StringList = string[] | null | undefined;

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { job, versions = [], analysis } = await getJob(id);

  if (!job) {
    return (
      <div className="workspace-page">
        <Link href="/jobs" className="back-link">
          ← Back to Jobs
        </Link>
        <section className="workspace-empty glass">
          <div className="workspace-empty-icon">⌕</div>
          <h2>We couldn’t find that job</h2>
          <p>The job may have been removed or the link may be out of date.</p>
          <Link href="/jobs" className="btn btn-primary">
            Return to Jobs
          </Link>
        </section>
      </div>
    );
  }

  const latestVersion = versions[0];
  const title = job.title || "Untitled job";
  const status = String(job.status || "draft");
  const requiredSkills = list(analysis?.required_skills);
  const preferredSkills = list(analysis?.preferred_skills);
  const technologies = list(analysis?.technologies);
  const tools = list(analysis?.tools);
  const responsibilities = list(analysis?.responsibilities);
  const hiddenRequirements = list(analysis?.hidden_requirements);
  const missingRequirements = list(analysis?.missing_requirements);
  const duplicateRequirements = list(analysis?.duplicate_requirements);
  const skillGaps = list(analysis?.skill_gaps);
  const education = list(analysis?.education_requirements);
  const certifications = list(analysis?.certifications);
  const hasAnalysis = Boolean(analysis);
  const createdDate = job.created_at ? formatDate(job.created_at) : null;

  return (
    <div className="workspace-page">
      <div className="workspace-breadcrumbs">
        <Link href="/jobs">Jobs</Link>
        <span>/</span>
        <span>{title}</span>
      </div>

      <header className="workspace-hero">
        <div className="workspace-hero-copy">
          <div className="workspace-eyebrow">
            <span className="workspace-eyebrow-dot" /> JOB WORKSPACE
          </div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">
            Review role requirements, inspect AI analysis, and discover the
            candidates best aligned to this position.
          </p>
          <div className="workspace-meta-row">
            <span
              className={`badge ${
                status === "active" || status === "open"
                  ? "badge-emerald"
                  : "badge-gray"
              }`}
            >
              {status}
            </span>
            {createdDate && (
              <span className="workspace-meta">Created {createdDate}</span>
            )}
            {latestVersion && (
              <span className="workspace-meta">
                Version {latestVersion.version_number ?? 1}
              </span>
            )}
            <span
              className={`badge ${
                hasAnalysis ? "badge-brand" : "badge-yellow"
              }`}
            >
              {hasAnalysis ? "Analysis ready" : "Analysis pending"}
            </span>
          </div>
        </div>
        <div className="workspace-hero-actions">
          <AnalyzeJobButton
            jobId={job.id}
            content={latestVersion?.content ?? ""}
          />
          <RunMatchingButton jobId={job.id} />
        </div>
      </header>

      <nav
        className="workspace-tabs"
        aria-label="Job workspace sections"
      >
        <a className="workspace-tab workspace-tab-active" href="#overview">
          Overview
        </a>
        <a className="workspace-tab" href="#requirements">
          Requirements
        </a>
        <Link
          className="workspace-tab"
          href={`/jobs/${job.id}/matches`}
        >
          Candidate matches{" "}
          <span className="workspace-tab-arrow">↗</span>
        </Link>
        <a className="workspace-tab" href="#history">
          Description &amp; history
        </a>
      </nav>

      <section id="overview" className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span className="workspace-kicker">AT A GLANCE</span>
            <h2>Role overview</h2>
          </div>
          <span className="workspace-section-caption">
            Based on the saved job description
          </span>
        </div>

        <div className="workspace-stat-grid workspace-stat-grid-3">
          <StatCard
            label="Required skills"
            value={requiredSkills.length}
            detail={
              requiredSkills.length
                ? "Identified by analysis"
                : "Awaiting analysis"
            }
            icon="◎"
          />
          <StatCard
            label="Preferred skills"
            value={preferredSkills.length}
            detail={
              preferredSkills.length
                ? "Nice-to-have criteria"
                : "None extracted yet"
            }
            icon="✳"
          />
          <StatCard
            label="Responsibilities"
            value={responsibilities.length}
            detail={
              responsibilities.length
                ? "Role expectations"
                : "Not available yet"
            }
            icon="≡"
          />
        </div>

        {!hasAnalysis ? (
          <div className="workspace-callout workspace-callout-brand">
            <div className="workspace-callout-icon">✦</div>
            <div className="workspace-callout-copy">
              <h3>Turn this description into a structured role profile</h3>
              <p>
                Analyze the saved job description to extract skills,
                experience expectations, responsibilities, and areas that
                may need clarification.
              </p>
            </div>
            <Link href="#requirements" className="btn btn-secondary">
              Preview requirements
            </Link>
          </div>
        ) : (
          <div className="workspace-two-column">
            <section className="glass workspace-panel">
              <PanelHeading
                title="Role profile"
                subtitle="Key signals extracted from the description"
              />
              <div className="workspace-detail-list">
                <DetailRow label="Seniority" value={analysis.seniority} />
                <DetailRow label="Industry" value={analysis.industry} />
                <DetailRow label="Domain" value={analysis.domain} />
                <DetailRow
                  label="Experience"
                  value={firstOrText(analysis.experience_requirements)}
                />
                <DetailRow
                  label="Education"
                  value={firstOrText(analysis.education_requirements)}
                />
                <DetailRow
                  label="Readability"
                  value={
                    analysis.readability_score == null
                      ? null
                      : `${analysis.readability_score}%`
                  }
                />
              </div>
            </section>

            <section className="glass workspace-panel">
              <PanelHeading
                title="Technology landscape"
                subtitle="Tools and technologies mentioned in the role"
              />
              <ChipGroup title="Technologies" items={technologies} />
              <ChipGroup title="Tools" items={tools} />
              {technologies.length === 0 && tools.length === 0 && (
                <p className="workspace-muted">
                  No technology or tool signals were returned.
                </p>
              )}
            </section>
          </div>
        )}
      </section>

      <section id="requirements" className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span className="workspace-kicker">AI ANALYSIS</span>
            <h2>Requirements</h2>
          </div>
          {hasAnalysis && (
            <span className="workspace-section-caption">
              Review extracted criteria before matching
            </span>
          )}
        </div>

        {!hasAnalysis ? (
          <div className="glass workspace-empty-inline">
            <p>
              Requirements will appear here after job analysis. Use the
              Analyze Job action at the top of this page to extract them.
            </p>
          </div>
        ) : (
          <div className="workspace-requirements-grid">
            <section className="glass workspace-panel">
              <PanelHeading
                title="Must-have skills"
                subtitle="Core requirements identified by the analysis"
              />
              <ChipGroup
                items={requiredSkills}
                tone="brand"
                emptyText="No required skills were returned."
              />
            </section>

            <section className="glass workspace-panel">
              <PanelHeading
                title="Nice-to-have skills"
                subtitle="Preferred skills that can differentiate candidates"
              />
              <ChipGroup
                items={preferredSkills}
                emptyText="No preferred skills were returned."
              />
            </section>

            <section className="glass workspace-panel">
              <PanelHeading title="Education & certifications" />
              <ChipGroup title="Education" items={education} />
              <ChipGroup title="Certifications" items={certifications} />
              {education.length === 0 && certifications.length === 0 && (
                <p className="workspace-muted">
                  No education or certification requirements were returned.
                </p>
              )}
            </section>

            <section className="glass workspace-panel">
              <PanelHeading
                title="Responsibilities"
                subtitle="What this role is expected to deliver"
              />
              <BulletList
                items={responsibilities}
                emptyText="No responsibilities were returned."
              />
            </section>
          </div>
        )}

        {hasAnalysis &&
          (hiddenRequirements.length > 0 ||
            missingRequirements.length > 0 ||
            duplicateRequirements.length > 0 ||
            skillGaps.length > 0) && (
            <section className="glass workspace-panel workspace-findings-panel">
              <PanelHeading
                title="Review points"
                subtitle="Signals worth reviewing before you evaluate candidates"
              />
              <div className="workspace-findings-grid">
                <FindingList
                  title="Hidden requirements"
                  items={hiddenRequirements}
                />
                <FindingList
                  title="Missing requirements"
                  items={missingRequirements}
                />
                <FindingList
                  title="Duplicate requirements"
                  items={duplicateRequirements}
                />
                <FindingList title="Skill gaps" items={skillGaps} />
              </div>
            </section>
          )}

        {hasAnalysis &&
          Object.keys(asRecord(analysis.salary_benchmark)).length > 0 && (
            <section className="glass workspace-panel">
              <PanelHeading
                title="Salary benchmark"
                subtitle="Values returned by the current analysis service"
              />
              <div className="workspace-benchmark-grid">
                {Object.entries(asRecord(analysis.salary_benchmark)).map(
                  ([key, value]) => (
                    <div
                      className="workspace-benchmark-item"
                      key={key}
                    >
                      <span>{humanize(key)}</span>
                      <strong>{displayValue(value)}</strong>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}
      </section>

      <section id="history" className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span className="workspace-kicker">SOURCE MATERIAL</span>
            <h2>Description &amp; history</h2>
          </div>
          <span className="workspace-section-caption">
            {versions.length} saved version
            {versions.length === 1 ? "" : "s"}
          </span>
        </div>

        {versions.length === 0 ? (
          <div className="glass workspace-empty-inline">
            <p>No saved job description version is available.</p>
          </div>
        ) : (
          <div className="workspace-history-list">
            {versions.map(
              (version: Record<string, unknown>, index: number) => (
                <details
                  className="glass workspace-history-item"
                  key={String(
                    version.id ?? version.version_number ?? index,
                  )}
                  open={index === 0}
                >
                  <summary>
                    <span className="workspace-history-version">
                      v
                      {String(
                        version.version_number ?? versions.length - index,
                      )}
                    </span>
                    <span className="workspace-history-title">
                      {index === 0
                        ? "Current description"
                        : `Previous version ${String(
                            version.version_number ?? "",
                          )}`}
                    </span>
                    <span className="workspace-meta">
                      {version.created_at
                        ? formatDate(String(version.created_at))
                        : "Date unavailable"}
                    </span>
                    <span className="workspace-history-toggle">⌄</span>
                  </summary>
                  <div className="workspace-description-text">
                    {String(
                      version.content ??
                        "No description text saved for this version.",
                    )}
                  </div>
                </details>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function list(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function firstOrText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  const values = list(value);
  return values.length ? values.join(", ") : null;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function displayValue(value: unknown): string {
  if (value == null || value === "") return "Not provided";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string" ? item : JSON.stringify(item),
      )
      .join(", ");
  }

  return Object.entries(value as Record<string, unknown>)
    .map(([key, item]) => `${humanize(key)}: ${String(item)}`)
    .join(" · ");
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: string;
}) {
  return (
    <div className="glass workspace-stat-card">
      <div className="workspace-stat-top">
        <span>{label}</span>
        <span className="workspace-stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function PanelHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="workspace-panel-heading">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  const content =
    typeof value === "string" || typeof value === "number"
      ? String(value)
      : null;

  if (!content) return null;

  return (
    <div className="workspace-detail-row">
      <span>{label}</span>
      <strong>{content}</strong>
    </div>
  );
}

function ChipGroup({
  title,
  items,
  tone = "neutral",
  emptyText,
}: {
  title?: string;
  items: StringList;
  tone?: "neutral" | "brand";
  emptyText?: string;
}) {
  const values = list(items);

  return (
    <div className="workspace-chip-group">
      {title && <div className="workspace-chip-label">{title}</div>}
      {values.length ? (
        <div className="workspace-chip-list">
          {values.map((value) => (
            <span
              key={value}
              className={`workspace-chip ${
                tone === "brand" ? "workspace-chip-brand" : ""
              }`}
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        emptyText && <p className="workspace-muted">{emptyText}</p>
      )}
    </div>
  );
}

function BulletList({
  items,
  emptyText,
}: {
  items: StringList;
  emptyText: string;
}) {
  const values = list(items);

  return values.length ? (
    <ul className="workspace-bullet-list">
      {values.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  ) : (
    <p className="workspace-muted">{emptyText}</p>
  );
}

function FindingList({
  title,
  items,
}: {
  title: string;
  items: StringList;
}) {
  const values = list(items);

  return (
    <div className="workspace-finding">
      <h4>
        {title}
        <span>{values.length}</span>
      </h4>
      {values.length ? (
        <ul>
          {values.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>None identified</p>
      )}
    </div>
  );
}