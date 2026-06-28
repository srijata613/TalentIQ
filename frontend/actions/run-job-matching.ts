"use server";

import { createSupabaseServerClient }
  from "@/lib/supabase-server";

export async function runJobMatching(
  jobId: string
) {

  const supabase =
    createSupabaseServerClient();

  // Load Job

  const { data: job } =
    await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

  if (!job) {
    throw new Error(
      "Job not found"
    );
  }

  // Load Latest Job Version

  const { data: version } =
    await supabase
      .from("job_versions")
      .select("*")
      .eq("job_id", jobId)
      .order(
        "version_number",
        {
          ascending: false,
        }
      )
      .limit(1)
      .single();

  if (!version) {
    throw new Error(
      "Job version not found"
    );
  }

  // Load Parsed Candidates

  const { data: candidates } =
    await supabase
      .from("candidates")
      .select("*")
      .eq(
        "organization_id",
        job.organization_id
      )
      .not(
        "resume_text",
        "is",
        null
      );

  if (
    !candidates ||
    candidates.length === 0
  ) {
    throw new Error(
      "No parsed candidates found"
    );
  }

  // Remove Previous Matches

  await supabase
    .from("candidate_matches")
    .delete()
    .eq(
      "job_id",
      jobId
    );

  const leaderboard = [];

  // Match Candidates

  for (
    const candidate
    of candidates
  ) {

    const response =
      await fetch(
        "http://127.0.0.1:8000/match",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            job_text:
              version.content,

            resume_text:
              candidate.resume_text,
          }),
        }
      );

    if (!response.ok) {

      console.error(
        "Matching failed for:",
        candidate.id
      );

      continue;
    }

    const result =
      await response.json();

    // Save Match Result

    await supabase
      .from(
        "candidate_matches"
      )
      .insert({

        job_id:
          jobId,

        candidate_id:
          candidate.id,

        final_score:
          result.final_score,

        grade:
          result.grade,

        recommendation:
          result.recommendation,

        skill_score:
          result.skill_score,

        experience_score:
          result.experience_score,

        education_score:
          result.education_score,

        bonus_score:
          result.bonus_score,

        leadership_score:
          result.leadership_score,

        communication_score:
          result.communication_score,

        domain_score:
          result.domain_score,

        certification_score:
          result.certification_score,

        industry_score:
          result.industry_score,

        growth_score:
          result.growth_score ?? 0,

        adaptability_score:
          result.adaptability_score ?? 0,

        behavioral_signals:
          result.behavioral_signals ?? {},

        implicit_skills:
          result.implicit_skills ?? [],

        matched_skills:
          result.matched_skills ?? [],

        missing_skills:
          result.missing_skills ?? [],

        strengths:
          result.strengths ?? [],

        weaknesses:
          result.weaknesses ?? [],

        explanation:
          result.explanation ?? {},

        risk_score:
          result.risk_score ?? 0,

        startup_fit:
          result.startup_fit ?? 0,

        enterprise_fit:
          result.enterprise_fit ?? 0,

        remote_fit:
          result.remote_fit ?? 0,

        leadership_fit:
          result.leadership_fit ?? 0,

        recommendations:
          result.recommendations ?? {},

         risk_assessment:
          result.risk_assessment ?? {},
      });

    leaderboard.push({

      candidate_id:
        candidate.id,

      candidate_name:
        candidate.parsed_name,

      score:
        result.final_score,

      grade:
        result.grade,

      recommendation:
        result.recommendation,
    });
  }

  // Sort Leaderboard

  leaderboard.sort(
    (a, b) =>
      b.score - a.score
  );

  return leaderboard;
}