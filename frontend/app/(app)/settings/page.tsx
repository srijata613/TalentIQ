
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Icon from "@/components/icon";
import { useExperienceRole } from "@/components/experience-role-context";
import {
  getExperienceRoleStorageKey,
  type ExperienceRole,
} from "@/lib/experience-role";

interface SettingsValues {
  headline: string;
  location: string;
  targetRole: string;
  workMode: string;
  experienceLevel: string;
  company: string;
  teamRole: string;
  matchThreshold: number;
  profileVisibility: string;
  notifications: {
    jobRecommendations: boolean;
    applicationReminders: boolean;
    careerTips: boolean;
    hiringUpdates: boolean;
    shortlistReminders: boolean;
  };
  compactDensity: boolean;
  reduceMotion: boolean;
}

const DEFAULT_SETTINGS: SettingsValues = {
  headline: "",
  location: "",
  targetRole: "",
  workMode: "Any",
  experienceLevel: "Any",
  company: "",
  teamRole: "Recruiter",
  matchThreshold: 70,
  profileVisibility: "Private",
  notifications: {
    jobRecommendations: true,
    applicationReminders: true,
    careerTips: false,
    hiringUpdates: true,
    shortlistReminders: true,
  },
  compactDensity: false,
  reduceMotion: false,
};

