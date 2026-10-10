"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runJobMatching } from "@/actions/run-job-matching";
import Icon from "@/components/icon";

export default function RunMatchingButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleMatching() {
    setError("");
    setPending(true);
    try {
      await runJobMatching(jobId);
      router.push(`/jobs/${jobId}/matches`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Matching failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inline-action-wrap">
      <button type="button" onClick={handleMatching} disabled={pending} className="btn btn-primary">
        {pending ? <><span className="loading-spinner" /> Matching…</> : <><Icon name="target" size={15} /> Run matching</>}
      </button>
      {error && <span className="inline-action-error" role="alert">{error}</span>}
    </div>
  );
}
