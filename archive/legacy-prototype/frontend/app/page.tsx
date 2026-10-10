"use client";

import { useState } from "react";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setResults(null);

      const resumeList = resumes
        .split("-----")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      if (!jobDescription.trim() || resumeList.length === 0) {
        alert("Please provide a job description and at least one resume.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rank`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_description: jobDescription,
            resumes: resumeList,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            AI Talent Intelligence Engine
          </h1>
          <p className="text-gray-600">
            Semantic, priority-aware resume ranking for modern hiring teams.
          </p>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <textarea
            className="w-full h-64 p-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Paste Job Description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <textarea
            className="w-full h-64 p-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Paste resumes separated by -----"
            value={resumes}
            onChange={(e) => setResumes(e.target.value)}
          />
        </div>

        {/* Analyze Button */}
        <div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
            className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? "Analyzing Candidates..." : "Analyze Candidates"}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <hr />
            <h2 className="text-2xl font-semibold text-gray-800">
              Ranking Results
            </h2>

            <p className="text-sm text-gray-500">
              Latency: {results.latency_seconds}s
            </p>

            {results.results.map((candidate: any, index: number) => (
              <div
                key={candidate.candidate_id}
                className="p-6 bg-white border rounded-2xl shadow-sm space-y-4"
              >
                {/* Candidate Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    #{index + 1} {candidate.candidate_id}
                  </h3>
                  <span className="text-sm font-medium text-gray-600">
                    Score: {candidate.final_score.toFixed(3)}
                  </span>
                </div>

                {/* Score Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all"
                    style={{
                      width: `${candidate.final_score * 100}%`,
                    }}
                  />
                </div>

                {/* Sub Scores */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Skill Score: {candidate.skill_score.toFixed(3)}</p>
                  <p>Experience Score: {candidate.experience_score.toFixed(3)}</p>
                </div>

                {/* Matched Skills */}
                <div>
                  <p className="font-medium mb-2">Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.matched_skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <p className="font-medium mb-2">Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missing_skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}