function loadSettings(key: string): SettingsValues {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<SettingsValues>;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(parsed.notifications ?? {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { role, setRole, isPreferenceLoaded } = useExperienceRole();
  const router = useRouter();

  const [values, setValues] = useState<SettingsValues>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeSection, setActiveSection] = useState("profile");

  const storageKey = user?.id
    ? `talentiq:settings:${user.id}`
    : null;

  useEffect(() => {
    if (!isLoaded || !isPreferenceLoaded) return;

    if (!storageKey) {
      setSettingsLoaded(true);
      return;
    }

    setValues(loadSettings(storageKey));
    setSettingsLoaded(true);
  }, [isLoaded, isPreferenceLoaded, storageKey]);

  useEffect(() => {
    document.documentElement.dataset.density =
      values.compactDensity ? "compact" : "comfortable";

    document.documentElement.dataset.reduceMotion =
      values.reduceMotion ? "true" : "false";
  }, [values.compactDensity, values.reduceMotion]);

  function updateValue<K extends keyof SettingsValues>(
    key: K,
    value: SettingsValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function updateNotification(
    key: keyof SettingsValues["notifications"],
    checked: boolean,
  ) {
    setValues((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [key]: checked,
      },
    }));
    setNotice("");
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!storageKey) {
      setNotice("Sign in to save preferences in this browser.");
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(values));
    setNotice("Your preferences have been saved in this browser.");
  }

  function changeExperience(nextRole: ExperienceRole) {
    if (nextRole === role) return;

    setRole(nextRole);
    router.push(
      nextRole === "recruiter" ? "/dashboard" : "/seeker/dashboard",
    );
  }

  const sections = [
    { id: "profile", label: "Profile", icon: "users" as const },
    { id: "preferences", label: "Preferences", icon: "filter" as const },
    { id: "notifications", label: "Notifications", icon: "bell" as const },
    { id: "appearance", label: "Appearance", icon: "grid" as const },
    { id: "privacy", label: "Privacy", icon: "shield-check" as const },
  ];

  if (!isLoaded || !isPreferenceLoaded || !settingsLoaded) {
    return <div className="settings-loading">Loading your settings…</div>;
  }

  return (
    <div className="settings-page">
      <header className="settings-page-heading">
        <span className="role-eyebrow">YOUR WORKSPACE</span>
        <h1>Settings<span>.</span></h1>
        <p>
          Make TalentIQ fit the way you work and the goals you want to reach.
        </p>
      </header>

      <div className="settings-layout">
        <aside className="settings-navigation" aria-label="Settings sections">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`settings-nav-item ${
                activeSection === section.id ? "is-active" : ""
              }`}
              onClick={() => {
                setActiveSection(section.id);
                document.getElementById(section.id)?.scrollIntoView({
                  behavior: values.reduceMotion ? "auto" : "smooth",
                  block: "start",
                });
              }}
            >
              <Icon name={section.icon} size={17} />
              <span>{section.label}</span>
              {activeSection === section.id && (
                <span className="settings-nav-indicator" />
              )}
            </button>
          ))}

          <div className="settings-local-note">
            <Icon name="shield-check" size={16} />
            <p>
              Settings are stored in this browser. They are not synced to
              your TalentIQ account.
            </p>
          </div>
        </aside>

        <form className="settings-content" onSubmit={saveSettings}>
          <section className="settings-section" id="profile">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                <Icon name="users" size={19} />
              </div>
              <div>
                <h2>Profile</h2>
                <p>Your account identity and workspace details.</p>
              </div>
            </div>

            <div className="settings-account-card">
              <div className="settings-avatar">
                {(
                  user?.fullName?.trim() ||
                  user?.primaryEmailAddress?.emailAddress ||
                  "T"
                ).slice(0, 1).toUpperCase()}
              </div>
              <div className="settings-account-identity">
                <strong>{user?.fullName || "TalentIQ user"}</strong>
                <span>
                  {user?.primaryEmailAddress?.emailAddress ||
                    "Email not available"}
                </span>
                <small>Account identity managed by Clerk</small>
              </div>
              <span className="settings-managed-badge">Account</span>
            </div>

            <div className="settings-fields-grid">
              <label className="settings-field">
                <span>Professional headline</span>
                <input
                  value={values.headline}
                  onChange={(event) =>
                    updateValue("headline", event.target.value)
                  }
                  placeholder={
                    role === "job-seeker"
                      ? "e.g. Software Engineer seeking new opportunities"
                      : "e.g. Talent Acquisition"
                  }
                  maxLength={120}
                />
                <small>Local profile preference, not a public profile.</small>
              </label>

              <label className="settings-field">
                <span>
                  {role === "job-seeker"
                    ? "Preferred location"
                    : "Company or organization"}
                </span>
                <input
                  value={role === "job-seeker" ? values.location : values.company}
                  onChange={(event) =>
                    updateValue(
                      role === "job-seeker" ? "location" : "company",
                      event.target.value,
                    )
                  }
                  placeholder={
                    role === "job-seeker"
                      ? "e.g. Kolkata or Remote"
                      : "e.g. Company name"
                  }
                  maxLength={120}
                />
              </label>
            </div>
          </section>

          <section className="settings-section" id="preferences">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                <Icon name="filter" size={19} />
              </div>
              <div>
                <h2>Workspace preferences</h2>
                <p>
                  Choose your experience and configure relevant defaults.
                </p>
              </div>
            </div>

            <div className="settings-role-grid">
              <button
                type="button"
                className={`settings-role-card ${
                  role === "recruiter" ? "is-active" : ""
                }`}
                onClick={() => changeExperience("recruiter")}
                aria-pressed={role === "recruiter"}
              >
                <Icon name="briefcase" size={21} />
                <span>
                  <strong>Recruiter</strong>
                  <small>Jobs, candidates, matching, and shortlists.</small>
                </span>
                {role === "recruiter" && <Icon name="check" size={17} />}
              </button>

              <button
                type="button"
                className={`settings-role-card ${
                  role === "job-seeker" ? "is-active" : ""
                }`}
                onClick={() => changeExperience("job-seeker")}
                aria-pressed={role === "job-seeker"}
              >
                <Icon name="users" size={21} />
                <span>
                  <strong>Job seeker</strong>
                  <small>Opportunities, saved jobs, and interview prep.</small>
                </span>
                {role === "job-seeker" && <Icon name="check" size={17} />}
              </button>
            </div>

            {role === "job-seeker" ? (
              <div className="settings-fields-grid">
                <label className="settings-field">
                  <span>Target role</span>
                  <input
                    value={values.targetRole}
                    onChange={(event) =>
                      updateValue("targetRole", event.target.value)
                    }
                    placeholder="e.g. Frontend Developer"
                    maxLength={100}
                  />
                </label>

                <label className="settings-field">
                  <span>Preferred work mode</span>
                  <select
                    value={values.workMode}
                    onChange={(event) =>
                      updateValue("workMode", event.target.value)
                    }
                  >
                    <option>Any</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </label>

                <label className="settings-field">
                  <span>Experience level</span>
                  <select
                    value={values.experienceLevel}
                    onChange={(event) =>
                      updateValue("experienceLevel", event.target.value)
                    }
                  >
                    <option>Any</option>
                    <option>Student</option>
                    <option>Fresher</option>
                    <option>0–2 years</option>
                    <option>3–5 years</option>
                    <option>6+ years</option>
                  </select>
                </label>
              </div>
            ) : (
              <div className="settings-fields-grid">
                <label className="settings-field">
                  <span>Workspace role</span>
                  <select
                    value={values.teamRole}
                    onChange={(event) =>
                      updateValue("teamRole", event.target.value)
                    }
                  >
                    <option>Recruiter</option>
                    <option>Talent Acquisition</option>
                    <option>Hiring Manager</option>
                    <option>HR Professional</option>
                  </select>
                </label>

                <label className="settings-field">
                  <span>Default match threshold: {values.matchThreshold}%</span>
                  <input
                    type="range"
                    min={50}
                    max={95}
                    step={5}
                    value={values.matchThreshold}
                    onChange={(event) =>
                      updateValue("matchThreshold", Number(event.target.value))
                    }
                  />
                  <small>
                    Saved as a preference only; existing matching behavior
                    is unchanged.
                  </small>
                </label>
              </div>
            )}
          </section>

          <section className="settings-section" id="notifications">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                <Icon name="bell" size={19} />
              </div>
              <div>
                <h2>Notifications</h2>
                <p>Choose which updates you want to keep enabled.</p>
              </div>
            </div>

            <div className="settings-toggle-list">
              {(role === "job-seeker"
                ? [
                    {
                      key: "jobRecommendations" as const,
                      title: "Job recommendations",
                      description:
                        "Show preference for updates about matching opportunities.",
                    },
                    {
                      key: "applicationReminders" as const,
                      title: "Application reminders",
                      description:
                        "Keep reminders enabled for your job search workflow.",
                    },
                    {
                      key: "careerTips" as const,
                      title: "Career tips",
                      description:
                        "Opt in to career guidance and interview preparation updates.",
                    },
                  ]
                : [
                    {
                      key: "hiringUpdates" as const,
                      title: "Hiring activity",
                      description:
                        "Keep recruiter workflow update preferences enabled.",
                    },
                    {
                      key: "shortlistReminders" as const,
                      title: "Shortlist reminders",
                      description:
                        "Keep reminders for candidate review preferences enabled.",
                    },
                  ]
              ).map((item) => (
                <label className="settings-toggle-row" key={item.key}>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={values.notifications[item.key]}
                    onChange={(event) =>
                      updateNotification(item.key, event.target.checked)
                    }
                  />
                </label>
              ))}
            </div>
            <p className="settings-inline-note">
              These are local preferences. No email, push, or in-app
              notifications are sent by these toggles.
            </p>
          </section>

          <section className="settings-section" id="appearance">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                <Icon name="grid" size={19} />
              </div>
              <div>
                <h2>Appearance and accessibility</h2>
                <p>Adjust the density and motion of the interface.</p>
              </div>
            </div>

            <div className="settings-toggle-list">
              <label className="settings-toggle-row">
                <span>
                  <strong>Compact density</strong>
                  <small>
                    Reduce spacing in supported settings components.
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={values.compactDensity}
                  onChange={(event) =>
                    updateValue("compactDensity", event.target.checked)
                  }
                />
              </label>

              <label className="settings-toggle-row">
                <span>
                  <strong>Reduce motion</strong>
                  <small>
                    Reduce animation and transition effects across the
                    interface.
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={values.reduceMotion}
                  onChange={(event) =>
                    updateValue("reduceMotion", event.target.checked)
                  }
                />
              </label>
            </div>

            <div className="settings-preview-note">
              The existing dark-and-orange theme is retained. Theme switching
              is not included in this phase.
            </div>
          </section>

          <section className="settings-section" id="privacy">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                <Icon name="shield-check" size={19} />
              </div>
              <div>
                <h2>Privacy and data</h2>
                <p>Understand what these frontend settings control.</p>
              </div>
            </div>

            <label className="settings-field">
              <span>Profile visibility preference</span>
              <select
                value={values.profileVisibility}
                onChange={(event) =>
                  updateValue("profileVisibility", event.target.value)
                }
              >
                <option>Private</option>
                <option>Visible</option>
              </select>
              <small>
                This is a local preference only. It does not change visibility
                to recruiters or alter account access.
              </small>
            </label>

            <div className="settings-privacy-card">
              <Icon name="shield-check" size={19} />
              <div>
                <strong>Your account remains managed by Clerk.</strong>
                <p>
                  Sign-in details and identity are managed separately.
                  Preferences on this page are stored in this browser and
                  are not synced across devices.
                </p>
              </div>
            </div>
          </section>

          <div className="settings-save-bar">
            <span role="status">
              {notice || "Changes are saved when you select Save preferences."}
            </span>
            <button type="submit" className="settings-save-button">
              <Icon name="check" size={17} />
              Save preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
