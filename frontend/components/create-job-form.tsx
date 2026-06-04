"use client";

import { useState } from "react";
import { createJob } from "../actions/create-job";

export default function CreateJobForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    try {
      setLoading(true);

      await createJob(title, description);

      window.location.href = "/jobs";
    } catch (error) {
      console.error(error);
      alert("Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold">
        Create Job
      </h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Senior ML Engineer"
        className="w-full border p-3 rounded-lg"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Paste Job Description..."
        className="w-full border p-3 rounded-lg h-80"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded-lg"
      >
        {loading ? "Creating..." : "Create Job"}
      </button>
    </div>
  );
}