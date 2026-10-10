"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function BriefcaseIcon() {
  return (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.196-3.773M9 20H4v-2a4 4 0 015.196-3.773M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0zM3 10a3 3 0 116 0 3 3 0 01-6 0z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0120 9.414V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function JdIcon() {
  return (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function MatchIcon() {
  return (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function RankIcon() {
  return (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
  { href: "/jobs", label: "Job Descriptions", icon: <BriefcaseIcon /> },
  { href: "/candidates", label: "Candidates", icon: <UsersIcon /> },
  { href: "/analyze/resume", label: "Resume Analyzer", icon: <ResumeIcon /> },
  { href: "/analyze/job", label: "JD Analyzer", icon: <JdIcon /> },
  { href: "/match", label: "Match Candidate", icon: <MatchIcon /> },
  { href: "/rank", label: "Rank & Shortlist", icon: <RankIcon /> },
  { href: "/search", label: "Candidate Search", icon: <SearchIcon /> },
];

function isItemActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="sidebar-header" style={{ padding: "20px 18px 16px" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#FF6129",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span
              className="brand-text"
              style={{
                fontWeight: 700,
                fontSize: "1.0625rem",
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
              }}
            >
              TalentIQ
            </span>
          </div>
        </Link>
      </div>

      <div className="divider" style={{ margin: "0 18px 12px", width: "calc(100% - 36px)" }} />

      {/* Nav List */}
      <nav style={{ flex: 1, padding: "0 0 16px" }}>
        <div className="section-title" style={{ padding: "0 22px", marginBottom: 6 }}>
          Workspace
        </div>
        {NAV_ITEMS.slice(0, 3).map((item) => {
          const active = isItemActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${active ? "active" : ""}`}
              title={item.label}
            >
              {item.icon}
              <span className="nav-text">{item.label}</span>
            </Link>
          );
        })}

        <div className="section-title" style={{ padding: "18px 22px 6px" }}>
          Analysis Tools
        </div>
        {NAV_ITEMS.slice(3).map((item) => {
          const active = isItemActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${active ? "active" : ""}`}
              title={item.label}
            >
              {item.icon}
              <span className="nav-text">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="divider" />
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: 32, height: 32 },
            },
          }}
        />
        <div className="user-text" style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>
          Account Active
        </div>
      </div>
    </aside>
  );
}
