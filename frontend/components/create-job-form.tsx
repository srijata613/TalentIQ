"use client";

import { useState } from "react";
import { createJob } from "../actions/create-job";

interface TemplateItem {
  id?: string;
  name?: string;
  content?: string;
  [key: string]: unknown;
}

export default function CreateJobForm({
  templates,
}: {
  templates: TemplateItem[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  async function handleSubmit() {
    if (!title || !description) {
      alert("Please enter a job title and description");
      return;
    }

    try {
      setLoading(true);

      await createJob(title, description);

      setTitle("");
      setDescription("");
      setSelectedTemplate("");
      window.location.href = "/jobs";
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {templates.length > 0 && (
        <div>
          <label className="form-label">Import Preset Template (Optional)</label>
          <select
            value={selectedTemplate}
            onChange={(e) => {
              const template = templates.find((t) => t.id === e.target.value);
              setSelectedTemplate(e.target.value);
              if (template) {
                setTitle(template.name ?? "");
                setDescription(template.content ?? "");
              }
            }}
            className="form-select"
          >
            <option value="">Select Template</option>
            {templates.map((template, idx) => (
              <option key={template.id || idx} value={template.id || ""}>
                {template.name || "Untitled Template"}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="form-label">Job Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Machine Learning Engineer"
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">Job Description Text</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste full job description content, responsibilities, and requirements..."
          className="form-textarea"
          style={{ minHeight: 280 }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSubmit}
          disabled={loading || !title || !description}
          className="btn btn-primary btn-lg"
        >
          {loading ? "Creating Job..." : "Post Job Opening"}
        </button>
      </div>
    </div>
  );
}