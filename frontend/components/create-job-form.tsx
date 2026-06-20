"use client";

import { useState } from "react";
import { createJob } from "../actions/create-job";

export default function CreateJobForm({
  templates,
}: {
  templates: any[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

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

      <select
        value={selectedTemplate}
        onChange={(e) => {
          const template = templates.find(
            (t) => t.id === e.target.value
          );

          setSelectedTemplate(e.target.value);
          if (template) {
            setTitle(template.name);
            setDescription(template.content);
            
          }
        }}
        className="w-full border p-3 rounded-lg"
      >
        <option value="">
          Select Template
        </option>

        {templates.map((template) => (
          <option
            key={template.id}
            value={template.id}
          >
            {template.name}
          </option>
        ))}
      </select>

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