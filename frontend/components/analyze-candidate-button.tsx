"use client";

import { useTransition } from "react";
import { analyzeCandidate } from "@/actions/analyze-candidate";

export default function AnalyzeCandidateButton({
  candidateId,
}: {
  candidateId: string;
}) {
  const [pending, startTransition] =
    useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await analyzeCandidate(
            candidateId
          );

          window.location.reload();
        })
      }
      disabled={pending}
      className="px-4 py-2 bg-green-600 text-white rounded-lg"
    >
      {pending
        ? "Analyzing..."
        : "Analyze Resume"}
    </button>
  );
}