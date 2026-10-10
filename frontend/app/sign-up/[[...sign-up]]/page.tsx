import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account | TalentIQ",
  description: "Create your TalentIQ recruitment workspace account.",
};

export default function SignUpPage() {
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
              START YOUR WORKSPACE
            </span>

            <h1>
              Make room for
              <br />
              <span>better hiring.</span>
            </h1>

            <p>
              Give your recruitment process a clearer view of candidate
              experience, relevant skills, and role-specific fit.
            </p>

            <div className="tiq-auth-benefits">
              <div>
                <span className="tiq-auth-benefit-icon">01</span>
                <span>
                  <strong>Organize roles and candidates</strong>
                  <small>Keep important recruitment information together.</small>
                </span>
              </div>

              <div>
                <span className="tiq-auth-benefit-icon">02</span>
                <span>
                  <strong>Use your existing job criteria</strong>
                  <small>Understand what each position actually requires.</small>
                </span>
              </div>

              <div>
                <span className="tiq-auth-benefit-icon">03</span>
                <span>
                  <strong>Make evidence-informed decisions</strong>
                  <small>Review AI insights without giving up human judgment.</small>
                </span>
              </div>
            </div>
          </div>

          <span className="tiq-auth-side-footer">
            Your talent workspace starts here.
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
              <span className="tiq-eyebrow">GET STARTED</span>
              <h2>Create your account</h2>
              <p>Set up your account to enter the TalentIQ workspace.</p>
            </div>

            <div className="tiq-clerk-card">
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                fallbackRedirectUrl="/onboarding/role"
                forceRedirectUrl="/onboarding/role"
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
              Already have an account? <Link href="/sign-in">Sign in</Link>
            </div>

            <div className="tiq-auth-bottom-note">
              Keep applicant data private and use AI-generated insights as
              decision support, not as automatic hiring decisions.
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}