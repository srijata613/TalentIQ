"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/icon";
import { useSidebar } from "./sidebar-context";

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
      path === "/candidates" ||
      path === "/candidates/upload",
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

  const current = titles.find((item) => item.match(pathname)) ?? {
    label: "Workspace",
    description: "TalentIQ workspace",
  };

  const showCandidateAction = pathname.startsWith("/candidates");

  // The dashboard already has a prominent primary action
  // in its welcome section, so avoid showing it twice.
  const showHeaderAction = pathname !== "/dashboard";

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

      {showHeaderAction ? (
        <div className="header-actions">
          <Link
            href={
              showCandidateAction
                ? "/candidates/upload"
                : "/jobs/new"
            }
            className="btn btn-primary header-primary-action"
          >
            <Icon name="plus" size={16} />
            <span>
              {showCandidateAction ? "Add candidate" : "Create job"}
            </span>
          </Link>
        </div>
      ) : null}
    </header>
  );
}