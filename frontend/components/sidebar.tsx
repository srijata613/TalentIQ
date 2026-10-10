
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import Icon from "@/components/icon";
import { useSidebar } from "./sidebar-context";
import { useExperienceRole } from "./experience-role-context";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const recruiterWorkspaceItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: <Icon name="layout-dashboard" />,
  },
  {
    href: "/jobs",
    label: "Jobs",
    icon: <Icon name="briefcase" />,
  },
  {
    href: "/candidates",
    label: "Candidates",
    icon: <Icon name="users" />,
  },
];

const intelligenceItems: NavItem[] = [
  {
    href: "/rank",
    label: "Match & Rank",
    icon: <Icon name="target" />,
  },
  {
    href: "/search",
    label: "Talent Search",
    icon: <Icon name="search" />,
  },
];

const seekerWorkspaceItems: NavItem[] = [
  {
    href: "/seeker/dashboard",
    label: "Overview",
    icon: <Icon name="layout-dashboard" />,
  },
  {
    href: "/seeker/feed",
    label: "Job Feed",
    icon: <Icon name="search" />,
  },
  {
    href: "/seeker/saved-jobs",
    label: "Saved Jobs",
    icon: (
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4V4.75Z" />
      </svg>
    ),
  },
  {
    href: "/seeker/applications",
    label: "My Applications",
    icon: <Icon name="briefcase" />,
  },
];

const settingsItems: NavItem[] = [
  {
    href: "/settings",
    label: "Settings",
    icon: <Icon name="settings" />,
  },
];

function isItemActive(href: string, pathname: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (href === "/jobs") {
    return pathname === "/jobs" || pathname.startsWith("/jobs/");
  }

  if (href === "/candidates") {
    return (
      pathname === "/candidates" ||
      pathname.startsWith("/candidates/")
    );
  }

  if (href === "/seeker/dashboard") {
    return pathname === "/seeker/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="nav-section">
      <div className="section-title">{title}</div>

      {items.map((item) => {
        const active = isItemActive(item.href, pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
            title={item.label}
            onClick={onNavigate}
          >
            <span className="nav-icon-wrap">{item.icon}</span>
            <span className="nav-text">{item.label}</span>

            {active && (
              <span
                className="nav-active-dot"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobile } = useSidebar();
  const { role } = useExperienceRole();

  const isJobSeeker = role === "job-seeker";
  const homeHref = isJobSeeker
    ? "/seeker/dashboard"
    : "/dashboard";

  return (
    <>
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand-row">
          <Link
            href={homeHref}
            className="sidebar-brand"
            onClick={closeMobile}
            aria-label="TalentIQ home"
          >
            <span className="brand-mark">
              <Icon name="zap" size={19} strokeWidth={2.2} />
            </span>

            <span className="brand-text">
              Talent<span>IQ</span>
            </span>
          </Link>

          <span className="brand-caption">
            {isJobSeeker
              ? "CAREER INTELLIGENCE"
              : "TALENT INTELLIGENCE"}
          </span>
        </div>

        <nav className="sidebar-nav">
          {isJobSeeker ? (
            <NavSection
              title="Career"
              items={seekerWorkspaceItems}
              pathname={pathname}
              onNavigate={closeMobile}
            />
          ) : (
            <>
              <NavSection
                title="Workspace"
                items={recruiterWorkspaceItems}
                pathname={pathname}
                onNavigate={closeMobile}
              />

              <NavSection
                title="Intelligence"
                items={intelligenceItems}
                pathname={pathname}
                onNavigate={closeMobile}
              />
            </>
          )}

          {/* Shared navigation: visible for both roles */}
          <NavSection
            title="Preferences"
            items={settingsItems}
            pathname={pathname}
            onNavigate={closeMobile}
          />
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-assist-card">
            <div className="assist-icon">
              <Icon name="sparkles" size={16} />
            </div>

            <div className="assist-copy">
              <strong>
                {isJobSeeker
                  ? "Career insights"
                  : "Talent insights"}
              </strong>

              <span>
                {isJobSeeker
                  ? "Make your next move count."
                  : "Make every match count."}
              </span>
            </div>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-account">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: { width: 34, height: 34 },
                  userButtonTrigger: { borderRadius: 10 },
                },
              }}
            />

            <div className="user-text">
              <span className="account-name">Your account</span>
              <span className="account-caption">
                {isJobSeeker ? "Job seeker" : "Recruiter"}
              </span>
            </div>

            <span className="account-chevron">
              <Icon name="chevron-down" size={15} />
            </span>
          </div>
        </div>
      </aside>

      {isMobileOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          onClick={closeMobile}
          aria-label="Close navigation"
        />
      )}
    </>
  );
}
