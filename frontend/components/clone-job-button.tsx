"use client";

import { useState }
  from "react";

import { cloneJob }
  from "@/actions/clone-job";

export default function
CloneJobButton({
  jobId,
}: {
  jobId: string;
}) {

  const [loading,
    setLoading] =
    useState(false);

  async function handleClone() {

    try {

      setLoading(true);

      await cloneJob(
        jobId
      );

      window.location.reload();

    } finally {

      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClone}
      disabled={loading}
      className="px-3 py-1 border rounded-lg"
    >
      {loading
        ? "Cloning..."
        : "Clone"}
    </button>
  );
}