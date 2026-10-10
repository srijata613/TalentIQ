"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  getExperienceRoleStorageKey,
  type ExperienceRole,
} from "@/lib/experience-role";

function RecruiterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
    </svg>
  );
}

function JobSeekerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="8" r="4" />
      <path d="M3 21v-2a7 7 0 0 1 14 0v2M18 8h4M20 6v4" />
    </svg>
  );
}

export default function RoleSelectionPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  function chooseRole(role: ExperienceRole) {
    if (!isLoaded || !user?.id) return;

    window.localStorage.setItem(
      getExperienceRoleStorageKey(user.id),
      role,
    );

    router.replace(
      role === "recruiter" ? "/dashboard" : "/seeker/dashboard",
    );
  }

  return (
    <main className="role-onboarding-page">
      <section className="role-onboarding-shell">
        <a href="/" className="role-brand" aria-label="TalentIQ home">
          <span className="role-brand-mark">↗</span>
          <span>
            Talent<span>IQ</span>
          </span>
        </a>

        <div className="role-onboarding-heading">
          <span className="role-eyebrow">YOUR TALENTIQ EXPERIENCE</span>
          <h1>
            What brings you
            <br />
            <span>here today?</span>
          </h1>
          <p>
            Choose your workspace. We&apos;ll tailor your dashboard and
            tools to what you want to accomplish.
          </p>
        </div>

        <div className="role-option-grid">
          <button
            type="button"
            className="role-option-card"
            onClick={() => chooseRole("recruiter")}
            disabled={!isLoaded || !user?.id}
          >
            <span className="role-option-icon">
              <RecruiterIcon />
            </span>
            <span className="role-option-eyebrow">
              FOR TEAMS AND EMPLOYERS
            </span>
            <span className="role-option-title">I&apos;m hiring</span>
            <span className="role-option-description">
              Create job roles, discover candidates, compare matches,
              and manage your shortlist.
            </span>
            <span className="role-option-footer">
              Enter recruiter workspace <span aria-hidden="true">→</span>
            </span>
          </button>

          <button
            type="button"
            className="role-option-card"
            onClick={() => chooseRole("job-seeker")}
            disabled={!isLoaded || !user?.id}
          >
            <span className="role-option-icon">
              <JobSeekerIcon />
            </span>
            <span className="role-option-eyebrow">
              FOR YOUR NEXT CAREER MOVE
            </span>
            <span className="role-option-title">
              I&apos;m looking for a job
            </span>
            <span className="role-option-description">
              Explore opportunities, save jobs, track applications,
              and prepare for interviews.
            </span>
            <span className="role-option-footer">
              Enter career workspace <span aria-hidden="true">→</span>
            </span>
          </button>
        </div>

        <p className="role-onboarding-note">
          You can change this preference later. Your choice personalizes
          the experience on this browser.
        </p>
      </section>
    </main>
  );
}