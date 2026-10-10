"use client";

import { useState } from "react";
import { analyzeCandidate } from "@/actions/analyze-candidate";
import Icon from "@/components/icon";

export default function AnalyzeCandidateButton({ candidateId }: { candidateId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setError("");
    setPending(true);
    try {
      await analyzeCandidate(candidateId);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume analysis failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inline-action-wrap">
      <button type="button" onClick={handleAnalyze} disabled={pending} className="btn btn-secondary">
        {pending ? <><span className="loading-spinner" /> Analyzing…</> : <><Icon name="sparkles" size={15} /> Analyze resume</>}
      </button>
      {error && <span className="inline-action-error" role="alert">{error}</span>}
    </div>
  );
}
