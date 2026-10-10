"use client";

import Link from "next/link";
import { useSidebar } from "./sidebar-context";

export default function AppHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="icon-btn"
          title="Toggle Sidebar"
          aria-label="Toggle Sidebar"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
            TalentIQ
          </span>
          <span style={{ color: "var(--border)", fontSize: "0.8125rem" }}>/</span>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Workspace
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/analyze/resume" className="btn btn-primary btn-sm">
          + New Analysis
        </Link>
      </div>
    </header>
  );
}
