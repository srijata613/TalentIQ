"use client";

import { useState } from "react";
import Link from "next/link";
import CreateJobForm from "@/components/create-job-form";
import ImportJobUrlForm from "@/components/import-job-url-form";
import UploadJobPdfForm from "@/components/upload-job-pdf-form";
import Icon from "@/components/icon";

type TemplateItem = { id?: string; name?: string; content?: string; [key: string]: unknown };
type InputMode = "paste" | "url" | "pdf";

const inputOptions: Array<{ id: InputMode; title: string; description: string; icon: "file-text" | "search" | "upload" }> = [
  { id: "paste", title: "Paste description", description: "Add the job details directly.", icon: "file-text" },
  { id: "url", title: "Import from URL", description: "Extract details from a job page.", icon: "search" },
  { id: "pdf", title: "Upload a PDF", description: "Use an existing job specification.", icon: "upload" },
];

export default function CreateJobWorkspace({ templates }: { templates: TemplateItem[] }) {
  const [mode, setMode] = useState<InputMode>("paste");
  return (
    <div className="create-job-workspace">
      <div className="create-job-methods" aria-label="Choose job input method">
        {inputOptions.map((option) => (
          <button key={option.id} type="button" aria-pressed={mode === option.id} className={`create-method-card${mode === option.id ? " selected" : ""}`} onClick={() => setMode(option.id)}>
            <span className="create-method-icon"><Icon name={option.icon} size={19} /></span>
            <span className="create-method-copy"><strong>{option.title}</strong><span>{option.description}</span></span>
            <span className="create-method-arrow"><Icon name="chevron-right" size={16} /></span>
          </button>
        ))}
      </div>
      <div className="create-job-form-panel" role="region" aria-label="Job creation form">
        <div className="create-form-heading">
          <div><h2>{mode === "paste" ? "Job details" : mode === "url" ? "Import a job page" : "Upload a job specification"}</h2><p>{mode === "paste" ? "Create a saved role using its description." : mode === "url" ? "Provide the public URL and a title for this role." : "Upload a PDF to create a role from an existing document."}</p></div>
          <span className="step-chip"><span className="step-chip-dot" /> New role</span>
        </div>
        {mode === "paste" && <CreateJobForm templates={templates} />}
        {mode === "url" && <ImportJobUrlForm />}
        {mode === "pdf" && <UploadJobPdfForm />}
      </div>
      <div className="create-job-footnote"><Icon name="sparkles" size={15} /><span>After your role is saved, analyze its requirements and review candidate matches from the job workspace.</span><Link href="/jobs" className="text-link">All jobs <Icon name="arrow-right" size={13} /></Link></div>
    </div>
  );
}
