"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/actions/create-job";
import Icon from "@/components/icon";

interface TemplateItem {
  id?: string;
  name?: string;
  content?: string;
  [key: string]: unknown;
}

export default function CreateJobForm({ templates }: { templates: TemplateItem[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!title.trim() || !description.trim()) {
      setError("Add a job title and job description before continuing.");
      return;
    }

    try {
      setLoading(true);
      const job = await createJob(title.trim(), description.trim());
      router.push(`/jobs/${job.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "The job could not be created. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="create-job-form" onSubmit={handleSubmit}>
      {templates.length > 0 && (
        <div>
          <label className="form-label" htmlFor="job-template">Start from a template <span className="optional-label">Optional</span></label>
          <select
            id="job-template"
            value={selectedTemplate}
            onChange={(event) => {
              const template = templates.find((item) => item.id === event.target.value);
              setSelectedTemplate(event.target.value);
              if (template) {
                setTitle(template.name ?? "");
                setDescription(template.content ?? "");
              }
            }}
            className="form-select"
          >
            <option value="">Choose a job template</option>
            {templates.map((template, index) => <option key={template.id || index} value={template.id || ""}>{template.name || "Untitled template"}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="form-label" htmlFor="job-title">Job title <span className="required-indicator">*</span></label>
        <input id="job-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Senior Machine Learning Engineer" className="form-input" maxLength={140} required />
        <p className="field-hint">Use the title candidates will recognize.</p>
      </div>

      <div>
        <div className="form-label-row"><label className="form-label" htmlFor="job-description">Job description <span className="required-indicator">*</span></label><span className="field-counter">{description.length.toLocaleString()} characters</span></div>
        <textarea id="job-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Paste the role summary, responsibilities, required skills, experience, and qualifications..." className="form-textarea job-description-input" required />
        <p className="field-hint">More detail helps TalentIQ identify requirements and explain candidate fit.</p>
      </div>

      {error && <div role="alert" className="form-error"><Icon name="x" size={15} />{error}</div>}

      <div className="form-submit-row">
        <span className="form-submit-note"><Icon name="shield-check" size={14} /> Saved to your organization workspace</span>
        <button type="submit" disabled={loading || !title.trim() || !description.trim()} className="btn btn-primary btn-lg">
          {loading ? <><span className="loading-spinner" /> Creating job…</> : <>Create job <Icon name="arrow-right" size={15} /></>}
        </button>
      </div>
    </form>
  );
}
