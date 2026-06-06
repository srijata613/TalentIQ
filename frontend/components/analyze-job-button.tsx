"use client";

import { useState } from "react";
import { analyzeJob } from "@/actions/analyze-job";
import {
  analyzeJobPdf,
} from "@/actions/analyze-job-pdf";

export default function AnalyzeJobButton({
  jobId,
  content,
}: {
  jobId: string;
  content: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    try {
      setLoading(true);

      if (
        content &&
        content.length > 0
      ) {
        
        await analyzeJob(
          jobId,
          content
        );
      
      } else {
        
        await analyzeJobPdf(
          jobId
        );
      
      }

      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAnalyze}
      disabled={loading}
      className="px-4 py-2 bg-black text-white rounded-lg"
    >
      {loading
        ? "Analyzing..."
        : "Analyze JD"}
    </button>
  );
}