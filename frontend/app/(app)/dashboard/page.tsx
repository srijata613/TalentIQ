import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { requireAuthenticatedContext } from "@/lib/authorization";
import { syncUser } from "@/actions/sync-user";
import CreateOrganizationForm from "@/components/create-organization-form";
import Icon from "@/components/icon";

export const metadata: Metadata = { title: "Overview" };

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function humanizeStatus(value?: string | null) {
  return (value || "draft").replace(/[_-]/g, " ").toLowerCase();
}

function initials(value?: string | null) {
  const words = (value || "Candidate").trim().split(/\s+/).filter(Boolean);

  return (
    words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "C"
  );
}

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Ensure the Clerk account has a corresponding database user.
  await syncUser();

  // Resolve the authenticated database user and organization memberships.
  const { supabase, memberships } =
    await requireAuthenticatedContext();

  // Organization switching is not implemented yet, so do not select
  // an arbitrary organization when multiple memberships exist.
  if (memberships.length > 1) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-mark">
          <Icon name="building" size={22} />
        </div>

        <p className="eyebrow">Workspace selection</p>
        <h1 className="page-title">Choose a workspace</h1>

        <p className="page-subtitle">
          Your account belongs to multiple organizations.
          Workspace switching is not yet available on this page.
        </p>
      </div>
    );
  }

  const membership = memberships[0];

  // Preserve the existing organization onboarding flow.
  if (!membership?.organization_id) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-mark">
          <Icon name="building" size={22} />
        </div>

        <p className="eyebrow">One quick setup</p>

        <h1 className="page-title">Welcome to TalentIQ</h1>

        <p className="page-subtitle">
          Create your organization workspace to start organizing roles,
          evaluating candidates, and using talent intelligence.
        </p>

        <div className="glass page-form-panel">
          <CreateOrganizationForm />
        </div>
      </div>
    );
  }

  const orgId = membership.organization_id;

  const [
    { count: jobCount },
    { count: candidateCount },
    { count: parsedCount },
    { data: recentJobs },
    { data: recentCandidates },
    { data: organization, error: organizationError },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),

    supabase
      .from("candidates")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),

    supabase
      .from("candidates")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "parsed"),

    supabase
      .from("jobs")
      .select("id, title, status, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("candidates")
      .select(
        "id, parsed_name, parsed_email, parsed_skills, status, created_at"
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("organizations")
      .select("id, name")
      .eq("id", orgId)
      .maybeSingle(),
  ]);

  if (organizationError) {
    throw new Error("Unable to retrieve the organization details.");
  }

  const jobsTotal = jobCount ?? 0;
  const candidatesTotal = candidateCount ?? 0;
  const parsedTotal = parsedCount ?? 0;
  const pendingTotal = Math.max(0, candidatesTotal - parsedTotal);

  const firstName =
    clerkUser.firstName || clerkUser.username || "there";

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <p className="eyebrow">Your hiring workspace</p>

          <h1 className="welcome-title">
            Welcome back,{" "}
            <span className="welcome-accent">{firstName}</span>
          </h1>

          <p className="welcome-copy">
            A clear view of your roles and talent pool, all in one place.
          </p>

          <div className="org-chip">
            <Icon name="building" size={13} />
            <span>{organization?.name || "Your organization"}</span>
            <span aria-hidden="true">·</span>
            <span>{humanizeStatus(membership.role)}</span>
          </div>
        </div>

        <Link href="/jobs/new" className="btn btn-primary">
          <Icon name="plus" size={16} />
          Create a job
        </Link>
      </section>

      <section
        className="dashboard-stats"
        aria-label="Workspace statistics"
      >
        <Link href="/jobs" className="stat-card">
          <span className="stat-icon">
            <Icon name="briefcase" size={18} />
          </span>

          <div className="stat-meta">
            <span className="stat-label">Job descriptions</span>
            <span className="stat-value">{jobsTotal}</span>
            <span className="stat-footnote">Roles in your workspace</span>
          </div>
        </Link>

        <Link href="/candidates" className="stat-card">
          <span className="stat-icon">
            <Icon name="users" size={18} />
          </span>

          <div className="stat-meta">
            <span className="stat-label">Talent pool</span>
            <span className="stat-value">{candidatesTotal}</span>
            <span className="stat-footnote">Candidate profiles</span>
          </div>
        </Link>

        <Link href="/candidates" className="stat-card">
          <span className="stat-icon">
            <Icon name="file-check" size={18} />
          </span>

          <div className="stat-meta">
            <span className="stat-label">Parsed resumes</span>
            <span className="stat-value">{parsedTotal}</span>
            <span className="stat-footnote">
              Profiles with extracted data
            </span>
          </div>
        </Link>

        <Link href="/candidates" className="stat-card">
          <span className="stat-icon">
            <Icon name="clock" size={18} />
          </span>

          <div className="stat-meta">
            <span className="stat-label">Not parsed yet</span>
            <span className="stat-value">{pendingTotal}</span>
            <span className="stat-footnote">
              Profiles without parsed data
            </span>
          </div>
        </Link>
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2 className="section-heading">Recent jobs</h2>
              <p className="section-description">
                Pick up where your hiring work left off.
              </p>
            </div>

            <Link href="/jobs" className="text-link">
              View all <Icon name="arrow-right" size={14} />
            </Link>
          </div>

          {recentJobs && recentJobs.length > 0 ? (
            <div className="dashboard-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job title</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>

                <tbody>
                  {recentJobs.map((job) => {
                    const status = humanizeStatus(job.status);

                    return (
                      <tr key={job.id}>
                        <td>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="table-primary-link"
                          >
                            {job.title || "Untitled role"}
                          </Link>

                          <span className="table-meta">
                            Job description
                          </span>
                        </td>

                        <td>
                          <span
                            className={`inline-status status-${status.replace(
                              /\s+/g,
                              "-"
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="table-muted">
                          {formatDate(job.created_at)}
                        </td>

                        <td>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-link"
                            aria-label={`Open ${
                              job.title || "job"
                            }`}
                          >
                            <Icon name="chevron-right" size={15} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-inline">
              <strong>No jobs yet</strong>
              Create your first role to start organizing requirements and
              matching candidates.
              <br />

              <Link href="/jobs/new" className="text-link">
                Create your first job{" "}
                <Icon name="arrow-right" size={13} />
              </Link>
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2 className="section-heading">
                Recently added candidates
              </h2>
              <p className="section-description">
                The latest profiles in your talent pool.
              </p>
            </div>

            <Link href="/candidates" className="text-link">
              View all <Icon name="arrow-right" size={14} />
            </Link>
          </div>

          <div className="dashboard-panel-body">
            {recentCandidates && recentCandidates.length > 0 ? (
              <div className="candidate-mini-list">
                {recentCandidates.map((candidate) => {
                  const name =
                    candidate.parsed_name || "Unnamed candidate";

                  const skills = Array.isArray(candidate.parsed_skills)
                    ? candidate.parsed_skills.slice(0, 2).join(" · ")
                    : "";

                  return (
                    <div
                      className="candidate-mini-row"
                      key={candidate.id}
                    >
                      <span className="candidate-avatar">
                        {initials(candidate.parsed_name)}
                      </span>

                      <div className="candidate-mini-copy">
                        <Link
                          href={`/candidates/${candidate.id}`}
                          className="candidate-mini-name"
                        >
                          {name}
                        </Link>

                        <span className="candidate-mini-meta">
                          {skills ||
                            candidate.parsed_email ||
                            "Profile details not parsed yet"}
                        </span>
                      </div>

                      <span
                        className={`badge ${
                          candidate.status === "parsed"
                            ? "badge-emerald"
                            : "badge-gray"
                        }`}
                      >
                        {humanizeStatus(candidate.status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-inline">
                <strong>Your talent pool starts here</strong>
                Upload resumes to build searchable candidate profiles.
                <br />

                <Link
                  href="/candidates/upload"
                  className="text-link"
                >
                  Add candidates <Icon name="arrow-right" size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading-row">
          <div>
            <h2 className="section-heading">Jump back in</h2>
            <p className="section-description">
              Common tasks, without the extra navigation.
            </p>
          </div>
        </div>

        <div className="quick-actions-grid">
          <Link href="/jobs/new" className="quick-action">
            <span className="quick-action-icon">
              <Icon name="plus" size={17} />
            </span>

            <span className="quick-action-copy">
              <strong>Create a job</strong>
              <span>Set up a role and its requirements</span>
            </span>
          </Link>

          <Link href="/candidates/upload" className="quick-action">
            <span className="quick-action-icon">
              <Icon name="upload" size={17} />
            </span>

            <span className="quick-action-copy">
              <strong>Add candidates</strong>
              <span>Upload resumes to your talent pool</span>
            </span>
          </Link>

          <Link href="/rank" className="quick-action">
            <span className="quick-action-icon">
              <Icon name="target" size={17} />
            </span>

            <span className="quick-action-copy">
              <strong>Match &amp; rank</strong>
              <span>Review candidate fit for a role</span>
            </span>
          </Link>

          <Link href="/search" className="quick-action">
            <span className="quick-action-icon">
              <Icon name="search" size={17} />
            </span>

            <span className="quick-action-copy">
              <strong>Find talent</strong>
              <span>Search candidate profiles</span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}