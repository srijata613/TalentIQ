"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/icon";
import { useSidebar } from "./sidebar-context";
import { useExperienceRole } from "./experience-role-context";

const titles: Array<{
  match: (path: string) => boolean;
  label: string;
  description: string;
}> = [
  {
    match: (path) => path === "/dashboard",
    label: "Overview",
    description: "Your hiring workspace",
  },
  {
    match: (path) => path === "/seeker/dashboard",
    label: "Career overview",
    description: "Your personal career workspace",
  },
  {
    match: (path) => path === "/seeker/feed",
    label: "Job feed",
    description: "Explore opportunities and career insights",
  },
  {
    match: (path) => path === "/seeker/saved-jobs",
    label: "Saved jobs",
    description: "Your bookmarked opportunities",
  },
  {
    match: (path) => path === "/seeker/applications",
    label: "My applications",
    description: "Track your job search",
  },
  {
    match: (path) => path.startsWith("/seeker/interview-prep"),
    label: "Interview preparation",
    description: "Practise for your next opportunity",
  },
  {
    match: (path) =>
      path === "/settings" || path.startsWith("/settings/"),
    label: "Settings",
    description: "Manage your preferences",
  },
  {
    match: (path) =>
      path === "/jobs" ||
      path === "/jobs/new" ||
      path === "/jobs/upload",
    label: "Jobs",
    description: "Manage open roles and requirements",
  },
  {
    match: (path) => path.startsWith("/jobs/"),
    label: "Job workspace",
    description: "Review role requirements and candidates",
  },
  {
    match: (path) =>
      path === "/candidates" || path === "/candidates/upload",
    label: "Candidates",
    description: "Your organization's talent pool",
  },
  {
    match: (path) => path.startsWith("/candidates/"),
    label: "Candidate profile",
    description: "Candidate information and insights",
  },
  {
    match: (path) => path === "/rank" || path === "/match",
    label: "Match & Rank",
    description: "Evaluate candidate fit",
  },
  {
    match: (path) => path === "/search",
    label: "Talent Search",
    description: "Discover candidates across your talent pool",
  },
  {
    match: (path) => path.startsWith("/analyze/"),
    label: "AI Analysis",
    description: "Turn documents into structured insights",
  },
];

export default function AppHeader() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const { role } = useExperienceRole();

  const isJobSeeker = role === "job-seeker";

  const current = titles.find((item) => item.match(pathname)) ?? {
    label: isJobSeeker ? "Career workspace" : "Workspace",
    description: isJobSeeker
      ? "Your personal career workspace"
      : "TalentIQ workspace",
  };

  const showCandidateAction =
    !isJobSeeker && pathname.startsWith("/candidates");

  const showHeaderAction = isJobSeeker
    ? pathname === "/seeker/dashboard"
    : pathname !== "/dashboard" && pathname !== "/settings";

  const actionHref = isJobSeeker
    ? "/seeker/feed"
    : showCandidateAction
      ? "/candidates/upload"
      : "/jobs/new";

  const actionLabel = isJobSeeker
    ? "Explore jobs"
    : showCandidateAction
      ? "Add candidate"
      : "Create job";

  return (
    <header className="app-header">
      <div className="header-context">
        <button
          onClick={toggleSidebar}
          className="icon-btn sidebar-toggle"
          title="Toggle navigation"
          aria-label="Toggle navigation"
          type="button"
        >
          <Icon name="panel-left" size={18} />
        </button>

        <div className="header-title-wrap">
          <div className="header-breadcrumb">
            <span>TalentIQ</span>
            <Icon name="chevron-right" size={13} />
            <strong>{current.label}</strong>
          </div>

          <span className="header-context-description">
            {current.description}
          </span>
        </div>
      </div>

      {showHeaderAction && (
        <div className="header-actions">
          <Link
            href={actionHref}
            className="btn btn-primary header-primary-action"
          >
            <Icon name="plus" size={16} />
            <span>{actionLabel}</span>
          </Link>
        </div>
      )}
    </header>
  );
}