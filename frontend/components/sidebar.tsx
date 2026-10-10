"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import Icon from "@/components/icon";
import { useSidebar } from "./sidebar-context";

type NavItem = { href: string; label: string; icon: ReactNode };

const workspaceItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <Icon name="layout-dashboard" /> },
  { href: "/jobs", label: "Jobs", icon: <Icon name="briefcase" /> },
  { href: "/candidates", label: "Candidates", icon: <Icon name="users" /> },
];

const intelligenceItems: NavItem[] = [
  { href: "/rank", label: "Match & Rank", icon: <Icon name="target" /> },
  { href: "/search", label: "Talent Search", icon: <Icon name="search" /> },
];

function isItemActive(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/jobs") return pathname === "/jobs" || pathname.startsWith("/jobs/");
  if (href === "/candidates") return pathname === "/candidates" || pathname.startsWith("/candidates/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({ title, items, pathname, onNavigate }: {
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
            {active && <span className="nav-active-dot" aria-hidden="true" />}
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand-row">
          <Link href="/dashboard" className="sidebar-brand" onClick={closeMobile} aria-label="TalentIQ overview">
            <span className="brand-mark"><Icon name="zap" size={19} strokeWidth={2.2} /></span>
            <span className="brand-text">Talent<span>IQ</span></span>
          </Link>
          <span className="brand-caption">TALENT INTELLIGENCE</span>
        </div>

        <nav className="sidebar-nav">
          <NavSection title="Workspace" items={workspaceItems} pathname={pathname} onNavigate={closeMobile} />
          <NavSection title="Intelligence" items={intelligenceItems} pathname={pathname} onNavigate={closeMobile} />
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-assist-card">
            <div className="assist-icon"><Icon name="sparkles" size={16} /></div>
            <div className="assist-copy">
              <strong>Talent insights</strong>
              <span>Make every match count.</span>
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
              <span className="account-caption">Workspace settings</span>
            </div>
            <span className="account-chevron"><Icon name="chevron-down" size={15} /></span>
          </div>
        </div>
      </aside>
      {isMobileOpen && (
        <button className="sidebar-backdrop" type="button" onClick={closeMobile} aria-label="Close navigation" />
      )}
    </>
  );
}
