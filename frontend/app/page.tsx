import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {/* Brand Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#FF6129",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "#FFFFFF",
          }}
        >
          TalentIQ
        </span>
      </div>

      {/* Hero Headline */}
      <h1
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: 800,
          lineHeight: 1.15,
          maxWidth: 750,
          margin: "0 0 20px",
          color: "#FFFFFF",
        }}
      >
        AI-Powered{" "}
        <span style={{ color: "#FF6129" }}>
          Talent Intelligence
        </span>{" "}
        Platform
      </h1>

      <p
        style={{
          fontSize: "1.125rem",
          color: "#A1A1AA",
          maxWidth: 580,
          lineHeight: 1.7,
          margin: "0 0 48px",
        }}
      >
        Parse resumes, analyze job descriptions, and match candidates with
        semantic precision. Built for recruiters who want real intelligence, not
        just keyword matching.
      </p>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
        <Link
          href="/sign-in"
          className="btn btn-primary btn-lg"
          style={{ minWidth: 160 }}
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="btn btn-secondary btn-lg"
          style={{ minWidth: 160 }}
        >
          Create Account
        </Link>
      </div>

      {/* Features Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          maxWidth: 860,
          width: "100%",
        }}
      >
        {[
          { icon: <DocumentIcon />, title: "Resume Analysis", desc: "Deep parsing of skills, experience, and credentials" },
          { icon: <TargetIcon />, title: "Smart Matching", desc: "Semantic scoring across 6 dimensions" },
          { icon: <TrophyIcon />, title: "Candidate Ranking", desc: "Batch ranking with explainable scores" },
          { icon: <SearchIcon />, title: "Candidate Search", desc: "Filter by skills, domain, and fit score" },
        ].map((f) => (
          <div key={f.title} className="glass" style={{ padding: "24px 20px", textAlign: "left", borderRadius: 12 }}>
            <div style={{ marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "#FFFFFF", marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: "0.8125rem", color: "#A1A1AA", lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </main>
  );
}