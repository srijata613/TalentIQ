import {
  assertOrganizationAccess,
  requireAuthenticatedContext,
} from "@/lib/authorization";
import AnalyzeCandidateButton from "@/components/analyze-candidate-button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Candidate Profile | TalentIQ" };

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const context = await requireAuthenticatedContext();
  const { supabase } = context;

  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // Authorize access before rendering any candidate information.
  if (candidate) {
    assertOrganizationAccess(context, candidate.organization_id);
  }

  if (!candidate) {
    return (
      <div className="workspace-page">
        <Link href="/candidates" className="back-link">
          ← Back to Candidates
        </Link>
        <section className="workspace-empty glass">
          <div className="workspace-empty-icon">⌕</div>
          <h2>Candidate not found</h2>
          <p>
            This profile may have been removed or the link may be out of date.
          </p>
          <Link href="/candidates" className="btn btn-primary">
            Return to Candidates
          </Link>
        </section>
      </div>
    );
  }

  const name = candidate.parsed_name || "Candidate profile";
  const skills = toStringList(candidate.parsed_skills);
  const inferredSkills = toStringList(candidate.inferred_skills);
  const degrees = toStringList(candidate.parsed_degrees);
  const graduationYears = toStringList(candidate.parsed_graduation_years);
  const designations = toStringList(candidate.parsed_designations);
  const projects = toStringList(candidate.parsed_projects);
  const certifications = toStringList(candidate.parsed_certifications);
  const achievements = toStringList(candidate.parsed_achievements);
  const years =
    candidate.parsed_experience_years ?? candidate.experience_years;
  const status = String(candidate.status || "uploaded");
  const behavioralSignals = toRecord(candidate.behavioral_signals);

  return (
    <div className="workspace-page">
      <div className="workspace-breadcrumbs">
        <Link href="/candidates">Candidates</Link>
        <span>/</span>
        <span>{name}</span>
      </div>

      <header className="workspace-hero candidate-hero">
        <div className="candidate-identity">
          <div className="candidate-avatar">{initials(name)}</div>
          <div className="workspace-hero-copy">
            <div className="workspace-eyebrow">
              <span className="workspace-eyebrow-dot" /> CANDIDATE PROFILE
            </div>
            <h1 className="page-title">{name}</h1>
            <p className="page-subtitle">
              {candidate.parsed_summary ||
                "Review parsed resume information and prepare this profile for job-specific evaluation."}
            </p>
            <div className="workspace-meta-row">
              <span
                className={`badge ${
                  status === "parsed" ? "badge-emerald" : "badge-gray"
                }`}
              >
                {status}
              </span>
              {typeof years === "number" && (
                <span className="workspace-meta">
                  {years} year{years === 1 ? "" : "s"} experience
                </span>
              )}
              {candidate.created_at && (
                <span className="workspace-meta">
                  Added {formatDate(String(candidate.created_at))}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="workspace-hero-actions">
          <AnalyzeCandidateButton candidateId={id} />
          <Link href="/jobs" className="btn btn-primary">
            Choose a job to match <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <div className="workspace-stat-grid workspace-stat-grid-3 candidate-summary-stats">
        <div className="glass workspace-stat-card">
          <div className="workspace-stat-top">
            <span>Parsed skills</span>
            <span className="workspace-stat-icon">✳</span>
          </div>
          <strong>{skills.length}</strong>
          <small>Skills extracted from the resume</small>
        </div>

        <div className="glass workspace-stat-card">
          <div className="workspace-stat-top">
            <span>Experience</span>
            <span className="workspace-stat-icon">◷</span>
          </div>
          <strong>{typeof years === "number" ? years : "—"}</strong>
          <small>
            {typeof years === "number"
              ? "Years of experience"
              : "Not available in this profile"}
          </small>
        </div>

        <div className="glass workspace-stat-card">
          <div className="workspace-stat-top">
            <span>Certifications</span>
            <span className="workspace-stat-icon">◇</span>
          </div>
          <strong>{certifications.length}</strong>
          <small>Certifications found in the resume</small>
        </div>
      </div>

      <div className="candidate-profile-layout">
        <div className="candidate-profile-main">
          <section className="glass workspace-panel">
            <div className="workspace-section-heading workspace-section-heading-compact">
              <div>
                <span className="workspace-kicker">PROFILE</span>
                <h2>Contact &amp; links</h2>
              </div>
            </div>

            <div className="candidate-contact-grid">
              <ContactItem label="Email" value={candidate.parsed_email} />
              <ContactItem label="Phone" value={candidate.parsed_phone} />
              <ContactItem
                label="LinkedIn"
                value={candidate.parsed_linkedin}
                href={candidate.parsed_linkedin}
              />
              <ContactItem
                label="GitHub"
                value={candidate.parsed_github}
                href={candidate.parsed_github}
              />
              <ContactItem
                label="Portfolio"
                value={candidate.parsed_portfolio}
                href={candidate.parsed_portfolio}
              />
            </div>
          </section>

          <section className="glass workspace-panel">
            <PanelHeader
              eyebrow="CAPABILITIES"
              title="Skills"
              count={skills.length}
            />

            {skills.length ? (
              <div className="workspace-chip-list">
                {skills.map((skill) => (
                  <span
                    className="workspace-chip workspace-chip-brand"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <EmptySection text="No parsed skills are available yet. Run resume analysis to extract them." />
            )}

            {inferredSkills.length > 0 && (
              <div className="candidate-secondary-group">
                <h4>Inferred skills</h4>
                <p className="workspace-muted">
                  Shown separately from skills explicitly extracted from the
                  resume.
                </p>
                <div className="workspace-chip-list">
                  {inferredSkills.map((skill) => (
                    <span className="workspace-chip" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="glass workspace-panel">
            <PanelHeader
              eyebrow="CAREER"
              title="Experience & education"
              count={designations.length + degrees.length}
            />

            {designations.length > 0 && (
              <div className="candidate-timeline">
                {designations.map((role, index) => (
                  <div
                    className="candidate-timeline-item"
                    key={`${role}-${index}`}
                  >
                    <span className="candidate-timeline-dot" />
                    <div>
                      <strong>{role}</strong>
                      <p>Role extracted from the resume</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {degrees.length > 0 && (
              <div className="candidate-secondary-group">
                <h4>Education</h4>
                {degrees.map((degree, index) => (
                  <div
                    className="candidate-education-row"
                    key={`${degree}-${index}`}
                  >
                    <span className="candidate-education-icon">⌂</span>
                    <div>
                      <strong>{degree}</strong>
                      {graduationYears[index] && (
                        <p>Graduation year: {graduationYears[index]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {designations.length === 0 && degrees.length === 0 && (
              <EmptySection text="Experience and education details have not been extracted for this candidate yet." />
            )}
          </section>

          {projects.length > 0 && (
            <section className="glass workspace-panel">
              <PanelHeader
                eyebrow="WORK SAMPLES"
                title="Projects"
                count={projects.length}
              />
              <div className="candidate-content-list">
                {projects.map((project, index) => (
                  <div
                    className="candidate-content-item"
                    key={`${project}-${index}`}
                  >
                    <span className="candidate-content-icon">↗</span>
                    <p>{project}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {achievements.length > 0 && (
            <section className="glass workspace-panel">
              <PanelHeader
                eyebrow="HIGHLIGHTS"
                title="Achievements"
                count={achievements.length}
              />
              <div className="candidate-content-list">
                {achievements.map((item, index) => (
                  <div
                    className="candidate-content-item"
                    key={`${item}-${index}`}
                  >
                    <span className="candidate-content-icon">✦</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="candidate-profile-aside">
          <section className="glass workspace-panel">
            <PanelHeader
              eyebrow="QUALIFICATIONS"
              title="Certifications"
              count={certifications.length}
            />

            {certifications.length ? (
              <ul className="candidate-aside-list">
                {certifications.map((cert) => (
                  <li key={cert}>
                    <span className="candidate-aside-check">✓</span>
                    {cert}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="workspace-muted">No certifications extracted.</p>
            )}
          </section>

          {Object.keys(behavioralSignals).length > 0 && (
            <section className="glass workspace-panel">
              <PanelHeader
                eyebrow="ANALYSIS CONTEXT"
                title="Behavioral signals"
              />
              <div className="candidate-signal-list">
                {Object.entries(behavioralSignals).map(([key, value]) => (
                  <div key={key}>
                    <span>{humanize(key)}</span>
                    <strong>{formatUnknown(value)}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(candidate.adaptability_score != null ||
            candidate.growth_score != null) && (
            <section className="glass workspace-panel">
              <PanelHeader eyebrow="DEVELOPMENT" title="Potential indicators" />

              <div className="candidate-score-list">
                {candidate.adaptability_score != null && (
                  <MiniScore
                    label="Adaptability"
                    score={Number(candidate.adaptability_score)}
                  />
                )}
                {candidate.growth_score != null && (
                  <MiniScore
                    label="Growth"
                    score={Number(candidate.growth_score)}
                  />
                )}
              </div>

              <p className="workspace-muted candidate-disclaimer">
                These are model-derived signals, not standalone hiring
                decisions.
              </p>
            </section>
          )}

          <section className="glass workspace-panel candidate-record-card">
            <PanelHeader eyebrow="RECORD" title="Profile details" />
            <div className="workspace-detail-list">
              <div className="workspace-detail-row">
                <span>Status</span>
                <strong>{status}</strong>
              </div>
              <div className="workspace-detail-row">
                <span>Added</span>
                <strong>
                  {candidate.created_at
                    ? formatDate(String(candidate.created_at))
                    : "—"}
                </strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function toRecord(value: unknown): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "C"
  );
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

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatUnknown(value: unknown): string {
  if (value == null || value === "") return "Not available";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  return JSON.stringify(value);
}

function PanelHeader({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="workspace-panel-heading">
      <div>
        <span className="workspace-kicker">{eyebrow}</span>
        <h3>{title}</h3>
      </div>
      {count !== undefined && (
        <span className="workspace-count">{count}</span>
      )}
    </div>
  );
}

function EmptySection({ text }: { text: string }) {
  return <p className="workspace-muted candidate-empty-section">{text}</p>;
}

function ContactItem({
  label,
  value,
  href,
}: {
  label: string;
  value: unknown;
  href?: string | null;
}) {
  if (typeof value !== "string" || !value.trim()) return null;

  const isExternalLink =
    typeof href === "string" && /^https?:\/\//i.test(href);

  return (
    <div className="candidate-contact-item">
      <span>{label}</span>
      {isExternalLink ? (
        <a href={href} target="_blank" rel="noreferrer">
          {value}
          <span aria-hidden="true"> ↗</span>
        </a>
      ) : (
        <strong>{value}</strong>
      )}
    </div>
  );
}

function MiniScore({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const percent = Math.max(0, Math.min(100, score));

  return (
    <div className="candidate-mini-score">
      <div>
        <span>{label}</span>
        <strong>{percent}%</strong>
      </div>
      <div
        className="candidate-mini-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}