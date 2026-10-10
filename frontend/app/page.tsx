import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TalentIQ | Make better hiring decisions",
  description:
    "Turn resumes and job descriptions into explainable talent intelligence. Discover candidates, understand their fit, and make better-informed hiring decisions.",
};

function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <span className={`tiq-brand-mark${large ? " tiq-brand-mark-large" : ""}`}>
      <svg
        viewBox="0 0 24 24"
        width={large ? 25 : 21}
        height={large ? 25 : 21}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M13.5 2.5 5 13h6.2l-.8 8.5L19 10.5h-6.2l.7-8Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function FeatureIcon({ kind }: { kind: string }) {
  const paths: Record<string, React.ReactNode> = {
    resume: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),
    match: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </>
    ),
    ranking: (
      <>
        <path d="M4 19h16M6 15h3v4H6zM10.5 10h3v9h-3zM15 5h3v14h-3z" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
  };

  return (
    <span className="tiq-feature-icon">
      <svg
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths[kind] ?? paths.resume}
      </svg>
    </span>
  );
}

function DashboardPreview() {
  return (
    <div className="tiq-preview">
      <div className="tiq-preview-topbar">
        <div className="tiq-preview-brand">
          <BrandMark />
          <span>TalentIQ</span>
        </div>
        <span className="tiq-preview-workspace">Recruiting workspace</span>
        <span className="tiq-preview-avatar">R</span>
      </div>

      <div className="tiq-preview-content">
        <div className="tiq-preview-heading">
          <div>
            <span className="tiq-preview-overline">YOUR WORKSPACE</span>
            <h3>Talent at a glance.</h3>
            <p>Everything you need to evaluate talent.</p>
          </div>
          <span className="tiq-preview-add">＋ New job</span>
        </div>

        <div className="tiq-preview-metrics">
          <div className="tiq-preview-metric">
            <span>Active roles</span>
            <strong>12</strong>
            <span className="tiq-preview-metric-icon">▤</span>
          </div>
          <div className="tiq-preview-metric">
            <span>Talent pool</span>
            <strong>248</strong>
            <span className="tiq-preview-metric-icon">♙</span>
          </div>
          <div className="tiq-preview-metric">
            <span>Job matches</span>
            <strong>84</strong>
            <span className="tiq-preview-metric-icon">◎</span>
          </div>
        </div>

        <div className="tiq-preview-table">
          <div className="tiq-preview-table-heading">
            <strong>Candidate matches</strong>
            <span>Illustrative preview</span>
          </div>

          {[
            {
              initials: "AC",
              name: "Alex Chen",
              role: "Senior Python Engineer",
              score: 92,
            },
            {
              initials: "PS",
              name: "Priya Sharma",
              role: "Machine Learning Engineer",
              score: 86,
            },
            {
              initials: "DK",
              name: "Daniel Kim",
              role: "Backend Engineer",
              score: 79,
            },
          ].map((candidate) => (
            <div className="tiq-preview-row" key={candidate.name}>
              <span className="tiq-preview-candidate-avatar">
                {candidate.initials}
              </span>
              <span className="tiq-preview-candidate-copy">
                <strong>{candidate.name}</strong>
                <small>{candidate.role}</small>
              </span>
              <span className="tiq-preview-score">
                <span>{candidate.score}%</span>
                <span className="tiq-preview-score-track">
                  <span style={{ width: `${candidate.score}%` }} />
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="tiq-preview-footnote">
          <span>✦</span>
          Understand the fit, not just the score.
        </div>
      </div>
    </div>
  );
}

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  const features = [
    {
      kind: "resume",
      title: "Understand every resume",
      description:
        "Extract skills, experience, education, and qualifications into structured candidate profiles.",
    },
    {
      kind: "match",
      title: "Match with context",
      description:
        "Evaluate candidates against actual job requirements, with visibility into strengths and gaps.",
    },
    {
      kind: "ranking",
      title: "Compare with confidence",
      description:
        "Review ranked candidates, inspect their fit, and keep the recruiter in control of every decision.",
    },
    {
      kind: "search",
      title: "Discover relevant talent",
      description:
        "Find candidates using skills, experience, domain criteria, and semantic search.",
    },
  ];

  return (
    <main className="tiq-landing">
      <nav className="tiq-nav">
        <Link href="/" className="tiq-brand" aria-label="TalentIQ home">
          <BrandMark large />
          <span>Talent<span className="tiq-brand-accent">IQ</span></span>
        </Link>

        <div className="tiq-nav-links">
          <a href="#features">Platform</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <div className="tiq-nav-actions">
          <Link href="/sign-in" className="tiq-nav-signin">
            Sign in
          </Link>
          <Link href="/sign-up" className="tiq-button tiq-button-primary">
            Get started <ArrowIcon />
          </Link>
        </div>
      </nav>

      <section className="tiq-hero">
        <div className="tiq-hero-copy">

          <h1>
            Better talent.
            <br />
            <span>Better decisions.</span>
          </h1>

          <p className="tiq-hero-description">
            Recruitment is more than matching keywords. Understand the
            experience behind every resume, evaluate candidates against the
            role, and make informed hiring decisions.
          </p>

          <div className="tiq-hero-actions">
            <Link
              href="/sign-up"
              className="tiq-button tiq-button-primary tiq-button-large"
            >
              Explore TalentIQ <ArrowIcon />
            </Link>
            <Link
              href="/sign-in"
              className="tiq-button tiq-button-secondary tiq-button-large"
            >
              Sign in to workspace
            </Link>
          </div>
        </div>

        <div className="tiq-hero-visual">
          <div className="tiq-visual-glow" />
          <DashboardPreview />
          <div className="tiq-floating-note">
            <span className="tiq-floating-note-icon">✦</span>
            <span>
              <strong>More context, less guesswork</strong>
              <small>Built around real job requirements</small>
            </span>
          </div>
        </div>
      </section>

      <div className="tiq-capability-strip">
        <span>One workspace for the hiring process</span>
        <div>
          <span>Resume intelligence</span>
          <span>Candidate matching</span>
          <span>Talent discovery</span>
        </div>
      </div>

      <section className="tiq-features" id="features">
        <div className="tiq-section-heading">
          <span className="tiq-eyebrow">THE TALENTIQ WORKFLOW</span>
          <h2>
            From resumes to
            <br />
            <span>real hiring insight.</span>
          </h2>
          <p>
            Bring job requirements, candidate information, and AI-assisted
            evaluation together in one focused workspace.
          </p>
        </div>

        <div className="tiq-feature-grid">
          {features.map((feature, index) => (
            <article className="tiq-feature-card" key={feature.title}>
              <div className="tiq-feature-card-top">
                <FeatureIcon kind={feature.kind} />
                <span className="tiq-feature-number">
                  0{index + 1}
                </span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tiq-how" id="how-it-works">
        <div>
          <span className="tiq-eyebrow">A CLEARER PROCESS</span>
          <h2>Keep the hiring process connected.</h2>
          <p>
            Start with a job, build your talent pool, and evaluate candidates
            in the context of the role you are hiring for.
          </p>
        </div>

        <div className="tiq-steps">
          {[
            ["01", "Define the role", "Add or import a job description."],
            ["02", "Build your talent pool", "Upload resumes and review parsed profiles."],
            ["03", "Evaluate the fit", "Compare matching evidence and make your decision."],
          ].map(([number, title, description]) => (
            <div className="tiq-step" key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tiq-final-cta">
        <div className="tiq-final-cta-copy">
          <span className="tiq-eyebrow">YOUR NEXT HIRING DECISION</span>
          <h2>Start with a clearer picture of your talent.</h2>
          <p>
            Bring your roles and candidate profiles into a workspace designed
            around recruiter decisions.
          </p>
        </div>

        <Link
          href="/sign-up"
          className="tiq-button tiq-button-primary tiq-button-large"
        >
          Get started <ArrowIcon />
        </Link>
      </section>

      <footer className="tiq-footer">
        <Link href="/" className="tiq-brand tiq-footer-brand">
          <BrandMark />
          <span>Talent<span className="tiq-brand-accent">IQ</span></span>
        </Link>
        <div>
          <Link href="/sign-in">Sign in</Link>
          <Link href="/sign-up">Create account</Link>
        </div>
      </footer>
    </main>
  );
}