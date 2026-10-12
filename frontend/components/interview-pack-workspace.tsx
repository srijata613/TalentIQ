"use client";

import { useState } from "react";
import {
  generateInterviewPack,
  type InterviewPack,
} from "@/actions/generate-interview-pack";

interface Props {
  jobId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
}

const QUESTION_SECTIONS = [
  {
    key: "technical_questions",
    title: "Technical questions",
    description:
      "Explore practical knowledge of skills relevant to the saved match.",
  },
  {
    key: "behavioral_questions",
    title: "Behavioral questions",
    description:
      "Ask for specific examples of collaboration, initiative, and leadership.",
  },
  {
    key: "risk_validation_questions",
    title: "Validation questions",
    description:
      "Clarify the uncertainties surfaced by the available matching evidence.",
  },
] as const;

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to generate the interview pack. Please try again.";
}

export default function InterviewPackWorkspace({
  jobId,
  candidateId,
  candidateName,
  jobTitle,
}: Props) {
  const [pack, setPack] = useState<InterviewPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const result = await generateInterviewPack(jobId, candidateId);
      setPack(result);
    } catch (generationError) {
      setError(errorMessage(generationError));
    } finally {
      setLoading(false);
    }
  }

  const questionCount = pack
    ? pack.technical_questions.length +
      pack.behavioral_questions.length +
      pack.risk_validation_questions.length
    : 0;

  return (
    <section className="glass workspace-panel">
      <div className="workspace-section-heading">
        <div>
          <span className="workspace-kicker">INTERVIEW GUIDE</span>
          <h2>Prepare the conversation</h2>
          <p className="workspace-muted">
            Generate and review questions for {candidateName} against{" "}
            {jobTitle}.
          </p>
        </div>
      </div>

      {!pack && (
        <div
          className="glass"
          style={{
            padding: 24,
            borderRadius: 12,
            marginTop: 16,
          }}
        >
          <div className="workspace-eyebrow">
            <span className="workspace-eyebrow-dot" />
            READY TO GENERATE
          </div>

          <h3 style={{ marginTop: 12 }}>
            Build a focused interview guide
          </h3>

          <p className="workspace-muted">
            TalentIQ will use this candidate&apos;s saved match evidence
            to prepare relevant focus areas, technical questions, and
            validation prompts. Generating the guide will not change
            recruiter decisions or matching scores.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleGenerate()}
            disabled={loading}
            style={{ marginTop: 12 }}
          >
            {loading ? "Generating interview guide…" : "Generate interview guide"}
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="shortlist-draft-notice"
          style={{
            marginTop: 16,
            borderLeft: "3px solid #ef4444",
          }}
        >
          <span aria-hidden="true">!</span>
          <p>{error}</p>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => void handleGenerate()}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      {pack && (
        <div style={{ marginTop: 20 }}>
          <div
            className="glass"
            style={{
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div className="workspace-eyebrow">
              <span className="workspace-eyebrow-dot" />
              ENGINE GUIDANCE
            </div>

            <h3 style={{ marginTop: 10 }}>
              {pack.interview_recommendation}
            </h3>

            <p className="workspace-muted">
              The recommendation is generated guidance, not a hiring
              decision. Review the candidate&apos;s actual experience and
              the evidence supporting the questions.
            </p>

            <div
              className="workspace-meta-row"
              style={{ marginTop: 14 }}
            >
              <span className="badge badge-brand">
                {pack.focus_areas.length} focus area
                {pack.focus_areas.length === 1 ? "" : "s"}
              </span>

              <span className="workspace-meta">
                {questionCount} question
                {questionCount === 1 ? "" : "s"} generated
              </span>
            </div>
          </div>

          <section style={{ marginBottom: 24 }}>
            <div className="workspace-section-heading">
              <div>
                <span className="workspace-kicker">DISCUSSION PLAN</span>
                <h2>Focus areas</h2>
              </div>
            </div>

            {pack.focus_areas.length > 0 ? (
              <div className="workspace-chip-list">
                {pack.focus_areas.map((area, index) => (
                  <span
                    key={`${area}-${index}`}
                    className="workspace-chip workspace-chip-brand"
                  >
                    {area}
                  </span>
                ))}
              </div>
            ) : (
              <p className="workspace-muted">
                The engine did not identify specific focus areas from the
                available match data.
              </p>
            )}
          </section>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {QUESTION_SECTIONS.map((section, sectionIndex) => {
              const questions = pack[section.key];

              return (
                <section
                  key={section.key}
                  className="glass"
                  style={{
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <div className="workspace-section-heading">
                    <div>
                      <span className="workspace-kicker">
                        SECTION {String(sectionIndex + 1).padStart(2, "0")}
                      </span>
                      <h2>{section.title}</h2>
                      <p className="workspace-muted">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {questions.length > 0 ? (
                    <ol
                      style={{
                        paddingLeft: 24,
                        margin: "20px 0 0",
                      }}
                    >
                      {questions.map((question, index) => (
                        <li
                          key={`${section.key}-${index}`}
                          style={{
                            paddingLeft: 6,
                            marginTop: index === 0 ? 0 : 16,
                            lineHeight: 1.7,
                          }}
                        >
                          {question}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p
                      className="workspace-muted"
                      style={{ marginTop: 16 }}
                    >
                      No questions were generated for this section from the
                      available saved match evidence. Do not infer a concern
                      simply because this section is empty.
                    </p>
                  )}
                </section>
              );
            })}
          </div>

          <div
            className="shortlist-review-footnote"
            style={{ marginTop: 24 }}
          >
            <span aria-hidden="true">ⓘ</span>
            <p>
              Review generated questions for relevance and fairness before
              using them in an interview. Ask candidates comparable,
              job-related questions and evaluate their answers against
              consistent criteria.
            </p>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleGenerate()}
              disabled={loading}
            >
              {loading ? "Regenerating…" : "Regenerate guide"}
            </button>
          </div>

          <p
            className="workspace-muted"
            style={{ marginTop: 12, fontSize: "0.75rem" }}
          >
            This guide is generated on demand and is not currently saved
            as a database record. You can regenerate it when needed.
          </p>
        </div>
      )}
    </section>
  );
}