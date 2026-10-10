import { getJobMatches } from "@/actions/get-job-matches";
import ScoreRing from "@/components/score-ring";
import ScoreBar from "@/components/score-bar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Job Candidate Matches" };

export default async function JobMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matches = await getJobMatches(id);

  return (
    <div>
      {/* Header & Back Link */}
      <div style={{ marginBottom: 24 }}>
        <Link href={`/jobs/${id}`} className="back-link">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Job Detail
        </Link>
        <h1 className="page-title">Candidate Match Leaderboard</h1>
        <p className="page-subtitle">Ranked candidates based on 6-dimension AI alignment score</p>
      </div>

      {(!matches || matches.length === 0) ? (
        <div className="glass" style={{ padding: "56px 24px", textAlign: "center", borderRadius: 12 }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: 8, color: "#FFFFFF" }}>No matches run yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 24, maxWidth: 460, margin: "0 auto 24px" }}>
            Run candidate matching on this job description to view semantic scores across all 6 dimensions.
          </p>
          <Link href={`/jobs/${id}`} className="btn btn-primary">
            Return to Job Detail
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {matches.map((match: Record<string, unknown>, index: number) => {
            const candidate = match.candidates as Record<string, unknown> | undefined;
            const candidateName = (candidate?.parsed_name as string) || `Candidate #${index + 1}`;
            const candidateEmail = (candidate?.parsed_email as string) || "";
            const finalScore = Math.round(((match.final_score as number) ?? 0) * 100);
            const recommendationStr = (match.recommendation as string) || "";
            const gradeStr = (match.grade as string) || "";

            return (
              <div key={String(match.id ?? index)} className="glass" style={{ padding: 24, borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: index === 0 ? "#FF6129" : "#71717A",
                      minWidth: 32,
                    }}>
                      #{index + 1}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: "1.125rem", color: "#FFFFFF" }}>{candidateName}</h3>
                      {candidateEmail && (
                        <span style={{ fontSize: "0.8125rem", color: "#A1A1AA" }}>{candidateEmail}</span>
                      )}
                      {Boolean(recommendationStr) && (
                        <div style={{ marginTop: 6 }}>
                          <span className={`badge ${
                            recommendationStr === "Strong Match" ? "badge-brand" :
                            recommendationStr === "Moderate Match" ? "badge-indigo" : "badge-gray"
                          }`}>
                            {recommendationStr}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <ScoreRing score={finalScore} size={72} strokeWidth={6} label={gradeStr} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 20 }}>
                  <ScoreBar label="Skills Alignment" score={Math.round(((match.skill_score as number) ?? 0) * 100)} />
                  <ScoreBar label="Experience" score={Math.round(((match.experience_score as number) ?? 0) * 100)} />
                  <ScoreBar label="Domain Fit" score={Math.round(((match.domain_score as number) ?? 0) * 100)} />
                  <ScoreBar label="Leadership" score={Math.round(((match.leadership_score as number) ?? 0) * 100)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
