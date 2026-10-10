"use client";

import { useState } from "react";
import { analyzeJob } from "@/actions/analyze-job";
import { analyzeJobPdf } from "@/actions/analyze-job-pdf";
import Icon from "@/components/icon";

export default function AnalyzeJobButton({ jobId, content }: { jobId: string; content: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setError("");
    try {
      setLoading(true);
      if (content?.trim()) await analyzeJob(jobId, content);
      else await analyzeJobPdf(jobId);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Job analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-action-wrap">
      <button type="button" onClick={handleAnalyze} disabled={loading} className="btn btn-secondary">
        {loading ? <><span className="loading-spinner" /> Analyzing…</> : <><Icon name="sparkles" size={15} /> Analyze requirements</>}
      </button>
      {error && <span className="inline-action-error" role="alert">{error}</span>}
    </div>
  );
}
