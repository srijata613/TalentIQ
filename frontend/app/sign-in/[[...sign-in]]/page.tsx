import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | TalentIQ",
  description: "Sign in to your TalentIQ recruitment workspace.",
};

export default function SignInPage() {
  return (
    <main className="tiq-auth-page">
      <section className="tiq-auth-layout">
        <aside className="tiq-auth-story">
          <Link href="/" className="tiq-brand">
            <span className="tiq-brand-mark tiq-brand-mark-large">
              <svg viewBox="0 0 24 24" width="25" height="25" fill="none">
                <path
                  d="M13.5 2.5 5 13h6.2l-.8 8.5L19 10.5h-6.2l.7-8Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span>
              Talent<span className="tiq-brand-accent">IQ</span>
            </span>
          </Link>

          <div className="tiq-auth-story-content">
            <span className="tiq-eyebrow">
              YOUR HIRING WORKSPACE
            </span>

            <h1>
              Find the right
              <br />
              <span>talent, faster.</span>
            </h1>

            <p>
              Bring job requirements, resumes, and candidate intelligence
              together. Spend less time sorting information and more time
              making informed hiring decisions.
            </p>

            <div className="tiq-auth-benefits">
              <div>
                <span className="tiq-auth-benefit-icon">01</span>
                <span>
                  <strong>Understand candidate profiles</strong>
                  <small>Structured experience, skills, and qualifications.</small>
                </span>
              </div>

              <div>
                <span className="tiq-auth-benefit-icon">02</span>
                <span>
                  <strong>Evaluate job-specific fit</strong>
                  <small>See strengths and gaps against the role.</small>
                </span>
              </div>

              <div>
                <span className="tiq-auth-benefit-icon">03</span>
                <span>
                  <strong>Keep decisions human-led</strong>
                  <small>Use AI findings to support recruiter judgment.</small>
                </span>
              </div>
            </div>
          </div>

          <span className="tiq-auth-side-footer">
            Talent intelligence, designed around people.
          </span>
        </aside>

        <section className="tiq-auth-form-side">
          <div className="tiq-auth-mobile-brand">
            <Link href="/" className="tiq-brand">
              <span className="tiq-brand-mark">
                <svg viewBox="0 0 24 24" width="21" height="21" fill="none">
                  <path
                    d="M13.5 2.5 5 13h6.2l-.8 8.5L19 10.5h-6.2l.7-8Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>
                Talent<span className="tiq-brand-accent">IQ</span>
              </span>
            </Link>
          </div>

          <div className="tiq-auth-form-container">
            <div className="tiq-auth-form-heading">
              <span className="tiq-eyebrow">WELCOME BACK</span>
              <h2>Sign in to TalentIQ</h2>
              <p>Pick up where your hiring work left off.</p>
            </div>

            <div className="tiq-clerk-card">
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/dashboard"
                forceRedirectUrl="/dashboard"
                appearance={{
                  variables: {
                    colorPrimary: "#FF6129",
                    colorBackground: "#111114",
                    colorText: "#F4F4F5",
                    colorTextSecondary: "#A1A1AA",
                    colorInputBackground: "#0B0B0E",
                    colorInputText: "#F4F4F5",
                    borderRadius: "10px",
                    fontFamily: "Inter, sans-serif",
                  },
                  elements: {
                    rootBox: {
                      width: "100%",
                    },
                    cardBox: {
                      width: "100%",
                      boxShadow: "none",
                    },
                    card: {
                      width: "100%",
                      padding: "0",
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                    },
                    headerTitle: {
                      display: "none",
                    },
                    headerSubtitle: {
                      display: "none",
                    },
                    socialButtonsBlockButton: {
                      color: "#E4E4E7",
                      background: "#17171B",
                      border: "1px solid #34343B",
                    },
                    socialButtonsBlockButtonText: {
                      color: "#E4E4E7",
                      fontSize: "13px",
                    },
                    dividerLine: {
                      background: "#2B2B32",
                    },
                    dividerText: {
                      color: "#85858F",
                    },
                    formFieldLabel: {
                      color: "#B4B4BD",
                      fontSize: "12px",
                    },
                    formFieldInput: {
                      minHeight: "42px",
                      color: "#F4F4F5",
                      background: "#0B0B0E",
                      border: "1px solid #34343B",
                    },
                    formButtonPrimary: {
                      minHeight: "43px",
                      color: "#FFFFFF",
                      background: "#FF6129",
                      fontSize: "13px",
                      fontWeight: 650,
                    },
                    footerAction: {
                      display: "none",
                    },
                    footer: {
                      display: "none",
                    },
                    identityPreview: {
                      background: "#17171B",
                      border: "1px solid #34343B",
                    },
                  },
                }}
              />
            </div>

            <div className="tiq-auth-switch">
              New to TalentIQ? <Link href="/sign-up">Create an account</Link>
            </div>

            <div className="tiq-auth-bottom-note">
              By continuing, you agree to use TalentIQ responsibly and keep
              candidate information confidential.
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}