import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { syncUser } from "@/actions/sync-user";
import CreateOrganizationForm from "@/components/create-organization-form";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2">
      <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2">
      <path d="M17 20h5v-2a4 4 0 00-5.196-3.773M9 20H4v-2a4 4 0 015.196-3.773M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0zM3 10a3 3 0 116 0 3 3 0 01-6 0z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function RankIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2">
      <path d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

async function DashboardStats({ orgId }: { orgId: string }) {
  const supabase = createSupabaseServerClient();

  const [{ count: jobCount }, { count: candidateCount }] = await Promise.all([
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId),
    supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId),
  ]);

  return { jobCount: jobCount ?? 0, candidateCount: candidateCount ?? 0 };
}

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  await syncUser();

  const supabase = createSupabaseServerClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUser?.id)
    .maybeSingle();

  const { data: membership } = await supabase
    .from("memberships")
    .select("*, organizations (*)")
    .eq("user_id", user?.id)
    .maybeSingle();

  if (!membership) {
    return (
      <div style={{ padding: "40px 32px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8, color: "#FFFFFF" }}>
          Welcome to TalentIQ
        </h1>
        <p style={{ color: "#A1A1AA", marginBottom: 32 }}>
          Set up your organization to get started.
        </p>
        <CreateOrganizationForm />
      </div>
    );
  }

  const stats = await DashboardStats({ orgId: membership.organization_id });
  const org = membership.organizations;
  const firstName = clerkUser?.firstName ?? "there";

  return (
    <div style={{ padding: "40px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: "#A1A1AA", fontSize: "0.875rem", marginBottom: 4 }}>
          Welcome back, {firstName}
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "#FFFFFF" }}>
          {org?.name ?? "Dashboard"}
        </h1>
        <span
          className="badge badge-brand"
          style={{ marginTop: 8, display: "inline-flex" }}
        >
          {membership.role}
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard
          title="Active Jobs"
          value={stats.jobCount}
          icon={<BriefcaseIcon />}
          href="/jobs"
        />
        <StatCard
          title="Candidates"
          value={stats.candidateCount}
          icon={<UsersIcon />}
          href="/candidates"
        />
        <StatCard
          title="Organization"
          value={org?.name ?? "—"}
          icon={<BuildingIcon />}
          href="/dashboard"
          isText
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 16, color: "#FFFFFF" }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {[
            { label: "Analyze a Resume", href: "/analyze/resume", icon: <DocumentIcon />, desc: "Parse skills, experience & credentials" },
            { label: "Analyze a Job Description", href: "/analyze/job", icon: <TargetIcon />, desc: "Extract requirements & skills" },
            { label: "Match Candidate", href: "/match", icon: <SparklesIcon />, desc: "Score a resume against a JD" },
            { label: "Rank Candidates", href: "/rank", icon: <RankIcon />, desc: "Batch rank multiple resumes" },
            { label: "Upload Resume", href: "/candidates/upload", icon: <UploadIcon />, desc: "Add a candidate to your pool" },
            { label: "New Job", href: "/jobs/new", icon: <PlusIcon />, desc: "Create a job description" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="glass"
              style={{
                padding: "18px 16px",
                textDecoration: "none",
                display: "block",
                transition: "background 0.15s ease",
              }}
            >
              <div style={{ marginBottom: 10 }}>{action.icon}</div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: 4, color: "#FFFFFF" }}>
                {action.label}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#A1A1AA" }}>
                {action.desc}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  href,
  isText = false,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
  isText?: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className="glass"
        style={{
          padding: "20px",
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "#18181b",
            border: "1px solid #27272a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontSize: "0.8125rem", color: "#A1A1AA", marginBottom: 4 }}>
            {title}
          </div>
          <div
            style={{
              fontSize: isText ? "1.125rem" : "1.75rem",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.2,
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </Link>
  );
}
