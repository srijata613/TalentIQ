import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Overview | TalentIQ",
};

const upcomingFeatures = [
  {
    number: "01",
    title: "Discover opportunities",
    description:
      "Browse relevant roles and explore your next career move.",
  },
  {
    number: "02",
    title: "Keep track of jobs",
    description:
      "Organize your saved opportunities and application activity.",
  },
  {
    number: "03",
    title: "Prepare with purpose",
    description:
      "Build confidence with structured, role-based interview practice.",
  },
];

export default function SeekerDashboardPage() {
  return (
    <div className="seeker-home">
      <div className="seeker-home-heading">
        <span className="role-eyebrow">YOUR CAREER WORKSPACE</span>
        <h1>
          Your next move
          <span> starts here.</span>
        </h1>
        <p>
          One place to explore opportunities, organize your search,
          and prepare for the interviews ahead.
        </p>
      </div>

      <section className="seeker-welcome-panel">
        <div>
          <span className="role-eyebrow">A LITTLE PROGRESS, EVERY DAY</span>
          <h2>Build momentum on your career journey.</h2>
          <p>
            Your personalized Job Feed and interview preparation
            workspace are the next steps in this experience.
          </p>
        </div>
        <div className="seeker-welcome-mark" aria-hidden="true">
          ↗
        </div>
      </section>

      <div className="seeker-section-heading">
        <div>
          <h2>Your toolkit</h2>
          <p>Everything you need for your next career move.</p>
        </div>
        <span className="seeker-preview-label">WORKSPACE PREVIEW</span>
      </div>

      <div className="seeker-toolkit-grid">
        {upcomingFeatures.map((feature) => (
          <article className="seeker-toolkit-card" key={feature.number}>
            <span className="seeker-toolkit-number">{feature.number}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <span className="seeker-toolkit-status">Coming in the next phase</span>
          </article>
        ))}
      </div>
    </div>
  );
}